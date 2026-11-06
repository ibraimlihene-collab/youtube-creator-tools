import webpush from 'web-push';
import {createECDH, ECDH, timingSafeEqual} from 'node:crypto';
import {BrainError} from './providers.mjs';
import {zonedDay, zonedHour} from '../../../src/knowledge/brain-engine.mjs';

function bytes(value, length) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new BrainError('pushInvalid',400);
  const decoded=Buffer.from(value,'base64url');
  if(decoded.length!==length || decoded.toString('base64url')!==value) throw new BrainError('pushInvalid',400);
  return decoded;
}
export function pushConfiguration(env) {
  try {
    const privateKey=bytes(env.KNOWLEDGE_PUSH_PRIVATE_KEY,32),publicKey=bytes(env.KNOWLEDGE_PUSH_PUBLIC_KEY,65);
    const curve=createECDH('prime256v1');curve.setPrivateKey(privateKey);
    const site=new URL(env.URL);
    if(site.protocol!=='https:'||site.username||site.password||site.port||site.pathname!=='/'||site.search||site.hash)return {ready:false};
    if(!timingSafeEqual(curve.getPublicKey(),publicKey)||!env.NETLIFY||!/^https:\/\//.test(env.URL||'')||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.KNOWLEDGE_OWNER_EMAIL||''))return {ready:false};
    return {ready:true,publicKey:env.KNOWLEDGE_PUSH_PUBLIC_KEY};
  }catch{return {ready:false};}
}
export function validateSubscription(value) {
  try {
    if(!value||typeof value.endpoint!=='string'||value.endpoint.length>4096)throw new Error();
    const url=new URL(value.endpoint);
    if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash||
      !((url.hostname==='fcm.googleapis.com'&&/^\/(fcm\/send|wp)\/.+/.test(url.pathname))||
        (url.hostname==='updates.push.services.mozilla.com'&&/^\/wpush\/v2\/.+/.test(url.pathname))))throw new Error();
    const key=bytes(value.keys?.p256dh,65);if(key[0]!==4)throw new Error();
    ECDH.convertKey(key,'prime256v1');
    bytes(value.keys?.auth,16);
    return {endpoint:url.href,keys:{p256dh:value.keys.p256dh,auth:value.keys.auth}};
  }catch{throw new BrainError('pushInvalid',400);}
}
function schedule(body) {
  if(!Number.isInteger(body.hour)||body.hour<7||body.hour>21||!['ar','fr'].includes(body.language)||typeof body.timeZone!=='string')throw new BrainError('pushInvalid',400);
  try{new Intl.DateTimeFormat('en',{timeZone:body.timeZone});}catch{throw new BrainError('pushInvalid',400);}
  return {hour:body.hour,timeZone:body.timeZone,language:body.language};
}
export function pushStatus(value,env) {
  return {...pushConfiguration(env),enabled:!!value?.enabled,expired:value?.last?.status==='expired',
    hour:value?.hour??8,timeZone:value?.timeZone||'Africa/Casablanca',last:value?.last||null};
}
export async function handlePush(action,body,env,storeFactory) {
  const store=storeFactory();
  const current=await store.readPush();
  if(action==='push-status')return pushStatus(current.value,env);
  if(action==='push-disable') {
    await store.writePush({...current.value,enabled:false,subscription:null,updatedAt:new Date().toISOString()},current.etag);
    return {enabled:false};
  }
  if(!pushConfiguration(env).ready)throw new BrainError('pushSetupNeeded',503);
  if(action==='push-subscribe') {
    if(!body||typeof body!=='object'||Array.isArray(body))throw new BrainError('pushInvalid',400);
    const subscription=validateSubscription(body.subscription),settings=schedule(body);
    if(current.value?.enabled&&current.value.subscription?.endpoint!==subscription.endpoint)throw new BrainError('pushDeviceExists',409);
    const next={...current.value,...settings,subscription,enabled:true,updatedAt:new Date().toISOString()};
    await store.writePush(next,current.etag);return pushStatus(next,env);
  }
  if(action==='push-test') {
    const result=await runPush(store,env,{test:true});
    if(result.code)throw new BrainError(result.code,result.code==='pushRateLimit'?429:503);
    return result;
  }
  throw new BrainError('notFound',404);
}
export async function sendPush(subscription,payload,env) {
  return webpush.sendNotification(subscription,JSON.stringify(payload),{
    vapidDetails:{subject:`mailto:${env.KNOWLEDGE_OWNER_EMAIL}`,publicKey:env.KNOWLEDGE_PUSH_PUBLIC_KEY,privateKey:env.KNOWLEDGE_PUSH_PRIVATE_KEY},
    TTL:21600,urgency:'normal',timeout:10000,
  });
}
export async function runPush(store,env,{now=new Date(),test=false,sender=sendPush}={}) {
  if(!pushConfiguration(env).ready)return {skipped:'setup',code:test?'pushSetupNeeded':undefined};
  const current=await store.readPush(),value=current.value;
  if(!value?.enabled||!value.subscription)return {skipped:'disabled',code:test?'pushExpired':undefined};
  if(test&&value.lastTestAt&&now.getTime()-Date.parse(value.lastTestAt)<300000)return {skipped:'recentTest',code:'pushRateLimit'};
  const day=zonedDay(now,value.timeZone),hour=zonedHour(now,value.timeZone);
  if(!test&&(hour<value.hour||hour>21||value.lastDay===day))return {skipped:'notDue'};
  // Claim before I/O. An uncertain result is never sent again automatically that day.
  const slot=test?`push-test-${Math.floor(now.getTime()/300000)}`:`push-daily-${day}`;
  if(!await store.claim(slot))return {skipped:'claimed',code:test?'pushRateLimit':undefined};
  const at=now.toISOString(),attempt={...value,last:{at,status:'attempting',test},...(!test?{lastDay:day}:{lastTestAt:at})};
  await store.writePush(attempt,current.etag);
  // Recheck consent and identity after the durable write, before network I/O.
  const latest=await store.readPush();
  if(!latest.value?.enabled||latest.value.updatedAt!==value.updatedAt||latest.value.subscription?.endpoint!==value.subscription.endpoint)return {skipped:'changed',code:test?'pushUnknown':undefined};
  const french=value.language==='fr';
  const payload={kind:test?'test':'daily',day,language:value.language,
    title:french?'Votre journée en trois questions':'يومك في ثلاثة أسئلة',
    body:french?'Ouvrez votre conversation pour préparer la journée.':'افتح محادثة اليوم لاختيار خطتك.',
    path:'/knowledge/assistant?today=1'};
  let status='accepted';
  try {const result=await sender(validateSubscription(value.subscription),payload,env);if(![201,202].includes(result?.statusCode))status='unknown';}
  catch(e){status=[404,410].includes(e.statusCode)?'expired':e.statusCode?'failed':'unknown';}
  const final={...latest.value,last:{at,status,test},...(status==='expired'?{enabled:false,subscription:null}:{})};
  await store.writePush(final,latest.etag);
  return {status,...(status==='accepted'?{}:{code:status==='expired'?'pushExpired':status==='failed'?'pushFailed':'pushUnknown'})};
}
