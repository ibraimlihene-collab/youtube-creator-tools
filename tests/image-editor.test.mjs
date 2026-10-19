import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { compositeProtected, decodeImage, GeminiImageProvider, RunwareImageProvider, createImageProvider, makeEditorHandler, readInput } from '../netlify/functions/_shared/image-editor.mjs';

const size = { width: 4, height: 3, channels: 4 };
async function image(color, dimensions = size) { return sharp({ create: { ...dimensions, background: color } }).png().toBuffer(); }
async function eventFor(fields, headers = {}) {
  const form = new FormData();
  for (const [key,value] of Object.entries(fields)) form.append(key, Buffer.isBuffer(value) ? new Blob([value], { type: 'image/png' }) : value, ...(Buffer.isBuffer(value) ? [`${key}.png`] : []));
  const request = new Request('http://localhost', { method: 'POST', body: form });
  return { httpMethod: 'POST', headers: { 'content-type': request.headers.get('content-type'), 'x-forwarded-for': crypto.randomUUID(), ...headers }, body: Buffer.from(await request.arrayBuffer()).toString('base64'), isBase64Encoded: true };
}
async function fixture() {
  const original = await image('#123456');
  const rawMask = Buffer.alloc(4*3*4, 0); for(let i=0;i<12;i++)rawMask[i*4+3]=255;
  for(const p of [0,1,5])rawMask.set([255,255,255,255],p*4);
  const mask = await sharp(rawMask,{raw:size}).png().toBuffer();
  const lock = Buffer.alloc(4*3*4, 0);for(let i=0;i<12;i++)lock[i*4+3]=255;lock.set([255,255,255,255],4);
  const protectedMask=await sharp(lock,{raw:size}).png().toBuffer();
  return { image:original, mask, protectedMask, prompt:'Change only the selection',selectionMode:'brush' };
}

