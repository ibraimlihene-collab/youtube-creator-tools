import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { compositeProtected, decodeImage, GeminiImageProvider, makeEditorHandler, readInput } from '../netlify/functions/_shared/image-editor.mjs';

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
