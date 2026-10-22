import {makeEntry,type Entry,type Workspace} from './model';
import {configId,readConfig,validDay,zonedDay,planReview,applyMoves,type BrainConfig,type BrainPlan} from './brain-engine.mjs';
export interface BrainReport {id:string;day:string;createdAt:string;plan:BrainPlan;applied:boolean;summary:string;model:string|null;sources:{id:string;title:string;state:string}[];errors:string[];drivePending?:boolean;snapshotAt?:string}
export function configRecord(config:BrainConfig,language:string):Entry {
  return {...makeEntry('note',language),id:configId,title:language==='ar'?'إعدادات المساعد اليومي':'Configuration du suivi quotidien',content:JSON.stringify(config),status:'archived',tags:['knowledge-brain-config']};
}
export function withConfig(workspace:Workspace,config:BrainConfig):Workspace {
  const existing=workspace.records.find(e=>e.id===configId),record=configRecord(config,workspace.settings.language);
  return {...workspace,records:[...workspace.records.filter(e=>e.id!==configId),{...record,createdAt:existing?.createdAt||record.createdAt}]};
}
export function reportRecord(report:BrainReport,language:string):Entry {
  return {...makeEntry('review',language),id:'uko-brain-'+report.id,title:`${language==='ar'?'مراجعة المساعد':'Bilan quotidien'} · ${report.day}`,content:JSON.stringify(report),status:'completed',tags:['knowledge-brain-report'],fields:{date:report.day}};
}
const text = (value:unknown):value is string => typeof value==='string';
const stamp = (value:unknown):value is string => text(value)&&Number.isFinite(Date.parse(value));
export function parseReports(value:unknown):BrainReport[] {
  if(!Array.isArray(value))return [];
  return value.filter((r):r is BrainReport => {
    if(!r||!text(r.id)||!r.id||!validDay(r.day)||!stamp(r.createdAt)||typeof r.applied!=='boolean'||!text(r.summary)||(r.model!==null&&!text(r.model)))return false;
    const p=r.plan;
    if(!p||p.day!==r.day||!Number.isInteger(p.overdue)||p.overdue<0||!Array.isArray(p.moves)||!Array.isArray(p.attention))return false;
    if(!p.moves.every((m:BrainPlan['moves'][number])=>m&&text(m.id)&&validDay(m.from)&&validDay(m.to)&&m.to>=m.from&&stamp(m.expectedUpdatedAt)))return false;
    if(!p.attention.every((a:BrainPlan['attention'][number])=>a&&text(a.id)&&['fixedDeadline','protectedHours','repeated','capacity'].includes(a.reason)))return false;
    return Array.isArray(r.errors)&&r.errors.every(text)&&Array.isArray(r.sources)&&r.sources.every((s:BrainReport['sources'][number])=>s&&text(s.id)&&text(s.title)&&text(s.state));
  }).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export function reports(records:Entry[]):BrainReport[] {
  return parseReports(records.filter(e=>e.tags.includes('knowledge-brain-report')).flatMap(e=> {
    try {return [JSON.parse(e.content)];}catch{return [];}
  }));
}
export function localReview(workspace:Workspace,now=new Date()):Workspace {
  const config=readConfig(workspace.records),day=zonedDay(now,config.timeZone),id='local-'+day;
  if(reports(workspace.records).some(r=>r.id===id))return workspace;
  const plan=planReview(workspace.records,day,workspace.settings.dailyMinutes,config.history);
  const moved=config.autoMove?applyMoves(workspace.records,plan.moves,now.toISOString()):{records:workspace.records,applied:[]};
  const history={...config.history};for(const m of moved.applied)history[m.id]=Math.min(3,(history[m.id]||0)+1);
  const report:BrainReport={id,day,createdAt:now.toISOString(),plan,applied:config.autoMove,summary:'',model:null,sources:[],errors:[]};
  return withConfig({...workspace,records:[...moved.records,reportRecord(report,workspace.settings.language)]},{...config,history});
}
export async function brainRequest(action:string,body?:unknown) {
  const response=await fetch('/api/knowledge-brain/'+action,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(action==='run'?120000:35000)});
  const result=await response.json().catch(()=>({ok:false,code:'backendUnavailable'}));
  if(!response.ok||!result.ok)throw new Error(result.code||'backendUnavailable');
  return result;
}