test('multipart edit preserves every unselected pixel and explicit lock exactly', async()=>{
  const input=await readInput(await eventFor(await fixture()),true);
  assert.equal(input.effective.filter(v=>v>0).length,2);
  const result=await decodeImage(await compositeProtected(input,await image('#f09020')));
  for(let p=0;p<12;p++)assert.deepEqual([...result.data.subarray(p*4,p*4+4)],input.effective[p]?[240,144,32,255]:[18,52,86,255]);
});
test('transparent white pixels are not considered selected',async()=>{
  const fields=await fixture();fields.mask=await image({r:255,g:255,b:255,alpha:0});
  await assert.rejects(async()=>readInput(await eventFor(fields),true),/Select an editable region/);
});
test('empty and fully locked masks reject before any provider call',async()=>{
  const fields=await fixture();fields.mask=await image('#000');await assert.rejects(async()=>readInput(await eventFor(fields),true),/Select an editable region/);
  fields.mask=await image('#fff');fields.protectedMask=await image('#fff');await assert.rejects(async()=>readInput(await eventFor(fields),true),/Select an editable region/);
});
test('invalid files, mask dimensions, prompt and selection mode reject',async()=>{
  const fields=await fixture();
  for(const override of [{image:Buffer.from('not an image')},{mask:await image('#fff',{width:2,height:2,channels:4})},{prompt:''},{prompt:'x'.repeat(2001)},{selectionMode:'bogus'}])await assert.rejects(async()=>readInput(await eventFor({...fields,...override}),true));
  await assert.rejects(()=>decodeImage(Buffer.from('<svg></svg>')));
});
test('provider output with a different crop is rejected',async()=>{
  const input=await readInput(await eventFor(await fixture()),true);
  await assert.rejects(async()=>compositeProtected(input,await image('#fff',{width:2,height:2,channels:4})),/aspect ratio/);
});
test('native provider resolution with matching aspect is aligned without altering protected pixels',async()=>{
  const input=await readInput(await eventFor(await fixture()),true);
  const result=await decodeImage(await compositeProtected(input,await image('#fff',{width:8,height:6,channels:4})));
  assert.equal(result.width,4);assert.equal(result.height,3);
  assert.deepEqual([...result.data.subarray(0,4)],[255,255,255,255]);
  assert.deepEqual([...result.data.subarray(4,8)],[18,52,86,255]);
});
test('edit and two variations pass through the same protected compositing pipeline',async()=>{
  const fake = { editImage:()=>image('#fff'),generateVariations:async()=>[await image('#fff'),await image('#00ff00')] };
  for(const operation of ['edit','variations']){
    const response=await makeEditorHandler(operation,()=>fake)(await eventFor(await fixture()));assert.equal(response.statusCode,200);const data=JSON.parse(response.body);assert.equal(data.images.length,operation==='edit'?1:2);
    for(const src of data.images){const result=await decodeImage(Buffer.from(src.split(',')[1],'base64'));assert.deepEqual([...result.data.subarray(4,8)],[18,52,86,255]);}
  }
});
test('analyze returns validated and sanitized region suggestions',async()=>{
  const payload={candidates:[{content:{parts:[{text:JSON.stringify({regions:[{label:'Person',kind:'subject',box:[0,0,.5,.5]},{label:'Bad',kind:'text',box:[.9,.9,.5,.5]},{label:'Bogus',kind:'other',box:[0,0,1,1]}]})}]}}]};
  const provider=new GeminiImageProvider({apiKey:'test-only',fetchImpl:async()=>({ok:true,json:async()=>payload})});
  const response=await makeEditorHandler('analyze',()=>provider)(await eventFor({image:await image('#123456')}));assert.equal(response.statusCode,200);assert.equal(JSON.parse(response.body).regions.length,1);
});
test('missing key, provider failure and safety rejection return safe messages',async()=>{
  const fields=await fixture();
  const provider = new GeminiImageProvider({ apiKey:'' });
  const response=await makeEditorHandler('edit',()=>provider)(await eventFor(fields));assert.equal(response.statusCode,503);
  const failing=new GeminiImageProvider({apiKey:'private-test-secret',fetchImpl:async()=>({ok:false,status:403,json:async()=>({secret:'private-test-secret'})})});
  const failed=await makeEditorHandler('edit',()=>failing)(await eventFor(fields));assert.equal(failed.statusCode,502);assert.ok(!failed.body.includes('private-test-secret'));
  const unsafe=await makeEditorHandler('edit',()=>({editImage(){throw new Error('credential should never leak');}}))(await eventFor(fields));assert.equal(unsafe.statusCode,500);assert.ok(!unsafe.body.includes('credential'));
  const blocked=new GeminiImageProvider({apiKey:'test',fetchImpl:async()=>({ok:true,json:async()=>({candidates:[]})})});assert.equal((await makeEditorHandler('edit',()=>blocked)(await eventFor(fields))).statusCode,502);
});
test('method, origin and oversized request are rejected',async()=>{
  const handler=makeEditorHandler('edit');assert.equal((await handler({httpMethod:'GET',headers:{}})).statusCode,405);
  const previous=process.env.ALLOWED_ORIGINS;process.env.ALLOWED_ORIGINS='https://allowed.example';try{assert.equal((await handler(await eventFor(await fixture(),{origin:'https://other.example'}))).statusCode,403);}finally{if(previous===undefined)delete process.env.ALLOWED_ORIGINS;else process.env.ALLOWED_ORIGINS=previous;}
  assert.equal((await handler({httpMethod:'POST',headers:{'content-type':'multipart/form-data; boundary=x','x-forwarded-for':crypto.randomUUID()},body:Buffer.alloc(6*1024*1024+1).toString('base64'),isBase64Encoded:true})).statusCode,413);
});

