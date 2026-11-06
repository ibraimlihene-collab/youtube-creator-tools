import {enqueueReview} from './_brain/job.mjs';
import {openBrainStore} from './_brain/store.mjs';
import {runPush} from './_brain/push.mjs';
// The short cron invocation only dispatches; scanning runs in the background function.
export async function dailyTick(env,{storeFactory=()=>openBrainStore(env),push=runPush,review=enqueueReview}={}) {
  if((env.KNOWLEDGE_OWNER_PASSWORD||'').length<20||!env.KNOWLEDGE_OWNER_EMAIL)return new Response(null,{status:204});
  const results=await Promise.allSettled([
    Promise.resolve().then(()=>push(storeFactory(),env)),
    Promise.resolve().then(()=>review(env)),
  ]);
  const failed=results.filter(result=>result.status==='rejected');
  for(const result of failed)console.error('[knowledge-brain-scheduler]',result.reason.code||'dailyReviewFailed');
  return new Response(null,{status:failed.length?500:204});
};
export default ()=>dailyTick(process.env);
export const config={schedule:'0 * * * *'};
