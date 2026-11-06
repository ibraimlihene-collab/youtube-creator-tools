import { expect, test } from 'bun:test';
import { createECDH, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import webpush from 'web-push';
import { pushConfiguration, validateSubscription, pushStatus, handlePush, runPush } from '../../netlify/functions/_brain/push.mjs';
import { dailyTick } from '../../netlify/functions/knowledge-brain-daily.mjs';
import { handleBrain, sessionCookie } from '../../netlify/functions/_brain/http.mjs';
const vapid=webpush.generateVAPIDKeys();
const env={NETLIFY:'true',URL:'https://example.test',KNOWLEDGE_OWNER_PASSWORD:'test-owner-password-strong-enough',KNOWLEDGE_OWNER_EMAIL:'owner@example.test',KNOWLEDGE_PUSH_PUBLIC_KEY:vapid.publicKey,KNOWLEDGE_PUSH_PRIVATE_KEY:vapid.privateKey};
const curve=createECDH('prime256v1');curve.generateKeys();
const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/test-subscription',keys:{p256dh:curve.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
const config=()=>({enabled:true,hour:8,timeZone:'Africa/Casablanca',language:'ar',subscription,updatedAt:'2026-11-05T00:00:00.000Z'});
function memory(value=config()) {
  let current=structuredClone(value),version=1;const claims=new Set();
  return {
    async readPush(){return {value:structuredClone(current),etag:String(version)};},
    async writePush(next,etag){if(etag!==String(version))throw Object.assign(new Error('conflict'),{code:'cloudConflict'});current=structuredClone(next);version++;},
    async claim(slot){if(claims.has(slot))return false;claims.add(slot);return true;},
  };
}
const now=new Date('2026-11-06T10:00:00Z');
const request=(action,body,headers={})=>new Request(`https://example.test/api/knowledge-brain/${action}`,{method:body===undefined?'GET':'POST',headers:{origin:env.URL,cookie:sessionCookie(env),'content-type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});

test('VAPID readiness validates matching keys and HTTPS deployment and reveals only public key',()=>{
  expect(pushConfiguration(env)).toEqual({ready:true,publicKey:vapid.publicKey});
  for(const change of [{NETLIFY:''},{URL:'http://example.test'},{URL:'https://a:b@example.test'},{URL:'https://example.test/path'},{KNOWLEDGE_OWNER_EMAIL:'wrong'},{KNOWLEDGE_PUSH_PRIVATE_KEY:'invalid'},{KNOWLEDGE_PUSH_PUBLIC_KEY:webpush.generateVAPIDKeys().publicKey}])expect(pushConfiguration({...env,...change})).toEqual({ready:false});
  const status=pushStatus(config(),env),text=JSON.stringify(status);
  expect(text).not.toContain(subscription.endpoint);expect(text).not.toContain(vapid.privateKey);expect(text).not.toContain(env.KNOWLEDGE_OWNER_PASSWORD);expect(status.enabled).toBe(true);
});
test('push subscription rejects SSRF endpoints, malformed keys and unsupported service URLs',()=>{
  expect(validateSubscription({...subscription,private:'discard'})).toEqual(subscription);
  for(const endpoint of ['http://fcm.googleapis.com/fcm/send/a','https://evil.test/a','https://fcm.googleapis.com.evil.test/fcm/send/a','https://fcm.googleapis.com:444/fcm/send/a','https://user:pass@fcm.googleapis.com/fcm/send/a','https://fcm.googleapis.com/fcm/send/a?token=1','https://fcm.googleapis.com/fcm/send/a#x','https://fcm.googleapis.com/not-supported/a','http://127.0.0.1/x'])expect(()=>validateSubscription({...subscription,endpoint})).toThrow('pushInvalid');
  for(const keys of [{...subscription.keys,auth:'a'}, {...subscription.keys,p256dh:Buffer.alloc(65,4).toString('base64url')}, {...subscription.keys,auth:subscription.keys.auth+'='}])expect(()=>validateSubscription({...subscription,keys})).toThrow('pushInvalid');
  expect(validateSubscription({...subscription,endpoint:'https://updates.push.services.mozilla.com/wpush/v2/test'}).endpoint).toContain('mozilla.com');
});
test('actual web-push library encrypts a bounded generic request offline without exposing private state',()=>{
  const details=webpush.generateRequestDetails(subscription,JSON.stringify({kind:'daily',day:'2026-11-06',language:'ar'}),{vapidDetails:{subject:'mailto:owner@example.test',publicKey:vapid.publicKey,privateKey:vapid.privateKey},TTL:21600});
  expect(details.endpoint).toBe(subscription.endpoint);expect(details.body.length).toBeGreaterThan(0);expect(details.headers.Authorization).toContain('vapid');expect(details.body.toString()).not.toContain('2026-11-06');
});
test('owner authentication, same-origin POSTs, JSON types and method gates protect push configuration',async()=>{
  const store=memory();
  expect((await handleBrain(request('push-status',undefined,{cookie:''}),{env,storeFactory:()=>store})).status).toBe(401);
  expect((await handleBrain(request('push-disable',{}, {origin:'https://evil.test'}),{env,storeFactory:()=>store})).status).toBe(403);
  const status=await handleBrain(request('push-status'),{env,storeFactory:()=>store});expect(status.status).toBe(200);expect(status.headers.get('cache-control')).toBe('no-store');
  expect((await handleBrain(request('push-subscribe',null),{env,storeFactory:()=>store})).status).toBe(400);
  expect((await handleBrain(request('push-disable'),{env,storeFactory:()=>store})).status).toBe(404);
  expect((await handleBrain(request('push-disable',{}),{env,storeFactory:()=>store})).status).toBe(200);expect((await store.readPush()).value.enabled).toBe(false);
});
test('enrollment validates schedule and never silently replaces an active different device',async()=>{
  const store=memory(null),body={subscription,hour:8,timeZone:'Africa/Casablanca',language:'fr'};
  for(const change of [{hour:6},{hour:22},{hour:8.5},{timeZone:'Invalid/Zone'},{language:'en'}])await expect(handlePush('push-subscribe',{...body,...change},env,()=>store)).rejects.toMatchObject({code:'pushInvalid'});
  expect((await handlePush('push-subscribe',body,env,()=>store)).enabled).toBe(true);
  await expect(handlePush('push-subscribe',{...body,subscription:{...subscription,endpoint:subscription.endpoint+'-other'}},env,()=>store)).rejects.toMatchObject({code:'pushDeviceExists'});
  await handlePush('push-disable',{},env,()=>store);expect((await store.readPush()).value.subscription).toBe(null);
  expect((await handlePush('push-subscribe',{...body,hour:9},env,()=>store)).hour).toBe(9);
});
test('daily scheduler uses actual timezone, respects quiet hours and sends at most once under concurrency',async()=>{
  const store=memory(),payloads=[],sender=async(s,p)=>{payloads.push({s,p});return {statusCode:201};};
  expect((await runPush(store,env,{now:new Date('2026-11-06T05:00:00Z'),sender})).skipped).toBe('notDue');
  expect((await runPush(store,env,{now:new Date('2026-11-06T23:00:00Z'),sender})).skipped).toBe('notDue');
  await Promise.all([runPush(store,env,{now,sender}),runPush(store,env,{now,sender})]);expect(payloads).toHaveLength(1);
  expect(payloads[0].p.path).toBe('/knowledge/assistant?today=1');expect(JSON.stringify(payloads[0].p)).not.toContain('subscription');
  expect((await store.readPush()).value.last.status).toBe('accepted');expect((await runPush(store,env,{now,sender})).skipped).toBe('notDue');
  await runPush(store,env,{now:new Date('2026-11-07T10:00:00Z'),sender});expect(payloads).toHaveLength(2);
});
test('accepted is distinct from phone display, expiry disables and uncertain results never retry that day',async()=>{
  for(const [outcome,status] of [[{statusCode:410},'expired'],[{statusCode:404},'expired'],[{statusCode:429},'failed'],[new TypeError('timeout'),'unknown'],[{statusCode:200},'unknown'],[{statusCode:202},'accepted']]){
    const store=memory();let count=0;
    const sender=async()=>{count++;if(outcome instanceof Error||[410,404,429].includes(outcome.statusCode))throw outcome;return outcome;};
    expect((await runPush(store,env,{now,sender})).status).toBe(status);
    await runPush(store,env,{now,sender});expect(count).toBe(1);
    const saved=(await store.readPush()).value;expect(saved.last.status).toBe(status);
    if(status==='expired'){expect(saved.enabled).toBe(false);expect(saved.subscription).toBe(null);}
  }
});
test('durable consent recheck and failed final CAS prevent duplicate or falsely confirmed sends',async()=>{
  const store=memory(),write=store.writePush;let writes=0,sends=0;
  store.writePush=async(value,etag)=>{await write(value,etag);if(++writes===1){const latest=await store.readPush();await write({...latest.value,enabled:false,updatedAt:'revoked'},latest.etag);}};
  expect((await runPush(store,env,{now,test:true,sender:async()=>{sends++;}})).code).toBe('pushUnknown');expect(sends).toBe(0);
  const conflict=memory(),original=conflict.writePush;let count=0;
  conflict.writePush=async(value,etag)=>{if(++count===2)throw Object.assign(new Error('conflict'),{code:'cloudConflict'});return original(value,etag);};
  await expect(runPush(conflict,env,{now,sender:async()=>({statusCode:201})})).rejects.toMatchObject({code:'cloudConflict'});
  expect((await conflict.readPush()).value.last.status).toBe('attempting');
  expect((await runPush(conflict,env,{now,sender:async()=>{throw new Error('must not repeat');}})).skipped).toBe('notDue');
});
test('test attempts are limited and notification dispatch is independent of review setup or failures',async()=>{
  const store=memory();await runPush(store,env,{now,test:true,sender:async()=>({statusCode:201})});
  expect((await runPush(store,env,{now,test:true})).code).toBe('pushRateLimit');
  expect((await runPush(store,env,{now:new Date(now.getTime()+299999),test:true})).code).toBe('pushRateLimit');
  expect((await runPush(memory(),{}, {test:true})).code).toBe('pushSetupNeeded');
  const calls=[],original=console.error;console.error=()=>{};
  try {
    const result=await dailyTick(env,{storeFactory:()=>{throw Object.assign(new Error(),{code:'storeUnavailable'});},review:async()=>{calls.push('review');}});
    expect(result.status).toBe(500);expect(calls).toEqual(['review']);
    const next=await dailyTick(env,{storeFactory:()=>store,push:async()=>{calls.push('push');},review:async()=>{throw new Error();}});
    expect(next.status).toBe(500);expect(calls).toContain('push');
  } finally {console.error=original;}
});
test('worker displays fixed generic text and only navigates to its own daily conversation',async()=>{
  const handlers={},shown=[],opened=[],self={location:{origin:env.URL},addEventListener:(name,fn)=>handlers[name]=fn,registration:{showNotification:async(...args)=>shown.push(args)},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}};
  vm.runInNewContext(readFileSync('public/knowledge-sw.js','utf8'),{self,URL});
  let pending;handlers.push({data:{json:()=>({kind:'daily',day:'2026-11-06',language:'ar',title:'Private goal',body:'Private answer',path:'https://evil.test'})},waitUntil:p=>pending=p});await pending;
  expect(shown).toHaveLength(1);expect(JSON.stringify(shown)).not.toContain('Private');expect(shown[0][1].dir).toBe('rtl');
  handlers.notificationclick({notification:{close(){},data:{path:'https://evil.test'}},waitUntil:p=>pending=p});await pending;
  expect(opened).toEqual(['https://example.test/knowledge/assistant?today=1']);
  handlers.push({data:{json:()=>({kind:'other',day:'2026-11-06'})},waitUntil(){throw new Error('ignored');}});expect(shown).toHaveLength(1);
});