test('provider quota and throttling stay distinct from the local limiter without exposing provider errors', async () => {
  for (const [body, code] of [
    [{error:{details:[{'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'test-quota'}]}],message:'private-provider-detail'}},'GEMINI_QUOTA_EXCEEDED'],
    [{error:{message:'private-provider-detail'}},'GEMINI_RATE_LIMITED'],
    [null,'GEMINI_RATE_LIMITED'],
  ]) {
    const provider = new GeminiImageProvider({apiKey:'test',fetchImpl:async()=>Response.json(body,{status:429})});
    const response = await makeEditorHandler('edit',()=>provider)(await eventFor(await fixture()));
    assert.equal(response.statusCode,429);
    assert.equal(JSON.parse(response.body).code,code);
    assert.ok(!response.body.includes('private-provider-detail'));
  }
  const event = await eventFor(await fixture());
  const previous = process.env.IMAGE_RATE_LIMIT_PER_MINUTE;
  process.env.IMAGE_RATE_LIMIT_PER_MINUTE = '1';
  let calls = 0;
  try {
    const handler = makeEditorHandler('edit',()=>({editImage(){calls++;return image('#fff');}}));
    assert.equal((await handler(event)).statusCode,200);
    const blocked = await handler(event);
    assert.equal(blocked.statusCode,429);
    assert.equal(JSON.parse(blocked.body).code,'RATE_LIMIT');
    assert.equal(calls,1);
  } finally {
    if(previous===undefined)delete process.env.IMAGE_RATE_LIMIT_PER_MINUTE;
    else process.env.IMAGE_RATE_LIMIT_PER_MINUTE=previous;
  }
});


test('Runware Muse sends references server-side and composites native 2K results without changing locked pixels', async () => {
  const fields=await fixture();
  const generated=await image('#40a0f0',{width:2048,height:1536,channels:4});
  const tasks=[];
  const provider=new RunwareImageProvider({apiKey:'private-runware-key',fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.runware.ai/v1');
    assert.equal(options.headers.Authorization,'Bearer private-runware-key');
    const [task]=JSON.parse(options.body);tasks.push(task);
    assert.equal(task.model,'meta:muse@image');assert.equal(task.resolution,'2K');
    assert.equal(task.outputType,'base64Data');assert.equal(task.inputs.referenceImages.length,2);
    assert.ok(task.inputs.referenceImages.every(src=>src.startsWith('data:image/png;base64,')));
    assert.ok(!options.body.includes('private-runware-key'));
    return Response.json({data:[{taskType:'imageInference',taskUUID:task.taskUUID,imageBase64Data:generated.toString('base64')}]});
  }});
  for(const operation of ['edit','variations']){
    const response=await makeEditorHandler(operation,()=>provider)(await eventFor(fields));
    assert.equal(response.statusCode,200);
    const data=JSON.parse(response.body);assert.equal(data.images.length,operation==='edit'?1:2);
    for(const src of data.images){
      const result=await decodeImage(Buffer.from(src.split(',')[1],'base64'));
      for(let p=0;p<12;p++)assert.deepEqual([...result.data.subarray(p*4,p*4+4)],[0,5].includes(p)?[64,160,240,255]:[18,52,86,255]);
    }
  }
  assert.equal(new Set(tasks.map(task=>task.taskUUID)).size,3);
});

test('Runware errors are classified safely, including errors in HTTP 200 responses', async()=>{
  for(const [status,body,code] of [
    [401,{errors:[{code:'invalidApiKey',message:'private-provider-secret'}]},'RUNWARE_AUTH_FAILED'],
    [200,{errors:[{code:'insufficientCredits',message:'private-provider-secret'}]},'RUNWARE_CREDITS'],
    [429,{},'RUNWARE_RATE_LIMITED'],[400,{errors:[{code:'providerBadRequest'}]},'RUNWARE_FAILED'],
    [200,{data:[]},'RUNWARE_FAILED'],[200,null,'RUNWARE_FAILED'],
  ]){
    const provider=new RunwareImageProvider({apiKey:'test',fetchImpl:async()=>Response.json(body,{status})});
    const result=await makeEditorHandler('edit',()=>provider)(await eventFor(await fixture()));
    assert.equal(JSON.parse(result.body).code,code);assert.ok(!result.body.includes('private-provider-secret'));
  }
  const missing=new RunwareImageProvider({apiKey:''});
  assert.equal(JSON.parse((await makeEditorHandler('edit',()=>missing)(await eventFor(await fixture()))).body).code,'RUNWARE_NOT_CONFIGURED');
  const broken=new RunwareImageProvider({apiKey:'test',fetchImpl:async()=>{throw new Error('private-secret');}});
  assert.equal(JSON.parse((await makeEditorHandler('edit',()=>broken)(await eventFor(await fixture()))).body).code,'RUNWARE_FAILED');
});

test('provider selection and health report image editing separately from Gemini analysis',async()=>{
  const names=['IMAGE_PROVIDER','RUNWARE_API_KEY','Runware_api_key','GEMINI_API_KEY'];const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  try {
    delete process.env.IMAGE_PROVIDER;process.env.RUNWARE_API_KEY='test';delete process.env.GEMINI_API_KEY;
    assert.ok(createImageProvider() instanceof RunwareImageProvider);
    const {handler}=await import('../netlify/functions/health.mjs');
    const health=JSON.parse((await handler({httpMethod:'GET',headers:{}})).body);
    assert.equal(health.imageProvider,'runware');assert.equal(health.imageEditing,true);assert.equal(health.imageAnalysis,false);assert.ok(!JSON.stringify(health).includes('test'));
    process.env.IMAGE_PROVIDER='gemini';assert.ok(createImageProvider() instanceof GeminiImageProvider);
    process.env.IMAGE_PROVIDER='invalid';assert.throws(()=>createImageProvider(),/Unknown image provider/);
  } finally {for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];}}
});


test('default editing never falls back to Gemini when the Runware key is absent',async()=>{
  const names=['IMAGE_PROVIDER','RUNWARE_API_KEY','Runware_api_key','GEMINI_API_KEY'];const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  try {
    delete process.env.IMAGE_PROVIDER;delete process.env.RUNWARE_API_KEY;delete process.env.Runware_api_key;process.env.GEMINI_API_KEY='configured-gemini-key';
    assert.ok(createImageProvider() instanceof RunwareImageProvider);
    const {handler}=await import('../netlify/functions/health.mjs');
    const health=JSON.parse((await handler({httpMethod:'GET',headers:{}})).body);
    assert.equal(health.imageProvider,'runware');assert.equal(health.imageEditing,false);assert.equal(health.imageAnalysis,true);
    for(const operation of ['edit','variations']){
      const response=await makeEditorHandler(operation)(await eventFor(await fixture()));
      assert.equal(response.statusCode,503);assert.equal(JSON.parse(response.body).code,'RUNWARE_NOT_CONFIGURED');
      assert.ok(!response.body.includes('Gemini'));
    }
  }finally{for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];}}
});


