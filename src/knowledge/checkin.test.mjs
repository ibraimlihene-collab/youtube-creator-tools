import { beforeEach, expect, test } from 'bun:test';
import { IDBFactory } from 'fake-indexeddb';
import { freshWorkspace, makeEntry, parseBackup, validateWorkspace, validateEntry } from './model';
import { loadWorkspace, saveWorkspace } from './storage';
import { saveSkill } from './weekly';
import { blankAnswers, spokenMinutes, validAnswers, prioritySources, readCheckin, saveCheckin, planToday, applyToday } from './checkin';
import { checkinAr, checkinFr } from './checkin-i18n';
const day='2026-11-06';
const answers=(change={})=>({...blankAnswers(),time:'45 minutes après les cours',minutes:90,priority:'Écrire un résumé',energy:'normal',...change});
const checkin=(change={})=>({version:1,day,step:3,answers:answers(),applied:false,...change});
const skill=(title='Étudier',change={})=>saveSkill({title,action:'Expliquer une idée',evidence:'Une réponse vérifiée',minutes:25,frequency:3,academic:false,subject:'',sources:[],language:'fr',...change});
const workspace=(records=[])=>({...freshWorkspace(),records});
const dated=(kind,duration='25',status='next')=>({...makeEntry(kind),title:kind,status,fields:{date:day,duration}});
beforeEach(()=>{globalThis.indexedDB=new IDBFactory();});

