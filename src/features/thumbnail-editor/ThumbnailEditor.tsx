import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Brush, Check, ChevronDown, Download, Eraser, ImagePlus, Languages, Layers, LoaderCircle, LockKeyhole, Maximize2, RotateCcw, ShieldCheck, Sparkles, SquareDashed, Undo2, WandSparkles, X, ZoomIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { blankMask, canvasBlob, downloadImage, loadImage, paintRegion, practiceThumbnail } from './canvas';
import type { Region } from './canvas';
import './editor.css';

type Tool = 'brush'|'erase'|'protect'|'rectangle';
type View = 'selection'|'original'|'result'|'compare';
type Snapshot = { mask: ImageData; protectedMask: ImageData };

export default function ThumbnailEditor() {
  const { lang, toggleLang } = useApp(); const ar = lang === 'ar'; const tx = (en: string, arabic: string) => ar ? arabic : en;
  const [source, setSource] = useState(''); const [sourceVersion, setSourceVersion] = useState(0); const [filename,setFilename]=useState('adventure-thumbnail');
  const [dimensions,setDimensions]=useState({width:1280,height:720}); const [tool,setTool]=useState<Tool>('brush');
  const [brushSize,setBrushSize]=useState(64); const [prompt,setPrompt]=useState(''); const [view,setView]=useState<View>('selection');
  const [results,setResults]=useState<string[]>([]); const [resultIndex,setResultIndex]=useState(0); const [split,setSplit]=useState(50);
  const [busy,setBusy]=useState<'edit'|'analyze'|'variations'|null>(null); const [error,setError]=useState('');
  const [configured,setConfigured]=useState<boolean|null>(null); const [regions,setRegions]=useState<Region[]>([]);
  const [selected,setSelected]=useState(0); const [locked,setLocked]=useState(0); const [undoCount,setUndoCount]=useState(0);
  const [format,setFormat]=useState<'png'|'jpeg'>('png'); const [zoom,setZoom]=useState(false); const [notice,setNotice]=useState(''); const [ready,setReady]=useState(false);
  const overlay=useRef<HTMLCanvasElement>(null); const mask=useRef<HTMLCanvasElement|null>(null); const protection=useRef<HTMLCanvasElement|null>(null);
  const history=useRef<Snapshot[]>([]); const stroke=useRef<{x:number;y:number;lastX:number;lastY:number;tool:Tool}|null>(null);
  const input=useRef<HTMLInputElement>(null); const alive=useRef(true); const requestController=useRef<AbortController|null>(null);
  const fileVersion=useRef(0);

  useEffect(()=>{alive.current=true;setSource(practiceThumbnail());fetch('/api/health').then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(alive.current)setConfigured(Boolean(data.gemini));}).catch(()=>{if(alive.current)setConfigured(null);});return()=>{alive.current=false;requestController.current?.abort();};},[]);
  useEffect(()=>{
    if(!source)return; let disposed=false;setReady(false);
    loadImage(source).then(image=>{if(disposed)return;setDimensions({width:image.width,height:image.height});mask.current=blankMask(image.width,image.height);protection.current=blankMask(image.width,image.height);history.current=[];setUndoCount(0);setSelected(0);setLocked(0);setReady(true);});
    return()=>{disposed=true;};
  },[source,sourceVersion]);

  function redraw(rect?: {x:number;y:number;w:number;h:number}) {
    const canvas=overlay.current; if(!canvas||!mask.current||!protection.current)return;
    const ctx=canvas.getContext('2d')!;const width=mask.current.width,height=mask.current.height;
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    const edit=mask.current.getContext('2d')!.getImageData(0,0,width,height).data;
    const protect=protection.current.getContext('2d')!.getImageData(0,0,width,height).data;
    const pixels=ctx.createImageData(width,height);let editCount=0,lockCount=0;
    for(let i=0;i<edit.length;i+=4){
      if(protect[i]>127){pixels.data.set([129,151,255,130],i);lockCount++;}
      else if(edit[i]>127){pixels.data.set([199,242,116,120],i);editCount++;}
    }
    ctx.putImageData(pixels,0,0);if(rect){ctx.fillStyle='#c7f27466';ctx.fillRect(rect.x,rect.y,rect.w,rect.h);ctx.strokeStyle='#c7f274';ctx.lineWidth=3;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);}
    if(!rect){setSelected(editCount);setLocked(lockCount);}
  }
  useEffect(()=>{if(ready&&view==='selection')redraw();},[ready,view]); // Masks live in refs; drawing deliberately avoids a render per pixel.

  function remember(){if(!mask.current||!protection.current)return;history.current.push({mask:mask.current.getContext('2d')!.getImageData(0,0,dimensions.width,dimensions.height),protectedMask:protection.current.getContext('2d')!.getImageData(0,0,dimensions.width,dimensions.height)});if(history.current.length>8)history.current.shift();setUndoCount(history.current.length);}
  function undo(){const prior=history.current.pop();if(!prior)return;mask.current?.getContext('2d')!.putImageData(prior.mask,0,0);protection.current?.getContext('2d')!.putImageData(prior.protectedMask,0,0);setUndoCount(history.current.length);redraw();}
  function clear(){remember();for(const canvas of [mask.current,protection.current]){if(!canvas)continue;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);}redraw();}
  function point(e:PointerEvent<HTMLCanvasElement>){const rect=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-rect.left)*dimensions.width/rect.width,y:(e.clientY-rect.top)*dimensions.height/rect.height};}
  function paint(x:number,y:number,lastX:number,lastY:number,activeTool:Tool){const target=activeTool==='protect'?protection.current:mask.current;if(!target)return;const ctx=target.getContext('2d')!;ctx.strokeStyle=activeTool==='erase'?'#000':'#fff';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=brushSize;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,brushSize/2,0,Math.PI*2);ctx.fill();if(activeTool==='erase'&&protection.current){const lockedCtx=protection.current.getContext('2d')!;lockedCtx.strokeStyle='#000';lockedCtx.fillStyle='#000';lockedCtx.lineWidth=brushSize;lockedCtx.lineCap='round';lockedCtx.beginPath();lockedCtx.moveTo(lastX,lastY);lockedCtx.lineTo(x,y);lockedCtx.stroke();lockedCtx.beginPath();lockedCtx.arc(x,y,brushSize/2,0,Math.PI*2);lockedCtx.fill();}}
  function start(e:PointerEvent<HTMLCanvasElement>){if(busy||!ready||e.button!==0)return;e.preventDefault();remember();const p=point(e);stroke.current={...p,lastX:p.x,lastY:p.y,tool};e.currentTarget.setPointerCapture(e.pointerId);if(tool!=='rectangle'){paint(p.x,p.y,p.x,p.y,tool);redraw();}}
  function move(e:PointerEvent<HTMLCanvasElement>){const active=stroke.current;if(!active)return;const p=point(e);if(active.tool==='rectangle'){redraw({x:active.x,y:active.y,w:p.x-active.x,h:p.y-active.y});}else{paint(p.x,p.y,active.lastX,active.lastY,active.tool);redraw();}active.lastX=p.x;active.lastY=p.y;}
  function finish(e:PointerEvent<HTMLCanvasElement>){const active=stroke.current;if(!active)return;const p=point(e);if(active.tool==='rectangle'&&mask.current){const ctx=mask.current.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(Math.min(active.x,p.x),Math.min(active.y,p.y),Math.abs(p.x-active.x),Math.abs(p.y-active.y));}stroke.current=null;redraw();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}

  async function upload(file?:File){
    if(!file||busy)return;const version=++fileVersion.current;setError('');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024){setError(tx('Choose a PNG, JPG or WebP image smaller than 4 MB.','اختر صورة PNG أو JPG أو WebP بحجم أقل من 4 ميغابايت.'));return;}
    setReady(false); const url=URL.createObjectURL(file);
    try{const image=await loadImage(url);if(image.width*image.height>1920*1080){throw new Error(tx('Use an image up to 1920 × 1080 pixels. Resize it before uploading.','استعمل صورة حتى 1920 × 1080 بكسل. صغّرها قبل رفعها.'));}if(fileVersion.current!==version)return;const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d')!.drawImage(image,0,0);setSource(canvas.toDataURL('image/png'));setSourceVersion(version);setFilename(file.name.replace(/\.[^.]+$/,''));setResults([]);setRegions([]);setView('selection');setNotice('');}
    catch(e){if(fileVersion.current===version){setReady(true);setError(e instanceof Error?e.message:tx('Could not open this image.','تعذر فتح الصورة.'));}}finally{URL.revokeObjectURL(url);if(input.current)input.current.value='';}
  }
  async function run(operation:'edit'|'analyze'|'variations'){
    if(busy||!ready)return;setError('');setNotice('');
    if(operation!=='analyze'&&(!selected||!prompt.trim())){setError(tx('Paint a selection and describe your edit first.','ارسم التحديد واكتب التعديل المطلوب أولاً.'));return;}
    setBusy(operation);const controller=new AbortController();requestController.current=controller;const timer=setTimeout(()=>controller.abort(),100_000);
    try{
      const image=await loadImage(source);const original=document.createElement('canvas');original.width=image.width;original.height=image.height;original.getContext('2d')!.drawImage(image,0,0);
      const form=new FormData();form.append('image',await canvasBlob(original),'original.png');
      if(operation!=='analyze'){form.append('mask',await canvasBlob(mask.current!),'selection.png');form.append('protectedMask',await canvasBlob(protection.current!),'protected.png');form.append('prompt',prompt.trim());form.append('selectionMode',tool==='rectangle'?'rectangle':'brush');if(operation==='variations')form.append('count','2');}
      const response=await fetch(`/api/${operation}`,{method:'POST',body:form,signal:controller.signal});let data;
      try{data=await response.json();}catch{throw new Error(tx('The server returned an unreadable response. Please try again.','أعاد الخادم استجابة غير مقروءة. حاول مرة أخرى.'));}
      if(!response.ok)throw new Error(response.status===503?tx('AI is not configured yet. Add a new Gemini API key to the server environment.','الذكاء الاصطناعي غير مُهيّأ بعد. أضف مفتاح Gemini جديدًا إلى بيئة الخادم.'):String(data.error||tx('Request failed. Please try again.','فشل الطلب. حاول مرة أخرى.')));
      if(operation==='analyze'){if(!Array.isArray(data.regions))throw new Error(tx('Analysis returned no regions.','لم يُرجع التحليل مناطق.'));setRegions(data.regions);setNotice(tx('Analysis ready. Suggestions are approximate; refine the mask before editing.','التحليل جاهز. الاقتراحات تقريبية؛ حسّن التحديد قبل التعديل.'));}
      else{if(!Array.isArray(data.images)||!data.images.length||!data.images.every((s:unknown)=>typeof s==='string'&&s.startsWith('data:image/png;base64,')))throw new Error(tx('No edited image was returned.','لم تصل صورة معدلة.'));await Promise.all(data.images.map((s:string)=>loadImage(s)));setResults(data.images);setResultIndex(0);setView('compare');setNotice(tx('Your edit is ready. Pixels outside the selection are preserved.','التعديل جاهز. البكسلات خارج التحديد محفوظة.'));}
    }catch(e){if(alive.current)setError(e instanceof Error&&e.name!=='AbortError'?e.message:tx('Request timed out or was cancelled. Your original is safe.','انتهت مهلة الطلب أو أُلغي. الصورة الأصلية محفوظة.'));}
    finally{clearTimeout(timer);if(alive.current)setBusy(null);requestController.current=null;}
  }
  async function exportResult(){try{await downloadImage(results[resultIndex]||source,filename+(results.length?'-edited':'-original'),format);setNotice(tx('Download started.','بدأ التنزيل.'));}catch{setError(tx('Could not export the image. Please try again.','تعذر تنزيل الصورة. حاول مرة أخرى.'));}}
  function chooseRegion(region:Region,protect:boolean){if(!ready||busy)return;remember();paintRegion(protect?protection.current!:mask.current!,region);setView('selection');redraw();}
  const toolButtons:[Tool,typeof Brush,string,string][]=[['brush',Brush,'Paint selection','رسم التحديد'],['rectangle',SquareDashed,'Rectangle selection','تحديد مستطيل'],['erase',Eraser,'Erase selection or lock','مسح التحديد أو الحماية'],['protect',LockKeyhole,'Protect region','حماية منطقة']];
  const hasResult=results.length>0;
  return <div className="te" dir={ar?'rtl':'ltr'}>
    <header className="te-header"><Link className="te-brand" to="/app"><span className="te-brand-icon"><Layers size={19}/></span><span>YouCreator<span className="te-brand-sub"> / STUDIO</span></span></Link><span className="te-header-divider"/><div className="te-header-name">{tx('Thumbnail editor','محرّر الصور المصغّرة')}<span className="te-pill">AI</span></div><div className="te-header-actions"><button onClick={toggleLang} className="te-icon-button" title={ar?'English':'العربية'} data-testid="editor-language"><Languages size={18}/><span>{ar?'EN':'العربية'}</span></button><Link to="/app" className="te-back"><ArrowLeft size={16}/>{tx('All tools','كل الأدوات')}</Link></div></header>
    <main className="te-main" data-testid="thumbnail-editor">
      <div className="te-intro"><div><div className="te-eyebrow"><span/>{tx('SMALL CHANGES. BIG IMPACT.','تعديلات دقيقة. تأثير كبير.')}</div><h1>{tx('Your thumbnail,','صورتك المصغّرة،')} <em>{tx('reimagined.','برؤية جديدة.')}</em></h1><p>{tx('Change what you select. Keep everything else.','غيّر ما تحدده. واحتفظ بكل ما عداه.')}</p></div><div className="te-private"><ShieldCheck size={18}/><div>{tx('Your original stays safe','الأصل محفوظ دائمًا')}<small>{tx('Local selection · Secure AI editing','تحديد محلي · تعديل آمن بالذكاء الاصطناعي')}</small></div></div></div>
      <div className="te-steps"><span className="active"><b>01</b>{tx('Choose your image','اختر الصورة')}</span><i/><span className={selected?'active':''}><b>02</b>{tx('Select & describe','حدّد واكتب طلبك')}</span><i/><span className={hasResult?'active':''}><b>03</b>{tx('Review & export','راجع ونزّل')}</span></div>
      <div className={`te-workspace ${zoom?'te-workspace-expanded':''}`}>
        <section className="te-editor-panel">
          <div className="te-panel-header"><div><span className="te-dot"/>{filename}<small>{dimensions.width} × {dimensions.height}</small></div><button className="te-text-button" onClick={()=>input.current?.click()} disabled={!!busy}><ImagePlus size={16}/>{tx('Upload image','رفع صورة')}</button><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])} hidden/></div>
          <div className="te-viewbar"><div className="te-tabs">{([['selection','Selection','التحديد'],['original','Original','الأصل'],['result','Result','النتيجة'],['compare','Before / After','قبل / بعد']] as const).map(([value,en,arabic])=><button key={value} className={view===value?'active':''} disabled={(value==='result'||value==='compare')&&!hasResult} onClick={()=>setView(value)}>{tx(en,arabic)}</button>)}</div><button className="te-icon-button" aria-label={tx('Expand workspace','توسيع مساحة العمل')} onClick={()=>setZoom(!zoom)}><Maximize2 size={16}/></button></div>
          <div className="te-stage" onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files[0]);}}>
            <div className="te-toolrail">{toolButtons.map(([value,Icon,en,arabic])=><button key={value} data-testid={`tool-${value}`} className={tool===value&&view==='selection'?'active':''} title={tx(en,arabic)} aria-label={tx(en,arabic)} aria-pressed={tool===value&&view==='selection'} disabled={!!busy} onClick={()=>{setTool(value);setView('selection');}}><Icon size={19}/></button>)}<div className="te-rail-line"/><button onClick={undo} disabled={!undoCount||!!busy||view!=='selection'} aria-label={tx('Undo selection','تراجع عن التحديد')} title={tx('Undo selection','تراجع عن التحديد')}><Undo2 size={18}/></button><button onClick={clear} disabled={(!selected&&!locked)||!!busy||view!=='selection'} aria-label={tx('Clear selection and locks','مسح التحديد والحماية')} title={tx('Clear selection and locks','مسح التحديد والحماية')}><RotateCcw size={17}/></button></div>
            <div className="te-canvas-area"><div className="te-canvas-frame" style={{aspectRatio:`${dimensions.width}/${dimensions.height}`}} data-testid="editor-image">
              {source&&<img src={view==='result'?results[resultIndex]:source} alt={view==='result'?tx('Edited thumbnail','الصورة المعدلة'):tx('Original thumbnail','الصورة الأصلية')} draggable={false}/>}
              {view==='compare'&&hasResult&&<><img className="te-comparison-image" src={results[resultIndex]} alt={tx('Edited thumbnail','الصورة المعدلة')} style={{clipPath:`inset(0 0 0 ${split}%)`}}/><div className="te-split-line" style={{left:`${split}%`}}><span>↔</span></div><span className="te-before-label">{tx('BEFORE','قبل')}</span><span className="te-after-label">{tx('AFTER','بعد')}</span></>}
              {view==='selection'&&<canvas ref={overlay} className="te-mask-overlay" width={dimensions.width} height={dimensions.height} aria-label={tx('Paint the editable region on the thumbnail','ارسم المنطقة القابلة للتعديل على الصورة')} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}/>}
            </div>{view==='compare'?<label className="te-compare-control">{tx('Compare','المقارنة')}<input type="range" min="0" max="100" value={split} onChange={e=>setSplit(Number(e.target.value))} aria-label={tx('Before and after split','مقارنة قبل وبعد')}/></label>:<p className="te-canvas-hint">{view==='selection'?tx('Paint over the area you want to change. Drop a new image here anytime.','ارسم فوق المنطقة التي تريد تغييرها. يمكنك إسقاط صورة جديدة هنا.'):tx('Your original is never overwritten.','لا تُستبدل صورتك الأصلية أبدًا.')}</p>}</div>
          </div>
          <div className="te-bottom-toolbar"><label><Brush size={15}/>{tx('Brush size','حجم الفرشاة')}<input type="range" min="8" max="180" value={brushSize} onChange={e=>setBrushSize(Number(e.target.value))} disabled={!!busy} aria-label={tx('Brush size','حجم الفرشاة')}/><span>{brushSize}px</span></label><div><span className="te-key te-key-edit"/>{tx('Editable','قابل للتعديل')}<span className="te-key te-key-lock"/>{tx('Protected','محمي')}</div><span className="te-scale"><ZoomIn size={14}/>{tx('Fit','ملاءمة')}</span></div>
          <div className="te-selection-summary"><span><ShieldCheck size={15}/>{tx('Everything outside your selection is protected.','كل ما يقع خارج التحديد محمي.')}</span><strong>{(selected/(dimensions.width*dimensions.height)*100).toFixed(1)}% {tx('selected','محدد')}</strong></div>
        </section>
        <aside className="te-settings-panel">
          <div className="te-settings-heading"><WandSparkles size={19}/><h2>{tx('Make it yours','اجعلها كما تتخيّل')}</h2><span className="te-pill">AI</span></div>
          <div className="te-selection-card"><span className="te-selection-icon"><SquareDashed size={20}/></span><div><strong>{selected?tx('Selection ready','التحديد جاهز'):tx('Start with a selection','ابدأ بالتحديد')}</strong><small>{selected?tx('Only the green area will change.','ستتغير المنطقة الخضراء فقط.'):tx('Use the brush or rectangle tool.','استعمل الفرشاة أو أداة المستطيل.')}</small></div>{selected>0&&<Check size={17}/>}</div>
          <label className="te-field-label" htmlFor="edit-prompt">{tx('What would you like to change?','ما الذي تريد تغييره؟')}</label>
          <textarea id="edit-prompt" data-testid="edit-prompt" value={prompt} maxLength={2000} disabled={!!busy} onChange={e=>setPrompt(e.target.value)} placeholder={tx('e.g. Replace the person’s jacket with a bright yellow raincoat. Keep the pose and lighting.','مثال: غيّر سترة الشخص إلى معطف أصفر. حافظ على الوضعية والإضاءة.')} rows={5}/>
          <div className="te-prompt-meta"><span>{tx('Be specific. Great edits start with a clear idea.','كن دقيقًا. التعديل الجيد يبدأ بفكرة واضحة.')}</span><span>{prompt.length}/2000</span></div>
          <p className="te-small-label">{tx('A LITTLE INSPIRATION','بعض الإلهام')}</p><div className="te-prompt-chips">{[[ 'Golden-hour lighting','إضاءة الساعة الذهبية','Give the selected area warm golden-hour lighting, matching the original shadows.','أضف إضاءة دافئة للمنطقة المحددة مع الحفاظ على الظلال الأصلية.'],['Change outfit','تغيير الملابس','Replace the selected outfit with a yellow raincoat. Preserve the person’s pose.','استبدل الملابس المحددة بمعطف أصفر مع الحفاظ على وضعية الشخص.'],['Remove an object','إزالة عنصر','Remove the selected object and fill the area naturally to match the surrounding background.','أزل العنصر المحدد واملأ مكانه بما يتناسب مع الخلفية.']].map(([en,arabic,value,arabicValue])=><button key={en} disabled={!!busy} onClick={()=>setPrompt(tx(value,arabicValue))}>{tx(en,arabic)}<ArrowUpRight size={12}/></button>)}</div>
          <div className="te-preserve"><LockKeyhole size={16}/><div><strong>{tx('Preserve the details','حافظ على التفاصيل')}<small>{tx('Black mask = untouched. Add blue locks for extra protected regions.','القناع الأسود محفوظ. أضف الحماية الزرقاء للمناطق التي لا تريد تعديلها.')}</small></strong></div></div>
          <button data-testid="edit-submit" className="te-primary" onClick={()=>run('edit')} disabled={!ready||!selected||!prompt.trim()||!!busy}>{busy==='edit'?<LoaderCircle className="te-spin" size={18}/>:<Sparkles size={18}/>} {busy==='edit'?tx('Reimagining your selection…','جارٍ تعديل المنطقة…'):tx('Generate edit','تنفيذ التعديل')} {!busy&&<ArrowUpRight size={18}/>}</button>
          <button className="te-secondary" onClick={()=>run('variations')} disabled={!ready||!selected||!prompt.trim()||!!busy}>{busy==='variations'?<LoaderCircle className="te-spin" size={16}/>:<Layers size={16}/>} {tx('Create 2 variations','إنشاء بديلين')}</button>
          {busy&&<button className="te-cancel" onClick={()=>requestController.current?.abort()}><X size={13}/>{tx('Cancel request','إلغاء الطلب')}</button>}
          <div className={`te-provider-status ${configured?'connected':''}`}><span/>{configured===true?tx('Gemini configured · Server-side','Gemini مُهيّأ · عبر الخادم'):configured===false?tx('AI setup needed · Editor ready','يلزم إعداد AI · المحرّر جاهز'):tx('AI connection unavailable','اتصال AI غير متاح')}</div>
          {configured===false&&<p className="te-config-note">{tx('The site owner needs to add a new Gemini key to the server. You can still select, protect, and export your original.','يلزم إضافة مفتاح Gemini جديد للخادم. يمكنك الآن التحديد والحماية وتنزيل الأصل.')}</p>}
          <div className="te-analysis-header"><span>{tx('Image insights','تحليل الصورة')}</span><button data-testid="analyze-image" className="te-text-button" onClick={()=>run('analyze')} disabled={!ready||!!busy}>{busy==='analyze'?<LoaderCircle className="te-spin" size={13}/>:<Sparkles size={13}/>} {tx('Analyze','تحليل')}</button></div>
          {regions.length?<><p className="te-config-note">{tx('Approximate boxes. Refine with the brush.','مربعات تقريبية. حسّنها بالفرشاة.')}</p><div className="te-regions">{regions.map((region,i)=><div key={i}><button disabled={!!busy} onClick={()=>chooseRegion(region,false)}>{region.label}<small>{region.kind}</small></button><button disabled={!!busy} onClick={()=>chooseRegion(region,true)} aria-label={tx(`Protect ${region.label}`,`حماية ${region.label}`)}><LockKeyhole size={13}/></button></div>)}</div></>:<p className="te-config-note">{tx('Find suggested subjects, objects, text and logos with AI.','اعثر على الأشخاص والعناصر والنصوص والشعارات بالذكاء الاصطناعي.')}</p>}
        </aside>
      </div>
      <div className="te-status" aria-live="polite">{error&&<div className="te-error" role="alert" data-testid="editor-error"><span>{error}</span><button onClick={()=>setError('')} aria-label={tx('Dismiss error','إغلاق الخطأ')}><X size={16}/></button></div>}{notice&&<div className="te-notice"><Check size={16}/>{notice}</div>}</div>
      <section className="te-export"><div><span className="te-export-icon"><Download size={20}/></span><div><h3>{hasResult?tx('Ready for the next upload.','جاهزة للفيديو القادم.'):tx('Made for your next great video.','من أجل فيديوك القادم.')}</h3><p>{hasResult?tx('Review your result, then take it with you.','راجع النتيجة ثم نزّلها.'):tx('Your image. Your vision. Every pixel in your control.','صورتك. رؤيتك. كل بكسل تحت سيطرتك.')}</p></div></div>{hasResult&&<div className="te-variants">{results.map((src,i)=><button className={i===resultIndex?'active':''} key={i} onClick={()=>{setResultIndex(i);setView('compare');}} aria-label={tx(`View variation ${i+1}`,`عرض البديل ${i+1}`)}><img src={src} alt={tx(`Variation ${i+1}`,`البديل ${i+1}`)}/></button>)}</div>}<div className="te-export-actions"><label>{tx('Format','الصيغة')}<select value={format} onChange={e=>setFormat(e.target.value as 'png'|'jpeg')}><option value="png">PNG</option><option value="jpeg">JPG</option></select><ChevronDown size={13}/></label><button className="te-download" onClick={exportResult} disabled={!ready||!!busy}><Download size={16}/>{hasResult?tx('Download result','تنزيل النتيجة'):tx('Download original','تنزيل الأصل')}</button></div></section>
      <footer className="te-footer"><span>{tx('SELECT WITH INTENTION. CREATE WITH CONFIDENCE.','حدّد بدقة. وأبدع بثقة.')}</span><span><ShieldCheck size={13}/>{tx('No images saved on our server','لا نخزّن صورك على الخادم')}</span></footer>
    </main>
  </div>;
}