test('the existing mixed-case Runware variable configures both provider and health safely',async()=>{
  const names=['RUNWARE_API_KEY','Runware_api_key','IMAGE_PROVIDER'];const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  try {
    delete process.env.RUNWARE_API_KEY;delete process.env.IMAGE_PROVIDER;process.env.Runware_api_key='  saved-test-key  ';
    assert.equal(createImageProvider().apiKey,'saved-test-key');
    const {handler}=await import('../netlify/functions/health.mjs');
    const health=JSON.parse((await handler({httpMethod:'GET',headers:{}})).body);
    assert.equal(health.imageProvider,'runware');assert.equal(health.imageEditing,true);assert.ok(!JSON.stringify(health).includes('saved-test-key'));
    process.env.RUNWARE_API_KEY=' canonical-test-key ';assert.equal(createImageProvider().apiKey,'canonical-test-key');
    process.env.RUNWARE_API_KEY=' ';assert.equal(createImageProvider().apiKey,'saved-test-key');
  }finally{for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];}}
});

test('whole-person replacement sends the identity reference as image three for edits and both variations',async()=>{
  const fields={...await fixture(),editMode:'person',prompt:'',referenceImage:await image('#fa80cc',{width:3,height:4,channels:4})};
  let calls=0;
  const provider=new RunwareImageProvider({apiKey:'test-face-key',fetchImpl:async(url,options)=>{
    const [task]=JSON.parse(options.body);calls++;
    assert.equal(task.inputs.referenceImages.length,3);
    assert.match(task.positivePrompt,/THIRD image is the identity reference/);
    assert.match(task.positivePrompt,/Replace the ENTIRE selected person/);
    assert.match(task.positivePrompt,/not a face swap or a blend/);
    assert.match(task.positivePrompt,/Do not attach the reference head to the original person/);
    assert.match(task.positivePrompt,/if the reference is only a portrait/);
    const reference=await decodeImage(Buffer.from(task.inputs.referenceImages[2].split(',')[1],'base64'));
    assert.equal(reference.width,3);assert.equal(reference.height,4);assert.deepEqual([...reference.data.subarray(0,4)],[250,128,204,255]);
    return Response.json({data:[{taskType:'imageInference',taskUUID:task.taskUUID,imageBase64Data:(await image('#f09020')).toString('base64')}]});
  }});
  for(const operation of ['edit','variations']){
    const response=await makeEditorHandler(operation,()=>provider)(await eventFor(fields));
    assert.equal(response.statusCode,200);const data=JSON.parse(response.body);
    assert.equal(data.images.length,operation==='edit'?1:2);
    for(const src of data.images){
      const result=await decodeImage(Buffer.from(src.split(',')[1],'base64'));
      for(let p=0;p<12;p++)assert.deepEqual([...result.data.subarray(p*4,p*4+4)],[0,5].includes(p)?[240,144,32,255]:[18,52,86,255]);
    }
  }
  assert.equal(calls,3);
});

