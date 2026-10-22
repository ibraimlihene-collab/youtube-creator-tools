import {makeEntry,type Entry,type Workspace} from './model';
export interface CommandPage {id:string;title:string;url:string}
export interface CommandOperation {id:string;status:'prepared'|'sending'|'unknown'|'succeeded';page:CommandPage;content:string;createdAt:string;expiresAt:string;receipt?:{at:string;blockIds:string[]}}
export interface CommandDraft {instruction:string;source:string;output:string;query:string;pageId:string;model:string;operation:CommandOperation|null}
export const commandId='uko-assistant-command';
export const emptyCommand=():CommandDraft=>({instruction:'',source:'',output:'',query:'',pageId:'',model:'',operation:null});
export function parseOperation(value:unknown):CommandOperation|null {
  if(!value||typeof value!=='object')return null;
  const o=value as CommandOperation;
  if(typeof o.id!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(o.id)||!['prepared','sending','unknown','succeeded'].includes(o.status)||typeof o.content!=='string'||!o.content.trim()||o.content.length>8000||!o.page||typeof o.page.id!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(o.page.id)||typeof o.page.title!=='string'||o.page.title.length>500||o.page.url!=='https://www.notion.so/'+o.page.id.replaceAll('-','')||!Number.isFinite(Date.parse(o.createdAt))||!Number.isFinite(Date.parse(o.expiresAt)))return null;
  if(o.status==='succeeded'&&(!o.receipt||!Number.isFinite(Date.parse(o.receipt.at))||!Array.isArray(o.receipt.blockIds)||!o.receipt.blockIds.length||!o.receipt.blockIds.every(id=>typeof id==='string')))return null;
  return o;
}
export function readCommand(records:Entry[]):CommandDraft {
  try {
    const value=JSON.parse(records.find(e=>e.id===commandId)?.content||'{}'),draft=emptyCommand();
    for(const [key,max] of [['instruction',1000],['source',8000],['output',8000],['query',200],['pageId',500],['model',100]] as const)if(typeof value[key]==='string'&&value[key].length<=max)draft[key]=value[key];
    draft.operation=parseOperation(value.operation);return draft;
  }catch{return emptyCommand();}
}
export function withCommand(workspace:Workspace,draft:CommandDraft):Workspace {
  const old=workspace.records.find(e=>e.id===commandId),now=new Date().toISOString();
  const entry={...makeEntry('note',workspace.settings.language),id:commandId,title:workspace.settings.language==='ar'?'مسودة أمر المساعد':'Brouillon de commande',content:JSON.stringify(draft),status:'archived' as const,tags:['knowledge-command-draft'],createdAt:old?.createdAt||now,updatedAt:now};
  return {...workspace,records:[...workspace.records.filter(e=>e.id!==commandId),entry]};
}