test('three answers require explicit time, priority and energy, with bilingual dictionary parity',()=>{
  expect(validAnswers(blankAnswers(),1)).toBe(false);
  expect(validAnswers({...blankAnswers(),minutes:0},1)).toBe(true);
  expect(validAnswers({...blankAnswers(),minutes:30},2)).toBe(false);
  expect(validAnswers(answers({energy:''}))).toBe(false);
  for(const minutes of [-1,721,1.5,NaN])expect(validAnswers(answers({minutes}))).toBe(false);
  expect(validAnswers(answers({priority:' '.repeat(2)}))).toBe(false);
  expect(validAnswers(answers({obstacle:'x'.repeat(2001)}))).toBe(false);
  expect(Object.keys(checkinAr).sort()).toEqual(Object.keys(checkinFr).sort());
  expect(Object.values(checkinAr).every(Boolean)).toBe(true);
});
test('duration understanding handles Arabic and French but requires review for ambiguous speech',()=>{
  for(const [text,minutes] of [['لدي ٤٥ دقيقة',45],['ساعة ونصف',90],['نصف ساعة',30],['ساعتين',120],['une heure et demie',90],['quarante-cinq minutes',45],['trente minutes',30],['1,5 heures',90],['0 minutes',0],['720 min',720]])expect(spokenMinutes(text)).toBe(minutes);
  for(const text of ['30 ou 60 minutes','1 heure 30 minutes','غدًا','721 minutes','1.2 min','-30 minutes'])expect(spokenMinutes(text)).toBe(null);
});
test('saved priorities exclude inactive records and reject stale selections',()=>{
  const goal={...makeEntry('goal'),title:'هدف'},done={...goal,id:'done',status:'completed'};
  expect(prioritySources([goal,done,makeEntry('journal')])).toEqual([goal]);
  expect(()=>planToday(workspace([done]),answers({priorityId:'done'}),day)).toThrow('priorityChanged');
  expect(()=>planToday(workspace(),answers({priorityId:'missing'}),day)).toThrow('priorityChanged');
});
test('custom priority precedes skills, capacity includes ten-minute gaps and preserves requested skill duration',()=>{
  const a=skill('A'),b=skill('B');
  let plan=planToday(workspace([a,b]),answers(),day);
  expect(plan.additions).toHaveLength(2);
  expect(plan.additions[0].kind).toBe('task');expect(plan.additions[0].title).toBe('Écrire un résumé');
  expect(plan.additions[1].links).toEqual([a.id]);expect(plan.additions[1].fields.duration).toBe('25');
  plan=planToday(workspace([skill('Long',{minutes:60})]),answers({minutes:55}),day);
  expect(plan.additions).toHaveLength(1);expect(plan.additions[0].kind).toBe('task');
  expect(planToday(workspace([a]),answers({minutes:0}),day).additions).toEqual([]);
  const low=planToday(workspace([a]),answers({energy:'low'}),day);
  expect(low.budget).toBe(30);expect(low.additions).toHaveLength(1);
});
test('completed work and deadlines reserve capacity, overload never moves or completes records',()=>{
  const done=dated('session','50','completed'),exam=dated('exam','60'),state=workspace([done,exam,skill()]);
  const before=JSON.stringify(state);
  const plan=planToday(state,answers({minutes:30}),day);
  expect(plan.load).toBe(120);expect(plan.limited).toBe(true);expect(plan.additions).toEqual([]);
  expect(plan.existing).toEqual([exam]);expect(JSON.stringify(state)).toBe(before);
});
test('imminent exams protect academics and custom optional work stays out',()=>{
  const optional=skill('Video'),academic=skill('Math',{academic:true}),exam={...dated('exam'),fields:{date:'2026-11-12'}};
  const plan=planToday(workspace([optional,academic,exam]),answers(),day);
  expect(plan.exam).toBe(true);expect(plan.additions).toHaveLength(1);expect(plan.additions[0].links).toEqual([academic.id]);
  expect(planToday(workspace([{...exam,status:'completed'},optional]),answers(),day).exam).toBe(false);
});
test('long imported IDs remain valid and related archived or moved sessions are not regenerated',()=>{
  const chosen={...skill(),id:'x'.repeat(120)},a=answers({priority:chosen.title,priorityId:chosen.id});
  const plan=planToday(workspace([chosen]),a,day);
  expect(plan.additions).toHaveLength(1);expect(validateEntry(plan.additions[0])).toBe(true);
  const archived={...plan.additions[0],status:'archived',fields:{...plan.additions[0].fields,date:'2026-11-07'}};
  expect(planToday(workspace([chosen,archived]),a,day).additions).toEqual([]);
  const lesson={...makeEntry('lesson'),title:'Cours'},linked=skill('Math',{sources:[lesson.id]});
  const session={...dated('session'),links:[lesson.id]};
  expect(planToday(workspace([linked,lesson,session]),answers({priorityId:linked.id}),day).additions).toEqual([]);
});
test('undated chosen task gets a linked session without changing its deadline or status',()=>{
  const task={...makeEntry('task'),title:'Lire'};
  const plan=planToday(workspace([task]),answers({priorityId:task.id}),day);
  expect(plan.additions[0].links).toEqual([task.id]);expect(task.fields.date).toBeUndefined();
  const saved=dated('task');
  expect(planToday(workspace([saved]),answers({priorityId:saved.id}),day).additions).toEqual([]);
});
test('daily checkin survives real IndexedDB reopen and JSON backup, application is idempotent',async()=>{
  let state=workspace([skill()]);
  const partial=checkin({step:1,answers:{...blankAnswers(),minutes:45,time:'٤٥ دقيقة'}});
  state=await saveWorkspace(saveCheckin(state,partial),0);
  expect(readCheckin((await loadWorkspace()).records,day)).toEqual(partial);
  state=await saveWorkspace(saveCheckin(state,checkin()),state.revision);
  state=await saveWorkspace(applyToday(state,checkin(),day),state.revision);
  const restored=await loadWorkspace(),backup=parseBackup(JSON.stringify(restored));
  expect(validateWorkspace(backup)).toBe(true);expect(readCheckin(backup.records,day).applied).toBe(true);
  expect(applyToday(restored,checkin(),day)).toBe(restored);
  expect(planToday(restored,answers({priority:'Changed words'}),day).additions).toEqual([]);
  expect(restored.records.every(e=>e.status!=='completed')).toBe(true);
  expect(()=>applyToday(restored,checkin(),'2026-11-07')).toThrow('dayChanged');
});
test('corrupt daily records remain intact and invalid replacements fail',()=>{
  const record={...makeEntry('review'),id:`uko-checkin-${day}`,title:'Existing',content:'broken'},state=workspace([record]);
  expect(()=>readCheckin(state.records,day)).toThrow('invalidCheckin');
  expect(()=>saveCheckin(state,checkin())).toThrow('invalidCheckin');expect(state.records[0]).toEqual(record);
  expect(()=>saveCheckin(workspace(),checkin({step:4}))).toThrow('invalidCheckin');
});
