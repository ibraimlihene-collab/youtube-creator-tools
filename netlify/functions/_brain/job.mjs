import {createHmac,timingSafeEqual} from 'node:crypto';
import {BrainError} from './providers.mjs';
const sign=(stamp,env)=>createHmac('sha256',env.KNOWLEDGE_OWNER_PASSWORD).update('uko-background-job:'+stamp).digest('hex');
export function jobHeaders(env,now=Date.now()) {const stamp=String(now);return {'x-uko-job-at':stamp,'x-uko-job-signature':sign(stamp,env),'Content-Type':'application/json'};}
export function verifyJob(request,env,now=Date.now()) {
  const stamp=request.headers.get('x-uko-job-at')||'',mac=request.headers.get('x-uko-job-signature')||'';
  if(!/^\d+$/.test(stamp)||Math.abs(now-Number(stamp))>300000||!/[a-f0-9]{64}/.test(mac))return false;
  const expected=sign(stamp,env);return mac.length===expected.length&&timingSafeEqual(Buffer.from(mac),Buffer.from(expected));
}
export async function enqueueReview(env,manual=false,fetcher=fetch) {
  if(!env.NETLIFY||!env.URL)throw new BrainError('deploymentNeeded',503);
  const url=new URL(env.URL);if(url.protocol!=='https:'||url.username||url.password)throw new BrainError('deploymentNeeded',503);
  url.pathname='/.netlify/functions/knowledge-brain-job-background';url.search='';url.hash='';
  const result=await fetcher(url,{method:'POST',headers:jobHeaders(env),body:JSON.stringify({manual}),redirect:'error',signal:AbortSignal.timeout(10000)});
  if(result.status!==202)throw new BrainError('jobNotQueued',503);
}
