import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {BrainError,authLink,accountFor,testGemini,MODEL} from './providers.mjs';
import {openBrainStore} from './store.mjs';
import {enqueueReview} from './job.mjs';
import {handleCommand} from './commands.mjs';
import {readConfig,validDay} from '../../../src/knowledge/brain-engine.mjs';
const attempts=new Map();
function equal(a,b){const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y);}
function signature(value,env){return createHmac('sha256',env.KNOWLEDGE_OWNER_PASSWORD).update('uko-session:'+value).digest('base64url');}
export function sessionCookie(env,now=Date.now()) {const value=String(now+86400000);return `uko_brain=${value}.${signature(value,env)}; HttpOnly; Secure; SameSite=Strict; Path=/api/knowledge-brain; Max-Age=86400`;}
export function authenticated(cookie,env,now=Date.now()) {
  const token=cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('uko_brain='))?.slice(10)||'';
  const [expiry,mac]=token.split('.');return /^\d+$/.test(expiry||'')&&Number(expiry)>now&&Number(expiry)<=now+86400000&&!!mac&&equal(signature(expiry,env),mac);
}
function configured(env){return typeof env.KNOWLEDGE_OWNER_PASSWORD==='string'&&env.KNOWLEDGE_OWNER_PASSWORD.length>=20&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.KNOWLEDGE_OWNER_EMAIL||'');}
function validateSnapshot(body) {
  if(!body||!Array.isArray(body.tasks)||body.tasks.length>1000||!Number.isInteger(body.expectedRevision)||body.expectedRevision<0||!Number.isInteger(body.capacity)||body.capacity<15||body.capacity>720)throw new BrainError('invalidData',400);
  const ids=new Set();
  for(const e of body.tasks) {
    if(!e||typeof e.id!=='string'||!e.id||e.id.length>120||ids.has(e.id)||!['task','session','homework','exam'].includes(e.kind)||typeof e.title!=='string'||e.title.length>500||typeof e.updatedAt!=='string'||!Number.isFinite(Date.parse(e.updatedAt))||!['inbox','next','active','waiting','paused','partial','postponed','blocked','completed','revisit','archived'].includes(e.status)||!e.fields||typeof e.fields!=='object'||Array.isArray(e.fields))throw new BrainError('invalidData',400);
    ids.add(e.id);
    for(const [key,value] of Object.entries(e.fields))if(!['date','time','duration','subject','priority'].includes(key)||typeof value!=='string'||value.length>120)throw new BrainError('invalidData',400);
    if(e.fields.date&&!validDay(e.fields.date)||e.fields.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.fields.time)||e.fields.duration&&(!/^\d+$/.test(e.fields.duration)||Number(e.fields.duration)<1||Number(e.fields.duration)>1440))throw new BrainError('invalidData',400);
    if(Object.keys(e).some(key=>!['id','kind','title','status','updatedAt','fields'].includes(key)))throw new BrainError('invalidData',400);
  }
  if(!body.config||typeof body.config!=='object'||Array.isArray(body.config))throw new BrainError('invalidData',400);
  const config=readConfig([{id:'uko-daily-brain-config',content:JSON.stringify(body.config)}]);
  if(config.emailReports)throw new BrainError('emailNotEnabled',400);
  return config;
}
export async function handleBrain(request,{env=process.env,storeFactory=()=>openBrainStore(env)}={}) {
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const respond=(status,value)=>new Response(JSON.stringify(value),{status,headers});
  try {
    const url=new URL(request.url),action=url.pathname.split('/').filter(Boolean).pop();
    if(!['GET','POST'].includes(request.method))return respond(405,{ok:false,code:'methodNotAllowed'});
    if(request.method==='POST' && request.headers.get('origin')!==url.origin)throw new BrainError('originRejected',403);
    if(action==='status'&&request.method==='GET')return respond(200,{ok:true,configured:configured(env),authenticated:configured(env)&&authenticated(request.headers.get('cookie'),env),geminiKey:!!env.GEMINI_API_KEY,composioKey:!!env.COMPOSIO_API_KEY,existingUser:!!env.COMPOSIO_USER_ID,authLinks:{drive:!!env.COMPOSIO_DRIVE_AUTH_CONFIG_ID,gmail:!!env.COMPOSIO_GMAIL_AUTH_CONFIG_ID,notion:!!env.COMPOSIO_NOTION_AUTH_CONFIG_ID},model:MODEL,scheduled:!!env.NETLIFY,missing:['KNOWLEDGE_OWNER_PASSWORD','KNOWLEDGE_OWNER_EMAIL','COMPOSIO_API_KEY'].filter(k=>!env[k]),invalid:[...(env.KNOWLEDGE_OWNER_PASSWORD&&env.KNOWLEDGE_OWNER_PASSWORD.length<20?['KNOWLEDGE_OWNER_PASSWORD']:[]),...(env.KNOWLEDGE_OWNER_EMAIL&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.KNOWLEDGE_OWNER_EMAIL)?['KNOWLEDGE_OWNER_EMAIL']:[])]});
    if(!configured(env))throw new BrainError('serverSetupNeeded',503);
    let body={};
    if(request.method==='POST') {
      if(!request.headers.get('content-type')?.includes('application/json'))throw new BrainError('invalidData',400);
      const length=Number(request.headers.get('content-length')||0);if(length>600000)throw new BrainError('invalidData',413);
      const reader=request.body?.getReader(),chunks=[];let size=0;
      if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>600000)throw new BrainError('invalidData',413);chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}
      const raw=Buffer.concat(chunks).toString('utf8');
      try{body=JSON.parse(raw);}catch{throw new BrainError('invalidData',400);}
    }
    if(action==='login'&&request.method==='POST') {
      for(const [key,value] of attempts)if(Date.now()-value.at>900000)attempts.delete(key);
      if(attempts.size>10000)throw new BrainError('loginRateLimit',429);
      const ip=request.headers.get('x-nf-client-connection-ip')||'preview';const bucket=attempts.get(ip)||{count:0,at:Date.now()};
      if(Date.now()-bucket.at>900000){bucket.count=0;bucket.at=Date.now();}bucket.count++;attempts.set(ip,bucket);
      if(bucket.count>5)throw new BrainError('loginRateLimit',429);
      if(typeof body.password!=='string'||body.password.length>1000||!equal(body.password,env.KNOWLEDGE_OWNER_PASSWORD))throw new BrainError('loginFailed',401);
      headers['Set-Cookie']=sessionCookie(env);return respond(200,{ok:true});
    }
    if(!authenticated(request.headers.get('cookie'),env))throw new BrainError('loginNeeded',401);
    if(action==='logout'&&request.method==='POST'){headers['Set-Cookie']='uko_brain=; HttpOnly; Secure; SameSite=Strict; Path=/api/knowledge-brain; Max-Age=0';return respond(200,{ok:true});}
    if(['command-draft','command-search','command-prepare','command-execute','command-result'].includes(action)&&request.method==='POST')return respond(200,{ok:true,...await handleCommand(action,body,env,storeFactory)});
    if(action==='state'&&request.method==='GET'){const {value}=await storeFactory().read();return respond(200,{ok:true,state:value});}
    if(action==='sync'&&request.method==='POST') {
      const store=storeFactory();
      const incomingConfig=validateSnapshot(body),current=await store.read();
      if(body.configure!==true&&(!current.value.config?.enabled||!current.value.config?.cloud))throw new BrainError('cloudDisabled',409);
      const config=body.configure===true?incomingConfig:current.value.config;
      if(current.value.revision!==body.expectedRevision)throw new BrainError('cloudConflict',409);
      for(const [id,count] of Object.entries(current.value.config?.history||{}))config.history[id]=Math.max(count,config.history[id]||0);
      const next={...current.value,revision:current.value.revision+1,tasks:body.tasks,capacity:body.capacity,config,snapshotAt:new Date().toISOString()};
      if(!config.shareDrive)next.cursor=null;
      if(!config.shareNotion)next.notionCursor=null;
      await store.write(next,current.etag);return respond(200,{ok:true,revision:next.revision,snapshotAt:next.snapshotAt});
    }
    if(action==='run'&&request.method==='POST') {
      const store=storeFactory();
      const current=await store.read();if(!current.value.config?.enabled||!current.value.config?.cloud)throw new BrainError('cloudDisabled',409);
      await enqueueReview(env,true);return respond(202,{ok:true,queued:true});
    }
    if(action==='test-model'&&request.method==='POST')return respond(200,{ok:true,model:await testGemini(env)});
    const service=({'drive':'googledrive','gmail':'gmail','notion':'notion'})[action.split('-')[1]];
    if(['connect-drive','connect-gmail','connect-notion'].includes(action)&&request.method==='POST')return respond(200,{ok:true,url:await authLink(service,env,url.origin)});
    if(['check-drive','check-gmail','check-notion'].includes(action)&&request.method==='POST') {
      const account=await accountFor(service,env);
      return respond(200,{ok:true,identity:account.email||account.identity,email:account.email});
    }
    return respond(404,{ok:false,code:'notFound'});
  }catch(e){return respond(e.status||503,{ok:false,code:e.code||'backendUnavailable'});}
}
