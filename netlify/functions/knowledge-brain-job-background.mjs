import {openBrainStore} from './_brain/store.mjs';
import {runReview} from './_brain/review.mjs';
import {verifyJob} from './_brain/job.mjs';
// Background function: up to 15 minutes, unlike the short scheduler/request functions.
export default async request=> {
  const env=process.env;
  if((env.KNOWLEDGE_OWNER_PASSWORD||'').length<20||request.method!=='POST'||!verifyJob(request,env))return new Response(null,{status:401});
  try {
    const body=await request.json();await runReview(openBrainStore(),env,{manual:body.manual===true});
    return new Response(null,{status:204});
  }catch(e){console.error('[knowledge-brain-background]',e.code||'dailyReviewFailed');return new Response(null,{status:500});}
};
