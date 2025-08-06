import React, { useState, useEffect, useRef } from 'react';

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


const ColorPaletteGenerator = () => {
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
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="color"
          value={baseColor}
          onChange={(e) => {
            setBaseColor(e.target.value);
            generatePalette(e.target.value);
          }}
          className="input input-bordered"
        />
        <select
          value={paletteType}
          onChange={(e) => {
            setPaletteType(e.target.value);
            generatePalette(baseColor, e.target.value);
          }}
          className="select select-bordered"
        >
          <option value="analogous">Analogous</option>
          <option value="complementary">Complementary</option>
          <option value="triadic">Triadic</option>
        </select>
        <button className="btn btn-primary" onClick={() => generatePalette(generateRandomColor())}>
          Generate Random Palette
        </button>
        <button className="btn btn-secondary" onClick={downloadPalette}>
          Download
        </button>
      </div>

      {colors.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-4 mt-2">
            {colors.map((color, index) => (
              <div key={index} className="relative cursor-pointer" onClick={() => handleCopy(color)}>
                <div
                  className="w-24 h-24 rounded-lg shadow-md"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="block text-center mt-2 font-mono">{color}</span>
                {copiedColor === color && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-success text-success-content rounded-md text-xs">
                    Copied!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default ColorPaletteGenerator;