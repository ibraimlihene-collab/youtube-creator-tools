import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight,MessageSquareText,NotebookPen,ShieldCheck} from 'lucide-react';
import {useKnowledge} from './context';
import {brainRequest} from './brain';
import {brainTranslator} from './brain-i18n';
import {commandTranslator} from './command-i18n';
import {emptyCommand,readCommand,withCommand,parseOperation,type CommandDraft,type CommandPage} from './command-state';
import {makeEntry} from './model';
import './commands.css';

export function CommandLink() {
  const {data,t}=useKnowledge();
  return <Link className="uko-button secondary" to="/knowledge/assistant?commands=1" data-testid="command-entry"><MessageSquareText size={17}/>{commandTranslator(data.settings.language,t)('entry')}</Link>;
}
export default function CommandsWorkspace() {
  const {data,t:sharedT,busy,commit,notify}=useKnowledge();
  const t=commandTranslator(data.settings.language,brainTranslator(data.settings.language,sharedT));
  const current=useRef({data,commit});current.current={data,commit};
  const [draft,setDraft]=useState<CommandDraft>(()=>readCommand(data.records));
  const [server,setServer]=useState<{configured:boolean;authenticated:boolean;geminiKey:boolean;composioKey:boolean}|null>(null);
  const [working,setWorking]=useState(false),[error,setError]=useState(''),[consent,setConsent]=useState(false),[notionConsent,setNotionConsent]=useState(false);
  const [pages,setPages]=useState<CommandPage[]>([]),[cursor,setCursor]=useState<string|null>(null),[searched,setSearched]=useState(false);
  const [saved,setSaved]=useState(false);
  const [verifiedId,setVerifiedId]=useState('');
  const inFlight=useRef(false);
  const operation=draft.operation,locked=!!operation;
  const remote=!!server?.configured&&!!server.authenticated&&!!server.composioKey;
  const records=data.records.filter(e=>['note','knowledge','lesson','resource','research'].includes(e.kind)&&!e.id.startsWith('uko-')&&!e.tags.some(tag=>tag.startsWith('knowledge-command')));
  async function status(){setServer(await brainRequest('status'));}
  useEffect(()=>{void brainRequest('status').then(setServer).catch(()=>setError('backendUnavailable'));},[]);
  async function action(fn:()=>Promise<void>) {
    if(inFlight.current)return;inFlight.current=true;setWorking(true);setError('');
    try{await fn();}catch(e){setError(e instanceof Error?e.message:'error');}finally{inFlight.current=false;setWorking(false);}
  }
  function change(patch:Partial<CommandDraft>) {setDraft(d=>({...d,...patch}));setSaved(false);}
  async function persist(next:CommandDraft) {
    if(!await current.current.commit(withCommand(current.current.data,next)))throw new Error('commandSaveFailed');
    setDraft(next);setSaved(true);
  }
  async function useExact() {
    if(!draft.source.trim())throw new Error('commandNoText');
    await persist({...draft,output:draft.source,model:'',operation:null});
  }
  async function generate() {
    await persist(draft);
    const result=await brainRequest('command-draft',{instruction:draft.instruction,source:draft.source,consent});
    await persist({...draft,output:result.text,query:result.query,model:result.model,operation:null});
  }
  async function search(more=false) {
    await persist(draft);
    const result=await brainRequest('command-search',{query:draft.query,...(more&&cursor?{cursor}:{})});
    setPages([...new Map<string,CommandPage>((more?[...pages,...result.pages]:result.pages).map((p:CommandPage)=>[p.id,p])).values()]);setCursor(result.cursor);setSearched(true);
  }
  async function prepare() {
    await persist(draft);
    const result=await brainRequest('command-prepare',{pageId:draft.pageId,content:draft.output,consent:notionConsent});
    const prepared=parseOperation(result.operation);if(!prepared)throw new Error('error');
    setVerifiedId(prepared.id);
    setDraft({...draft,operation:prepared});
    await persist({...draft,operation:prepared});
  }
  async function execute() {
    if(!operation||verifiedId!==operation.id)return;
    const next={...draft,operation:{...operation,status:'sending' as const}};
    await persist(next);
    try {
      const result=await brainRequest('command-execute',{id:operation.id,confirm:true});
      const confirmed=parseOperation(result.operation);if(!confirmed)throw new Error('commandUncertain');
      setDraft({...draft,operation:confirmed});await persist({...draft,operation:confirmed});
    }catch(e){setError(e instanceof Error?e.message:'commandUncertain');}
  }
  async function check() {
    if(!operation)return;
    const result=await brainRequest('command-result',{id:operation.id});
    const checked=parseOperation(result.operation);if(!checked)throw new Error('error');
    await persist({...draft,operation:checked});
    setVerifiedId(checked.id);
  }
  async function startNew() {
    if(!window.confirm(t('newConfirm')))return;
    const ws=current.current.data,archive={...makeEntry('note',ws.settings.language),title:t('title'),content:JSON.stringify(draft),status:'archived' as const,tags:['knowledge-command-archive']};
    const next=withCommand({...ws,records:[...ws.records,archive]},emptyCommand());
    if(!await current.current.commit(next))throw new Error('commandSaveFailed');
    setDraft(emptyCommand());setVerifiedId('');setPages([]);setCursor(null);setSearched(false);setConsent(false);setNotionConsent(false);setSaved(true);
  }
  return <div className="uko-command" data-testid="page-commands" aria-busy={working}>
    <section className="uko-panel uko-command-hero"><span className="uko-ai-symbol"><MessageSquareText size={30}/></span><div><span className="uko-eyebrow">Gemini · Composio · Notion</span><h2>{t('title')}</h2><p>{t('intro')}</p></div><Link className="uko-text-button" to="/knowledge/assistant">{t('back')}<ArrowUpRight size={16}/></Link></section>
    <p className="uko-info"><ShieldCheck size={18}/>{t('scope')}</p>
    <div className="uko-command-status"><p className="uko-help" data-testid="command-server-status">{t(remote?'ready':'blocked')}</p><button type="button" className="uko-text-button" disabled={working} onClick={()=>void action(status)}>{t('refresh')}</button></div>
    {error&&<p className="uko-info error" role="alert" data-testid="command-error">{t(error)===error?t('error'):t(error)}</p>}
    <div role="status" className="uko-help" data-testid="command-save-status">{working?t('busy'):t(saved?'saved':'unsaved')}</div>
    {!locked?<>
      <section className="uko-panel"><h2><MessageSquareText size={19}/>{t('step1')}</h2><form onSubmit={e=>{e.preventDefault();void action(generate);}} className="uko-stack"><fieldset disabled={working||busy} className="uko-stack">
        <label>{t('instruction')}<textarea data-testid="command-instruction" value={draft.instruction} maxLength={1000} rows={2} placeholder={t('placeholder')} onChange={e=>change({instruction:e.target.value})}/></label>
        <label>{t('record')}<select data-testid="command-record" defaultValue="" onChange={e=>{const entry=records.find(r=>r.id===e.target.value);if(entry){if(entry.content.length>8000){setError('commandTooLong');return;}change({source:entry.content});}}}><option value="">{t('none')}</option>{records.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>
        <label>{t('source')}<textarea data-testid="command-source" value={draft.source} maxLength={8000} rows={5} dir="auto" onChange={e=>change({source:e.target.value})}/></label><p className="uko-help">{t('sourceHelp')}</p>
        <label className="uko-check-label"><input type="checkbox" checked={consent} data-testid="command-gemini-consent" onChange={e=>setConsent(e.target.checked)}/>{t('consent')}</label>
        <div className="uko-actions wrap"><button type="submit" className="uko-button" data-testid="command-generate" disabled={!consent||!server?.authenticated||!server.geminiKey||!draft.instruction.trim()}>{t('generate')}</button><button type="button" className="uko-button secondary" data-testid="command-exact" disabled={!draft.source.trim()} onClick={()=>void action(useExact)}>{t('exact')}</button><button type="button" className="uko-text-button" data-testid="command-save" onClick={()=>void action(async()=>{await persist(draft);notify(t('saved'));})}>{t('save')}</button></div>
      </fieldset></form></section>
      <section className="uko-panel"><h2><NotebookPen size={19}/>{t('step2')}</h2><fieldset disabled={working||busy} className="uko-stack">
        <p className="uko-help" data-testid="command-provenance">{draft.model?t('suggestion'):t('local')}</p>
        <label>{t('output')}<textarea data-testid="command-output" value={draft.output} maxLength={8000} rows={6} dir="auto" onChange={e=>change({output:e.target.value})}/></label>
        <div className="uko-command-search"><label>{t('query')}<input data-testid="command-query" value={draft.query} maxLength={200} onChange={e=>{change({query:e.target.value});setCursor(null);setPages([]);setSearched(false);}}/></label><button className="uko-button secondary" disabled={!remote} data-testid="command-search" onClick={()=>void action(()=>search())}>{t('search')}</button></div>
        {searched&&!pages.length&&<p className="uko-help">{t('empty')}</p>}
        <div className="uko-command-pages">{pages.map(p=><button type="button" className="uko-button secondary" key={p.id} onClick={()=>change({pageId:p.id})} dir="auto">{p.title||p.id}</button>)}</div>
        {cursor&&<button className="uko-text-button" onClick={()=>void action(()=>search(true))}>{t('more')}</button>}
        <label>{t('target')}<input data-testid="command-target" dir="ltr" value={draft.pageId} maxLength={500} onChange={e=>change({pageId:e.target.value})}/></label><p className="uko-help">{t('targetHelp')}</p>
        <label className="uko-check-label"><input type="checkbox" data-testid="command-notion-consent" checked={notionConsent} onChange={e=>setNotionConsent(e.target.checked)}/>{t('notionConsent')}</label>
        <button className="uko-button" data-testid="command-prepare" disabled={!remote||!notionConsent||!draft.output.trim()||!draft.pageId.trim()} onClick={()=>void action(prepare)}>{t('prepare')}</button>
      </fieldset></section>
    </>:<section className="uko-panel uko-stack" data-testid="command-preview"><h2>{t('step3')}</h2><p className="uko-badge" data-testid="command-operation-status">{t(verifiedId===operation.id?'status_'+operation.status:'savedPreview')}</p><h3 dir="auto">{operation.page.title||operation.page.id}</h3><a href={operation.page.url} target="_blank" rel="noopener noreferrer">{t('open')}<ArrowUpRight size={16}/></a><p className="uko-command-text" dir="auto">{operation.content}</p><p className="uko-help">{t('previewHelp')}</p><p className="uko-help">{t('operation')}: <bdi>{operation.id}</bdi></p>
      {operation.status==='prepared'&&(Date.parse(operation.expiresAt)>Date.now()?<button className="uko-button" data-testid="command-confirm" disabled={working||busy||!remote||verifiedId!==operation.id} onClick={()=>void action(execute)}>{t('confirm')}</button>:<p className="uko-info">{t('expired')}</p>)}
      <div className="uko-actions wrap"><button className="uko-button secondary" data-testid="command-result" disabled={working||!remote} onClick={()=>void action(check)}>{t('check')}</button><button className="uko-text-button" data-testid="command-new" disabled={working||busy} onClick={()=>void action(startNew)}>{t('new')}</button></div>
    </section>}
    <p className="uko-help">{t('history')}</p>
  </div>;
}
