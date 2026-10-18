export const WIDTH = 1280;
export const HEIGHT = 720;
export const PRESETS = {
  bold: {
    background: '#f6c746',
    foreground: '#ffffff',
    accent: '#f6c746',
    panel: '#20251f',
    label: 'Bold',
    labelAr: 'جريء',
  },
  clean: {
    background: '#dbe9dd',
    foreground: '#183e33',
    accent: '#23765c',
    panel: '#f7faf5',
    label: 'Fresh',
    labelAr: 'بسيط',
  },
  spotlight: {
    background: '#25203d',
    foreground: '#ffffff',
    accent: '#c6afff',
    panel: '#19152e',
    label: 'Spotlight',
    labelAr: 'أضواء',
  },
} as const;
export type Preset = keyof typeof PRESETS;
export type Design = {
  preset: Preset;
  headline: string;
  caption: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
  overlay: number;
  imageX: number;
  imageY: number;
};
export const initialDesign = (ar = false): Design => ({
  preset: 'bold',
  headline: ar ? 'فكرتك\nتستحق المشاهدة.' : 'MAKE IT\nHAPPEN.',
  caption: ar ? 'فيديوك القادم يبدأ هنا' : 'YOUR NEXT GREAT VIDEO',
  color: '#ffffff',
  fontSize: 116,
  x: 7,
  y: 32,
  overlay: 65,
  imageX: 50,
  imageY: 50,
});

export function wrapText(
  text: string,
  measure: (value: string) => number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (measure(word) > maxWidth) {
        if (line) {
          lines.push(line);
          line = '';
        }
        for (const char of Array.from(word)) {
          if (line && measure(line + char) > maxWidth) {
            lines.push(line);
            line = char;
          } else line += char;
        }
      } else if (line && measure(line + ' ' + word) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = line ? line + ' ' + word : word;
    }
    lines.push(line);
  }
  return lines;
}

export function coverRect(width: number, height: number, x = 50, y = 50) {
  const scale = Math.max(WIDTH / width, HEIGHT / height);
  const w = width * scale;
  const h = height * scale;
  return { x: ((WIDTH - w) * x) / 100, y: ((HEIGHT - h) * y) / 100, width: w, height: h };
}

export function drawDesign(
  canvas: HTMLCanvasElement,
  design: Design,
  photo: HTMLImageElement | null,
  rtl = false
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  const preset = PRESETS[design.preset];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = preset.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (photo) {
    const rect = coverRect(photo.naturalWidth, photo.naturalHeight, design.imageX, design.imageY);
    ctx.drawImage(photo, rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = `rgba(0, 0, 0, ${design.overlay / 100})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = preset.panel;
    ctx.fillRect(rtl ? WIDTH * 0.34 : 0, 0, WIDTH * 0.66, HEIGHT);
    ctx.save();
    ctx.translate(rtl ? 170 : 1110, 260);
    ctx.rotate(-0.3);
    ctx.strokeStyle =
      design.preset === 'clean' ? '#85aa91' : design.preset === 'bold' ? '#b8801e' : preset.accent;
    ctx.lineWidth = 78;
    ctx.beginPath();
    ctx.arc(0, 0, 195, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 275, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = preset.accent;
    ctx.fillRect(rtl ? 310 : 910, 585, 75, 16);
  }
  const fontFamily = '"Inter", "Noto Sans Arabic", sans-serif';
  const x = rtl ? WIDTH * (1 - design.x / 100) : (WIDTH * design.x) / 100;
  const maxWidth = WIDTH * (1 - design.x / 100) - 64;
  let fontSize = design.fontSize;
  let lines: string[] = [];
  const top = (HEIGHT * design.y) / 100;
  do {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    lines = wrapText(design.headline, (value) => ctx.measureText(value).width, maxWidth);
    if (top + lines.length * fontSize * 1.13 < HEIGHT - 75 || fontSize <= 24) break;
    fontSize -= 2;
  } while (fontSize >= 24);
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textAlign = rtl ? 'right' : 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = design.color;
  ctx.shadowColor = photo ? '#00000099' : 'transparent';
  ctx.shadowBlur = photo ? 15 : 0;
  lines.forEach((line, index) => ctx.fillText(line, x, top + index * fontSize * 1.13));
  ctx.shadowBlur = 0;
  ctx.font = `600 25px ${fontFamily}`;
  const captionY = Math.min(HEIGHT - 45, Math.max(top - 57, 24));
  ctx.fillStyle = photo ? '#ffffff' : preset.accent;
  if (design.preset === 'clean' && !photo) ctx.fillStyle = preset.foreground;
  ctx.fillText(design.caption, x, captionY, maxWidth);
}

export function isSupportedImage(file: Pick<File, 'type' | 'size'>) {
  return (
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
    file.size > 0 &&
    file.size <= 10 * 1024 * 1024
  );
}
