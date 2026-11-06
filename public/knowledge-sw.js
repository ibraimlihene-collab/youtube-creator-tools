// Push-only worker: no app-shell cache, private records or API interception.
self.addEventListener('push',event=>{
  let payload;try{payload=event.data.json();}catch{return;}
  if(!payload||!['daily','test'].includes(payload.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(payload.day))return;
  const french=payload.language==='fr';
  event.waitUntil(self.registration.showNotification(french?'Votre journée en trois questions':'يومك في ثلاثة أسئلة',{
    body:french?'Ouvrez votre conversation pour préparer la journée.':'افتح محادثة اليوم لاختيار خطتك.',
    lang:french?'fr':'ar',dir:french?'ltr':'rtl',icon:'/knowledge-icon.svg',
    tag:`uko-${payload.kind}-${payload.day}`,renotify:false,data:{path:'/knowledge/assistant?today=1'},
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL('/knowledge/assistant?today=1',self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    const client=windows.find(w=>new URL(w.url).origin===self.location.origin&&new URL(w.url).pathname.startsWith('/knowledge'));
    if(client){await client.navigate(target);return client.focus();}
    return self.clients.openWindow(target);
  }));
});
