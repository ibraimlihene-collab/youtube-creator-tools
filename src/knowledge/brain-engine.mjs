// Shared deterministic rules. Model output never changes dates or marks work complete.
export const modelId = 'gemini-3.5-flash-lite';
export const configId = 'uko-daily-brain-config';
export const eligibleKinds = ['task', 'session'];
const inactive = ['completed', 'archived', 'paused', 'waiting', 'blocked'];
export function validDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}
export function dayPlus(day, offset) {
  return new Date(Date.parse(`${day}T12:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);
}
export function defaults() {
  return { version: 1, enabled: false, autoMove: false, cloud: false, shareDrive: false,
    shareGmail: false, shareNotion: false, emailReports: false, hour: 18, timeZone: 'Africa/Casablanca', history: {} };
}
export function readConfig(records) {
  try {
    const value = JSON.parse(records.find(e => e.id === configId)?.content || '{}');
    const config = defaults();
    for (const key of ['enabled','autoMove','cloud','shareDrive','shareGmail','shareNotion','emailReports'])
      if (typeof value[key] === 'boolean') config[key] = value[key];
    if (Number.isInteger(value.hour) && value.hour >= 0 && value.hour <= 23) config.hour = value.hour;
    if (typeof value.timeZone === 'string') {
      try { new Intl.DateTimeFormat('en', {timeZone:value.timeZone}); config.timeZone = value.timeZone; } catch { /* Keep safe default. */ }
    }
    if (value.history && typeof value.history === 'object' && !Array.isArray(value.history))
      for (const [id, count] of Object.entries(value.history).slice(0,10000))
        if (Number.isInteger(count) && count >= 0 && count <= 3) config.history[id] = count;
    return config;
  } catch { return defaults(); }
}
export function zonedDay(now, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function zonedHour(now, timeZone) {
  return Number(new Intl.DateTimeFormat('en-GB', {timeZone,hour:'2-digit',hourCycle:'h23'}).format(now));
}
export function taskSnapshot(records) {
  return records.filter(e => ['task','session','homework','exam'].includes(e.kind)).map(e => ({
    id:e.id, kind:e.kind, title:e.title.slice(0,500), status:e.status, updatedAt:e.updatedAt,
    fields:Object.fromEntries(['date','time','duration','subject','priority'].filter(k=>e.fields[k]).map(k=>[k,e.fields[k]])),
  }));
}
const minutes = e => Math.max(1, Math.min(1440, Number(e.fields.duration) || 25));
function overlap(a,b) {
  if (!a.fields.time || !b.fields.time) return false;
  const start = e => Number(e.fields.time.slice(0,2))*60+Number(e.fields.time.slice(3));
  return start(a) < start(b)+minutes(b)+10 && start(b) < start(a)+minutes(a)+10;
}
export function planReview(records, day, capacity, history = {}) {
  if (!validDay(day) || !Number.isInteger(capacity) || capacity < 15 || capacity > 720) throw new Error('invalidData');
  const active = records.filter(e=>!inactive.includes(e.status));
  const overdue = active.filter(e=>['task','session','homework','exam'].includes(e.kind) && validDay(e.fields.date) && e.fields.date < day);
  const placements = active.filter(e=>['task','session','homework','exam'].includes(e.kind) && validDay(e.fields.date) && e.fields.date >= day).map(e=>({...e,fields:{...e.fields}}));
  const candidates = overdue.filter(e=>eligibleKinds.includes(e.kind)).sort((a,b)=> {
    const academic = e => !!e.fields.subject || e.kind==='session';
    return Number(academic(b))-Number(academic(a)) || Number(b.fields.priority==='high')-Number(a.fields.priority==='high') || a.fields.date.localeCompare(b.fields.date) || a.id.localeCompare(b.id);
  });
  const moves = [], attention = overdue.filter(e=>!eligibleKinds.includes(e.kind)).map(e=>({id:e.id,reason:'fixedDeadline'}));
  for (const task of candidates) {
    if(task.fields.time) {
      const start=Number(task.fields.time.slice(0,2))*60+Number(task.fields.time.slice(3));
      if(start<420||start+minutes(task)>1320){attention.push({id:task.id,reason:'protectedHours'});continue;}
    }
    if ((history[task.id] || 0) >= 3) { attention.push({id:task.id,reason:'repeated'});continue; }
    let target;
    for(let offset=0;offset<7;offset++) {
      const date=dayPlus(day,offset), same=placements.filter(e=>e.fields.date===date);
      if (same.reduce((sum,e)=>sum+minutes(e),0)+minutes(task)<=capacity && !same.some(e=>overlap(task,e))) {target=date;break;}
    }
    if (!target) {attention.push({id:task.id,reason:'capacity'});continue;}
    moves.push({id:task.id,from:task.fields.date,to:target,expectedUpdatedAt:task.updatedAt});
    placements.push({...task,fields:{...task.fields,date:target}});
  }
  return {day,moves,attention,overdue:overdue.length};
}
export function applyMoves(records, moves, now = new Date().toISOString()) {
  const accepted = new Map(moves.filter(m=>validDay(m.from)&&validDay(m.to)).map(m=>[m.id,m]));
  const applied=[];
  const next=records.map(e=> {
    const move=accepted.get(e.id);
    if (!move || !eligibleKinds.includes(e.kind) || inactive.includes(e.status) || e.fields.date!==move.from || e.updatedAt!==move.expectedUpdatedAt) return e;
    applied.push(move);
    return {...e,fields:{...e.fields,date:move.to},updatedAt:now};
  });
  return {records:next,applied};
}
