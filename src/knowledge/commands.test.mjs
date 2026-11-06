import {describe,test,expect} from 'bun:test';
import {draftCommand,notionPageId,paragraphBlocks,searchCommandPages,prepareCommand,executeCommand,commandResult,handleCommand} from '../../netlify/functions/_brain/commands.mjs';
import {handleBrain,sessionCookie} from '../../netlify/functions/_brain/http.mjs';
import {emptyCommand,readCommand,withCommand,parseOperation} from './command-state';
import {freshWorkspace,validateWorkspace,makeEntry} from './model';

const env={KNOWLEDGE_OWNER_PASSWORD:'test-owner-password-long-enough',KNOWLEDGE_OWNER_EMAIL:'owner@example.test',COMPOSIO_API_KEY:'test-composio',COMPOSIO_USER_ID:'existing-user',GEMINI_API_KEY:'test-gemini'};
const pageId='12345678-1234-1234-1234-123456789abc',botId='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const page={object:'page',id:pageId,properties:{title:{type:'title',title:[{plain_text:'Cours — مراجعة'}]}}};
function store() {
 const values=new Map();let version=0;
 return {async createCommand(value){if(values.has(value.id))throw new Error('duplicate');values.set(value.id,{value:structuredClone(value),etag:String(++version)});},
  async readCommand(id){return structuredClone(values.get(id)||null);},
  async writeCommand(value,etag){if(values.get(value.id)?.etag!==etag)throw Object.assign(new Error('cloudConflict'),{code:'cloudConflict',status:409});const next=String(++version);values.set(value.id,{value:structuredClone(value),etag:next});return next;}};
}
async function withProvider(fn,{write,account='notion-account',target=page,search}={}) {
 const old=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,options={})=>{
  if(String(url).includes('/connected_accounts?'))return Response.json({items:[{id:account,status:'ACTIVE',toolkit:{slug:'notion'},user_id:'existing-user'}]});
  const body=JSON.parse(options.body);calls.push(body);
  if(body.endpoint.endsWith('/users/me'))return Response.json({status:200,data:{object:'user',type:'bot',id:botId,bot:{workspace_name:'Test workspace'}}});
  if(body.endpoint.endsWith('/search'))return Response.json({status:200,data:search||{results:[page],has_more:false}});
  if(body.method==='PATCH')return write?write(body):Response.json({status:200,data:{results:body.body.children.map(()=>({object:'block',id:botId}))}});
  return Response.json({status:200,data:target});
 };
 try{await fn(calls);}finally{globalThis.fetch=old;}
}
describe('command drafts and local portability',()=>{
 test('draft selection persists without including unrelated private records',()=>{
  const ws=freshWorkspace(),journal={...makeEntry('journal','ar'),title:'يوميات خاصة',content:'PRIVATE JOURNAL'};
  const draft={...emptyCommand(),instruction:'أضف ملخصًا إلى Notion',source:'La gravitation',output:'الجاذبية'};
  const next=withCommand({...ws,records:[journal]},draft);
  expect(validateWorkspace(next)).toBe(true);expect(readCommand(JSON.parse(JSON.stringify(next)).records)).toEqual(draft);
  expect(next.records.find(e=>e.id==='uko-assistant-command').content).not.toContain(journal.content);
  expect(next.records.find(e=>e.id===journal.id)).toEqual(journal);
  expect(readCommand([{id:'uko-assistant-command',content:'broken'}])).toEqual(emptyCommand());
  expect(parseOperation({status:'succeeded'})).toBeNull();
 });
 test('Gemini requires explicit consent and returns a bounded supported proposal only',async()=>{
  let calls=0;
  const fetcher=async(url,options)=>{calls++;const request=JSON.parse(options.body);expect(request).not.toHaveProperty('tools');expect(request.contents[0].parts[0].text).toContain('untrustedSource');return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({intent:'append_notion',text:'Proposition',query:'Cours'})}]}}]});};
  await expect(draftCommand({instruction:'Add to Notion',source:'Source'},env,fetcher)).rejects.toMatchObject({code:'commandConsentRequired'});expect(calls).toBe(0);
  expect(await draftCommand({instruction:'Add to Notion',source:'Source',consent:true},env,fetcher)).toMatchObject({text:'Proposition',query:'Cours'});expect(calls).toBe(1);
  for(const answer of [{intent:'unsupported',text:'',query:''},{intent:'append_notion',text:'x'.repeat(8001),query:''},{intent:'append_notion',text:'okay',query:'',endpoint:'https://evil.test'}])await expect(draftCommand({instruction:'Add to Notion',source:'data',consent:true},env,async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(answer)}]}}]}))).rejects.toBeInstanceOf(Error);
  await expect(draftCommand({instruction:'Add to Notion',source:'data',consent:true},env,async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[]}}]}))).rejects.toMatchObject({code:'commandInvalidDraft'});
 });
 test('page input cannot cause arbitrary URL fetching; Unicode blocks respect Notion limits',()=>{
  expect(notionPageId('https://www.notion.so/Cours-'+pageId.replaceAll('-','')+'?pvs=4')).toBe(pageId);
  for(const bad of ['https://evil.test/'+pageId,'https://notion.so.evil.test/'+pageId,'http://notion.so/'+pageId,'https://a:b@notion.so/'+pageId,'../../secrets'])expect(()=>notionPageId(bad)).toThrow();
  const content='😀ع'.repeat(2500),blocks=paragraphBlocks(content);expect(blocks.map(b=>b.paragraph.rich_text[0].text.content).join('')).toBe(content);
  for(const block of blocks)expect(block.paragraph.rich_text[0].text.content.length).toBeLessThanOrEqual(2000);
 });
});
describe('bounded Notion commands and immutable execution',()=>{
 test('search uses actual cursors and returns safe page links only',async()=>withProvider(async calls=>{
  const result=await searchCommandPages({query:'Cours',cursor:'page-two'},env);
  expect(result.pages).toEqual([{id:pageId,title:'Cours — مراجعة',url:'https://www.notion.so/'+pageId.replaceAll('-','')}]);
  expect(calls.find(c=>c.endpoint.endsWith('/search')).body.start_cursor).toBe('page-two');expect(calls.every(c=>c.endpoint.startsWith('https://api.notion.com/v1/'))).toBe(true);
 }));
 test('prepare needs consent, verifies page, encryptable immutable snapshot and no writes',async()=>withProvider(async calls=>{
  const ledger=store();await expect(prepareCommand({pageId,content:'Exact text'},env,ledger)).rejects.toMatchObject({code:'commandConsentRequired'});
  const {operation}=await prepareCommand({pageId,content:'نص / texte',consent:true},env,ledger);
  expect(operation.status).toBe('prepared');expect(operation).not.toHaveProperty('accountId');expect(operation).not.toHaveProperty('COMPOSIO_API_KEY');
  expect((await ledger.readCommand(operation.id)).value.content).toBe('نص / texte');expect(calls.some(c=>c.method==='PATCH')).toBe(false);expect(parseOperation(operation)).toEqual(operation);
 }));
 test('exact approved text and target append once; repeated execution returns original receipt',async()=>withProvider(async calls=>{
  const ledger=store(),{operation}=await prepareCommand({pageId,content:'Approved text',consent:true},env,ledger);
  await expect(executeCommand({id:operation.id,confirm:false},env,ledger)).rejects.toMatchObject({code:'commandConfirmationRequired'});
  await expect(executeCommand({id:operation.id,confirm:true,content:'tampered'},env,ledger)).rejects.toMatchObject({code:'invalidData'});
  const first=await executeCommand({id:operation.id,confirm:true},env,ledger),again=await executeCommand({id:operation.id,confirm:true},env,ledger);
  expect(first.operation.status).toBe('succeeded');expect(again).toEqual(first);expect(parseOperation(first.operation)).toEqual(first.operation);
  const writes=calls.filter(c=>c.method==='PATCH');expect(writes).toHaveLength(1);expect(writes[0].endpoint).toBe(`https://api.notion.com/v1/blocks/${pageId}/children`);expect(writes[0].body.children[0].paragraph.rich_text[0].text.content).toBe('Approved text');
 }));
 test('concurrent execution is guarded by durable compare-and-swap',async()=>withProvider(async calls=>{
  const ledger=store(),{operation}=await prepareCommand({pageId,content:'One write',consent:true},env,ledger);
  const results=await Promise.allSettled([executeCommand({id:operation.id,confirm:true},env,ledger),executeCommand({id:operation.id,confirm:true},env,ledger)]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(calls.filter(c=>c.method==='PATCH')).toHaveLength(1);
 }));
 test('timeouts and malformed acknowledgements stay uncertain and never retry',async()=>{
  for(const write of [()=>{throw new TypeError('network timeout');},()=>Response.json({status:200,data:{results:[]}})])await withProvider(async calls=>{
   const ledger=store(),{operation}=await prepareCommand({pageId,content:'May have reached Notion',consent:true},env,ledger);
   await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandUncertain'});
   expect((await commandResult({id:operation.id},ledger)).operation.status).toBe('unknown');
   await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandUncertain'});expect(calls.filter(c=>c.method==='PATCH')).toHaveLength(1);
  },{write});
 });
 test('changed accounts, expired previews and archived pages fail before writing',async()=>{
  const ledger=store();let operation;
  await withProvider(async()=>{({operation}=await prepareCommand({pageId,content:'Guarded',consent:true},env,ledger));});
  await withProvider(async calls=>{await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandAccountChanged'});expect(calls.some(c=>c.method==='PATCH')).toBe(false);},{account:'another-account'});
  await withProvider(async calls=>{await expect(executeCommand({id:operation.id,confirm:true},env,ledger,new Date(Date.parse(operation.expiresAt)+1))).rejects.toMatchObject({code:'commandExpired'});expect(calls).toHaveLength(0);});
  await withProvider(async calls=>{await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandPageUnavailable'});expect(calls.some(c=>c.method==='PATCH')).toBe(false);},{target:{...page,archived:true}});
 });
 test('failed receipt persistence leaves sending locked rather than claiming success',async()=>withProvider(async calls=>{
  const ledger=store(),{operation}=await prepareCommand({pageId,content:'Receipt storage fails',consent:true},env,ledger),write=ledger.writeCommand;
  ledger.writeCommand=async(value,etag)=>{if(value.status==='succeeded')throw new Error('storage unavailable');return write(value,etag);};
  await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandUncertain'});
  expect((await commandResult({id:operation.id},ledger)).operation.status).toBe('sending');
  await expect(executeCommand({id:operation.id,confirm:true},env,ledger)).rejects.toMatchObject({code:'commandUncertain'});expect(calls.filter(c=>c.method==='PATCH')).toHaveLength(1);
 }));
 test('HTTP commands require owner/same-origin and fail honestly without cloud storage',async()=>{
  const request=(cookie,origin='https://app.test')=>new Request('https://app.test/api/knowledge-brain/command-prepare',{method:'POST',headers:{origin,'Content-Type':'application/json',cookie},body:JSON.stringify({pageId,content:'Text',consent:true})});
  expect((await handleBrain(request(''),{env})).status).toBe(401);expect((await handleBrain(request(sessionCookie(env),'https://evil.test'),{env})).status).toBe(403);
  const response=await handleBrain(request(sessionCookie(env)),{env,storeFactory:()=>{throw new Error('No Blobs');}});expect(response.status).toBe(503);expect((await response.json()).code).toBe('commandStorageNeeded');
  await expect(handleCommand('command-draft',null,env,store)).rejects.toMatchObject({code:'invalidData'});
 });
});