test('invalid or absent identity references and modes reject before a provider is invoked',async()=>{
  const fields={...await fixture(),editMode:'person',referenceImage:await image('#fa80cc')};
  let calls=0;const handler=makeEditorHandler('edit',()=>{calls++;throw new Error('must not reach provider');});
  for(const override of [{referenceImage:undefined},{referenceImage:'not-a-file'},{referenceImage:Buffer.from('invalid image')},{referenceImage:Buffer.alloc(2*1024*1024+1)},{editMode:'unknown'},{editMode:'selective'}]){
    const input={...fields,...override};if(input.referenceImage===undefined)delete input.referenceImage;
    assert.equal((await handler(await eventFor(input))).statusCode,400);
  }
  assert.equal(calls,0);
  const input=await readInput(await eventFor(fields),false);
  assert.equal(input.referenceImage,undefined);
});

test('Gemini opt-in also receives the third identity image for person edits',async()=>{
  const input=await readInput(await eventFor({...await fixture(),editMode:'person',referenceImage:await image('#fa80cc')}),true);
  const provider=new GeminiImageProvider({apiKey:'test',fetchImpl:async(url,options)=>{
    const body=JSON.parse(options.body);assert.equal(body.contents[0].parts.length,4);assert.match(body.contents[0].parts[0].text,/THIRD image is the identity reference/);
    return Response.json({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:(await image('#f09020')).toString('base64')}}]}}]});
  }});
  assert.ok((await provider.editImage(input)).length>0);
});

test('previously loaded face-mode clients use whole-person instructions too',async()=>{
  const input=await readInput(await eventFor({...await fixture(),editMode:'face',prompt:'',referenceImage:await image('#fa80cc')}),true);
  assert.equal(input.editMode,'person');
  assert.match(input.prompt,/entire selected person/);
});
