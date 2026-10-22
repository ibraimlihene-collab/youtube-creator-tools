import {enqueueReview} from './_brain/job.mjs';
// The short cron invocation only dispatches; scanning runs in the background function.
export default async()=> {
  if((process.env.KNOWLEDGE_OWNER_PASSWORD||'').length<20||!process.env.KNOWLEDGE_OWNER_EMAIL)return new Response(null,{status:204});
  try {await enqueueReview(process.env);return new Response(null,{status:204});}
  catch(e){console.error('[knowledge-brain-scheduler]',e.code||'dailyReviewFailed');return new Response(null,{status:500});}
};
export const config={schedule:'0 * * * *'};
