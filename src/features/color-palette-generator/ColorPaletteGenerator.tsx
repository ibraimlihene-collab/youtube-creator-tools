import { useState, useEffect, useRef } from 'react';

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

// Helper function to convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};


const ColorPaletteGenerator = ({ t }: { t: any }) => {
  const [baseColor, setBaseColor] = useState('#FF6347');
  const [paletteType, setPaletteType] = useState('analogous');
  const [colors, setColors] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setBaseColor(randomColor);
    return randomColor;
  };

  const generatePalette = (color = baseColor, type = paletteType) => {
    const [h, s, l] = hexToHsl(color);
    let newColors: string[] = [color];

    switch (type) {
      case 'complementary':
        newColors.push(hslToHex((h + 180) % 360, s, l));
        newColors.push(hslToHex(h, s, Math.max(0, l - 20)));
        newColors.push(hslToHex((h + 180) % 360, s, Math.max(0, l - 20)));
        newColors.push(hslToHex(h, s, Math.min(100, l + 20)));
        break;
      case 'analogous':
        newColors.push(hslToHex((h + 30) % 360, s, l));
        newColors.push(hslToHex((h - 30 + 360) % 360, s, l));
        newColors.push(hslToHex((h + 15) % 360, s, l - 15));
        newColors.push(hslToHex((h - 15 + 360) % 360, s, l - 15));
        break;
      case 'triadic':
        newColors.push(hslToHex((h + 120) % 360, s, l));
        newColors.push(hslToHex((h + 240) % 360, s, l));
        newColors.push(hslToHex((h + 120) % 360, s, l - 15));
        newColors.push(hslToHex((h + 240) % 360, s, l - 15));
        break;
    }
    setColors(newColors);
  };

  useEffect(() => {
    generatePalette(generateRandomColor());
  }, []);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const downloadPalette = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const swatchSize = 100;
    const padding = 20;
    canvas.width = (swatchSize + padding) * colors.length - padding;
    canvas.height = swatchSize + padding * 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(index * (swatchSize + padding), padding, swatchSize, swatchSize);
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(color, index * (swatchSize + padding) + swatchSize / 2, swatchSize + padding + 15);
    });

    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="form-control">
          <label className="label label-text font-medium mb-2">{t.colorPaletteGenerator.baseColor}</label>
          <div className="relative">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => {
                setBaseColor(e.target.value);
                generatePalette(e.target.value);
              }}
              className="w-full h-12 rounded-lg border-2 border-base-300 cursor-pointer"
            />
            <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-transparent hover:border-primary/30 transition-colors"></div>
          </div>
        </div>
        
        <div className="form-control">
          <label className="label label-text font-medium mb-2">{t.colorPaletteGenerator.paletteType}</label>
          <select
            value={paletteType}
            onChange={(e) => {
              setPaletteType(e.target.value);
              generatePalette(baseColor, e.target.value);
            }}
            className="select select-bordered select-sm"
          >
            <option value="analogous">{t.colorPaletteGenerator.analogous}</option>
            <option value="complementary">{t.colorPaletteGenerator.complementary}</option>
            <option value="triadic">{t.colorPaletteGenerator.triadic}</option>
          </select>
        </div>
        
        <div className="form-control">
          <button
            onClick={() => generatePalette(generateRandomColor())}
            className="btn btn-red-600 btn-sm"
          >
            {t.colorPaletteGenerator.generate}
          </button>
        </div>
        
        <div className="form-control">
          <button
            onClick={downloadPalette}
            className="btn btn-outline btn-sm"
          >
            {t.colorPaletteGenerator.download}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-full h-24 rounded-lg shadow-md cursor-pointer mb-2 border-2 border-base-300 hover:border-primary transition-colors"
              style={{ backgroundColor: color }}
              onClick={() => handleCopy(color)}
            ></div>
            <span 
              className="text-sm font-mono cursor-pointer hover:text-primary"
              onClick={() => handleCopy(color)}
            >
              {color}
            </span>
            {copiedColor === color && (
              <span className="text-xs text-success mt-1">{t.colorPaletteGenerator.copied}</span>
            )}
          </div>
        ))}
      </div>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ColorPaletteGenerator;