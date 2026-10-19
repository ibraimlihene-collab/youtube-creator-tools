export type Region = { label: string; kind: string; box: [number, number, number, number] };
export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode image.')), 'image/png'));
}
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Could not open image.')); image.src = src; });
}
export function blankMask(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height); return canvas;
}
// A code-drawn practice thumbnail: no external image requests and no uploaded user data.
export function practiceThumbnail(): string {
  const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  const sky = ctx.createLinearGradient(0, 0, 1000, 720); sky.addColorStop(0, '#172f3e'); sky.addColorStop(.6, '#45776d'); sky.addColorStop(1, '#efb879'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#f7dcb1'; ctx.beginPath(); ctx.arc(940, 260, 122, 0, Math.PI * 2); ctx.fill();
  const mountains = [[[0,490],[260,220],[500,500],[760,160],[1130,520],[1280,330],[1280,720],[0,720]],[[0,600],[240,430],[560,640],[850,400],[1150,650],[1280,560],[1280,720],[0,720]]];
  mountains.forEach((points,i) => {ctx.fillStyle = i ? '#173c37' : '#31584d';ctx.beginPath();points.forEach(([x,y],n)=>n?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();});
  const shadow = ctx.createLinearGradient(0, 0, 1000, 0); shadow.addColorStop(0, '#091923dd'); shadow.addColorStop(1,'#09192300'); ctx.fillStyle=shadow;ctx.fillRect(0,0,1280,720);
  ctx.fillStyle = '#d0f382';ctx.font='bold 22px Arial';ctx.fillText('THE NEXT ADVENTURE',70,100);
  ctx.fillStyle='#fff';ctx.font='900 96px Arial';ctx.fillText('GO BEYOND',65,280);ctx.fillText('THE ORDINARY.',65,385);
  ctx.fillStyle='#d1ded9';ctx.font='25px Arial';ctx.fillText('A different kind of escape.',70,447);
  ctx.fillStyle='#d0f382';ctx.fillRect(70,490,140,6);
  ctx.fillStyle='#091c20';ctx.beginPath();ctx.arc(914,425,34,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(883,454);ctx.lineTo(945,454);ctx.lineTo(970,592);ctx.lineTo(940,592);ctx.lineTo(927,682);ctx.lineTo(908,682);ctx.lineTo(897,592);ctx.lineTo(866,592);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#091c20';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(888,474);ctx.lineTo(849,555);ctx.moveTo(939,474);ctx.lineTo(981,549);ctx.stroke();
  ctx.fillStyle='#d0f382';ctx.font='bold 18px Arial';ctx.fillText('FIELD NOTES  /  01',70,650);
  return canvas.toDataURL('image/png');
}
export function paintRegion(mask: HTMLCanvasElement, region: Region) {
  const [x,y,w,h]=region.box; const ctx=mask.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(x*mask.width,y*mask.height,w*mask.width,h*mask.height);
}
export async function downloadImage(src: string, filename: string, format: 'png'|'jpeg') {
  const image=await loadImage(src);const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,`image/${format}`,0.94));if(!blob)throw new Error('Export failed.');
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${filename}.${format==='jpeg'?'jpg':'png'}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
