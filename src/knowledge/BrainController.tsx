import {useEffect,useRef,useState} from 'react';
import {useKnowledge} from './context';
import {localReview,brainRequest,reports,parseReports,reportRecord,withConfig} from './brain';
import {readConfig,zonedDay,zonedHour,applyMoves,taskSnapshot} from './brain-engine.mjs';
export default function BrainController() {
  const {data,busy,commit}=useKnowledge();
  const current=useRef({data,busy,commit});current.current={data,busy,commit};
  const running=useRef(false),synced=useRef(-1),lastPull=useRef(0);
  const [tick,setTick]=useState(0);
  useEffect(()=> {const interval=setInterval(()=>setTick(n=>n+1),60000);return()=>clearInterval(interval);},[]);
  useEffect(()=> {
    const config=readConfig(data.records);
    if(!config.enabled||busy||running.current)return;
    const now=new Date();
    if(!config.cloud) {
      if(zonedHour(now,config.timeZone)<config.hour||reports(data.records).some(r=>r.id==='local-'+zonedDay(now,config.timeZone)))return;
      running.current=true;
      void commit(localReview(data,now)).finally(()=>{running.current=false;});
      return;
    }
    if(synced.current===data.revision && Date.now()-lastPull.current<55000)return;
    running.current=true;
    void (async()=> {
      const remote=await brainRequest('state');lastPull.current=Date.now();
      if(!remote.state.config?.enabled||!remote.state.config?.cloud)throw new Error('cloudDisabled');
      if(current.current.busy)return;
      let next=current.current.data;
      const known=new Set(reports(next.records).map(r=>r.id));
      const fresh=parseReports(remote.state.reports).filter(r=>!known.has(r.id)).reverse();
      const history={...readConfig(next.records).history};
      for(const report of fresh) {
        const moved=report.applied?applyMoves(next.records,report.plan.moves):{records:next.records,applied:[]};
        for(const move of moved.applied)history[move.id]=Math.min(3,(history[move.id]||0)+1);
        next={...next,records:[...moved.records,reportRecord(report,next.settings.language)]};
      }
      if(fresh.length) {
        await current.current.commit(withConfig(next,{...readConfig(next.records),history}));
        return;
      }
      const snapshot=current.current.data;
      if(synced.current===snapshot.revision)return;
      if(!readConfig(snapshot.records).cloud)return;
      const result=await brainRequest('sync',{expectedRevision:remote.state.revision,tasks:taskSnapshot(snapshot.records),capacity:snapshot.settings.dailyMinutes,config:readConfig(snapshot.records)});
      window.dispatchEvent(new CustomEvent('uko-brain-sync',{detail:{at:result.snapshotAt}}));
      synced.current=snapshot.revision;
    })().catch(e=>{window.dispatchEvent(new CustomEvent('uko-brain-sync',{detail:{error:e instanceof Error?e.message:'backendUnavailable'}}));}).finally(()=>{running.current=false;});
  },[data,busy,commit,tick]);
  return null;
}
