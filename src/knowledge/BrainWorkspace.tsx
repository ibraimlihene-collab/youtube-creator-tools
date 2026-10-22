import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {BrainCircuit,RefreshCw,ShieldCheck,CalendarClock,LogIn,FileSearch,Mail,CheckCircle2} from 'lucide-react';
import {useKnowledge} from './context';
import {brainRequest,withConfig,localReview,reports,parseReports,reportRecord} from './brain';
import {readConfig,modelId,applyMoves,taskSnapshot,type BrainConfig} from './brain-engine.mjs';
import './brain.css';
type ServerStatus={configured:boolean;authenticated:boolean;geminiKey:boolean;composioKey:boolean;scheduled:boolean;missing:string[]};
export default function BrainWorkspace() {
  const {data,t,busy,commit,inspect,notify}=useKnowledge();
  const latest=useRef({data,busy,commit});latest.current={data,busy,commit};
  const saved=readConfig(data.records);
  const [config,setConfig]=useState(saved),[working,setWorking]=useState(false),[error,setError]=useState('');
  const [server,setServer]=useState<ServerStatus|null>(null),[password,setPassword]=useState('');
  const [tested,setTested]=useState(false),[drive,setDrive]=useState(''),[gmail,setGmail]=useState(''),[snapshot,setSnapshot]=useState('');
  const history=reports(data.records);
  async function action(fn:()=>Promise<void>) {
    setError('');setWorking(true);try{await fn();}catch(e){setError(e instanceof Error?e.message:'backendUnavailable');}finally{setWorking(false);}
  }
  async function status() {setServer(await brainRequest('status'));setTested(false);setDrive('');setGmail('');}
  useEffect(()=>{void brainRequest('status').then(setServer).catch(()=>setError('backendUnavailable'));},[]);
  useEffect(()=>{
    const listener=(event:Event)=>{const detail=(event as CustomEvent<{at?:string;error?:string}>).detail;if(detail.at)setSnapshot(detail.at);if(detail.error)setError(detail.error);};
    window.addEventListener('uko-brain-sync',listener);return()=>window.removeEventListener('uko-brain-sync',listener);
  },[]);
  async function save(event:FormEvent) {
    event.preventDefault();
    await action(async()=>{
      if((config.cloud||readConfig(latest.current.data.records).cloud)&&!server?.authenticated)throw new Error('brainLoginNeeded');
      if(config.cloud||readConfig(latest.current.data.records).cloud) {
        const remote=await brainRequest('state');
        const current=latest.current.data;
        const response=await brainRequest('sync',{expectedRevision:remote.state.revision,tasks:taskSnapshot(current.records),capacity:current.settings.dailyMinutes,config:{...config,history:readConfig(current.records).history},configure:true});
        setSnapshot(response.snapshotAt);
      }
      const current=latest.current.data;
      if(await latest.current.commit(withConfig(current,{...config,history:readConfig(current.records).history})))notify(t('saved'));
    });
  }
  async function sync() {
    const remote=await brainRequest('state');
    const current=latest.current.data;
    const known=new Set(reports(current.records).map(r=>r.id));
    const unseen=parseReports(remote.state.reports).filter(r=>!known.has(r.id));
    if(unseen.length)throw new Error('brainPullFirst');
    const response=await brainRequest('sync',{expectedRevision:remote.state.revision,tasks:taskSnapshot(current.records),capacity:current.settings.dailyMinutes,config:readConfig(current.records)});
    setSnapshot(response.snapshotAt);notify(t('brainSynced'));
  }
  async function pull() {
    const response=await brainRequest('state');
    const current=latest.current.data,cfg=readConfig(current.records);
    const known=new Set(reports(current.records).map(r=>r.id));let records=current.records;
    const counts={...cfg.history};
    for(const report of parseReports(response.state.reports).reverse()) {
      if(known.has(report.id))continue;
      const moved=report.applied?applyMoves(records,report.plan.moves):{records,applied:[]};
      for(const m of moved.applied)counts[m.id]=Math.min(3,(counts[m.id]||0)+1);
      records=[...moved.records,reportRecord(report,current.settings.language)];
    }
    if(await latest.current.commit(withConfig({...current,records},{...cfg,history:counts})))notify(t('brainPulled'));
    setSnapshot(response.state.snapshotAt||'');
  }
  async function run() {
    await action(async()=>{
      if(saved.cloud){await sync();await brainRequest('run',{});notify(t('brainQueued'));}
      else if(await commit(localReview(data)))notify(t('brainReviewed'));
    });
  }
  async function connection(kind:'drive'|'gmail',connect=false) {
    await action(async()=>{
      const result=await brainRequest(`${connect?'connect':'check'}-${kind}`,{});
      if(connect){window.location.assign(result.url);return;}
      if(kind==='drive')setDrive(result.email);else setGmail(result.email);
    });
  }
  function toggle(key:keyof Pick<BrainConfig,'enabled'|'autoMove'|'cloud'|'shareDrive'|'shareGmail'>) {setConfig(c=>({...c,[key]:!c[key]}));}
  return <div className="uko-brain" data-testid="page-assistant">
    <section className="uko-panel uko-brain-hero">
      <span className="uko-ai-symbol"><BrainCircuit size={32}/></span>
      <div><span className="uko-eyebrow">{t('brainKicker')}</span><h2>{t('brainTitle')}</h2><p>{t('brainIntro')}</p></div>
      <span className="uko-badge" data-testid="brain-mode">{t(saved.cloud?'brainCloudMode':'brainLocalMode')}</span>
    </section>
    {error&&<p className="uko-info error" role="alert" data-testid="brain-error">{t(error)}</p>}
    <div className="uko-brain-grid">
      <section className="uko-panel"><h2><CalendarClock size={19}/> {t('brainRules')}</h2>
        <form onSubmit={save} className="uko-stack"><fieldset disabled={busy||working} className="uko-stack">
          {(['enabled','autoMove'] as const).map(key=><label className="uko-check-label" key={key}><input type="checkbox" data-testid={`brain-${key}`} checked={config[key]} onChange={()=>toggle(key)}/>{t('brain_'+key)}</label>)}
          <div className="uko-form-grid"><label>{t('brainHour')}<input type="number" min={0} max={23} value={config.hour} data-testid="brain-hour" onChange={e=>setConfig(c=>({...c,hour:Number(e.target.value)}))}/></label><label>{t('brainTimeZone')}<select value={config.timeZone} onChange={e=>setConfig(c=>({...c,timeZone:e.target.value}))}><option value="Africa/Casablanca">Africa/Casablanca</option><option value="Europe/Paris">Europe/Paris</option><option value="UTC">UTC</option></select></label></div>
          <p className="uko-help">{t('brainRulesHelp')}</p>
          <label className="uko-check-label"><input type="checkbox" data-testid="brain-cloud" checked={config.cloud} onChange={()=>toggle('cloud')}/>{t('brain_cloud')}</label>
          <p className="uko-info"><ShieldCheck size={18}/>{t('brainCloudConsent')}</p>
          {(['shareDrive','shareGmail'] as const).map(key=><label className="uko-check-label" key={key}><input type="checkbox" checked={config[key]} onChange={()=>toggle(key)}/>{t('brain_'+key)}</label>)}
          <p className="uko-help">{t('brainExternalConsent')}</p>
          <button type="submit" className="uko-button" data-testid="brain-save">{t('save')}</button>
        </fieldset></form>
      </section>
      <section className="uko-panel"><h2><ShieldCheck size={19}/> {t('brainConnection')}</h2>
        <p data-testid="brain-server-status" className="uko-info">{t(server?.configured?'brainServerReady':'brainServerMissing')}</p>
        <p className="uko-help">{t('brainBackgroundHelp')}</p>
        {!server?.authenticated?<form className="uko-stack" onSubmit={e=>{e.preventDefault();void action(async()=>{await brainRequest('login',{password});setPassword('');await status();});}}>
          <label>{t('brainOwnerPassword')}<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required maxLength={1000}/></label>
          <button className="uko-button secondary" type="submit" disabled={working||!server?.configured}><LogIn size={17}/>{t('brainLogin')}</button>
        </form>:<button className="uko-text-button" onClick={()=>void action(async()=>{await brainRequest('logout',{});setTested(false);setDrive('');setGmail('');await status();})}>{t('brainLogout')}</button>}
        <div className="uko-brain-service"><strong>Gemini</strong><code dir="ltr">{modelId}</code><span className="uko-badge">{t(tested?'brainTested':server?.geminiKey?'brainKeyPresent':'notConfigured')}</span><button className="uko-button secondary" disabled={working||!server?.authenticated} onClick={()=>void action(async()=>{await brainRequest('test-model',{});setTested(true);})}>{t('brainTestModel')}</button></div>
        {(['drive','gmail'] as const).map(kind=><div className="uko-brain-service" key={kind}>
          <strong>{kind==='drive'?<><FileSearch size={17}/>Google Drive</>:<><Mail size={17}/>Gmail</>}</strong>
          <span className="uko-badge" dir="auto">{(kind==='drive'?drive:gmail)||t('notConfigured')}</span>
          <div className="uko-actions wrap"><button className="uko-button secondary" disabled={working||!server?.authenticated} onClick={()=>void connection(kind,true)}>{t('brainAuthorize')}</button><button className="uko-text-button" disabled={working||!server?.authenticated} onClick={()=>void connection(kind)}>{t('brainCheckAccount')}</button></div>
        </div>)}
        <p className="uko-help">{t('brainAccountHelp')}</p>
        <details><summary>{t('brainSetupTitle')}</summary><p>{t('brainSetupHelp')}</p><code className="uko-brain-env" dir="ltr">{(server?.missing||[]).join('\n')||'KNOWLEDGE_OWNER_PASSWORD\nKNOWLEDGE_OWNER_EMAIL\nCOMPOSIO_API_KEY\nCOMPOSIO_DRIVE_AUTH_CONFIG_ID\nCOMPOSIO_GMAIL_AUTH_CONFIG_ID'}</code></details>
      </section>
    </div>
    <section className="uko-panel"><div className="uko-section-heading"><h2><RefreshCw size={18}/>{t('brainReviewNow')}</h2><button className="uko-button" data-testid="brain-run" disabled={busy||working} onClick={()=>void run()}>{working?t('loading'):t('brainRun')}</button></div>
      <p className="uko-help">{t('brainLocalDisclosure')}</p>
      {saved.cloud&&<><div className="uko-actions wrap"><button className="uko-button secondary" disabled={working||!server?.authenticated} onClick={()=>void action(sync)}>{t('brainSync')}</button><button className="uko-button secondary" disabled={working||!server?.authenticated} onClick={()=>void action(pull)}>{t('brainPull')}</button><button className="uko-text-button" disabled={working} onClick={()=>void action(status)}>{t('brainRefresh')}</button></div><p dir="auto">{t('brainSnapshot')}: {snapshot||t('unknown')}</p></>}
      {!history.length&&<div className="uko-empty"><BrainCircuit size={28}/><p>{t('brainEmpty')}</p></div>}
      <div className="uko-brain-reports">{history.slice(0,10).map(report=><article className="uko-brain-report" key={report.id} data-testid="brain-report">
        <div className="uko-section-heading"><h3>{report.day}</h3><span className="uko-badge">{report.model||t('brainLocalMode')}</span></div>
        <p>{t('brainUnrecorded')}: <strong>{report.plan.overdue}</strong> · {t('brainMoves')}: <strong>{report.plan.moves.length}</strong> · {t(report.applied?'brainAutoApplied':'brainSuggestions')}</p>
        {report.summary&&<p className="uko-brain-summary" dir="auto">{report.summary}</p>}
        {report.plan.moves.map(move=>{const entry=data.records.find(e=>e.id===move.id);return <div className="uko-brain-move" key={move.id}><button className="uko-text-button" onClick={()=>entry&&inspect(entry)} disabled={!entry} dir="auto">{entry?.title||move.id}</button><span dir="ltr">{move.from} → {move.to}</span></div>;})}
        {report.plan.attention.map(item=><p key={item.id} dir="auto">{data.records.find(e=>e.id===item.id)?.title||item.id} — {t('brainReason_'+item.reason)}</p>)}
        {!report.applied&&report.plan.moves.length>0&&<button className="uko-button secondary" disabled={busy} data-testid="brain-apply" onClick={()=>void action(async()=>{
          const moved=applyMoves(data.records,report.plan.moves),counts={...saved.history};for(const m of moved.applied)counts[m.id]=Math.min(3,(counts[m.id]||0)+1);
          const record=reportRecord({...report,applied:true},data.settings.language);
          if(await commit(withConfig({...data,records:[...moved.records.filter(e=>e.id!==record.id),record]},{...saved,history:counts})))notify(t('brainApplied')+` (${moved.applied.length})`);
        })}><CheckCircle2 size={16}/>{t('brainApply')}</button>}
        {!!report.sources.length&&<details><summary>{t('brainSources')} ({report.sources.length})</summary>{report.sources.map(source=><p key={source.id} dir="auto">{source.title} · {t('brainSource_'+source.state)===('brainSource_'+source.state)?t('brainSource_providerError'):t('brainSource_'+source.state)}</p>)}</details>}
        {report.drivePending&&<p className="uko-info">{t('brainDrivePending')}</p>}
        {report.errors.map((code,index)=><p className="uko-info error" key={index}>{t(code)}</p>)}
      </article>)}</div>
    </section>
  </div>;
}
