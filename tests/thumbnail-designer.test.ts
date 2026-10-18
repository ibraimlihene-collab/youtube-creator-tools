import { describe, expect, test } from 'bun:test';
import {
  coverRect,
  drawDesign,
  HEIGHT,
  initialDesign,
  isSupportedImage,
  WIDTH,
  wrapText,
} from '../src/features/thumbnail-designer/drawing';

describe('thumbnail composition', () => {
  test('uses full YouTube thumbnail dimensions', () => {
    expect([WIDTH, HEIGHT]).toEqual([1280, 720]);
  });
  test('wraps words without losing explicit line breaks', () => {
    expect(wrapText('hello world\nnext line', (value) => value.length, 10)).toEqual([
      'hello',
      'world',
      'next line',
    ]);
  });
  test('wraps a long unbroken headline instead of drawing outside the image', () => {
    const lines = wrapText('go abcdefghijkl next', (value) => value.length, 5);
    expect(lines).toEqual(['go', 'abcde', 'fghij', 'kl', 'next']);
    expect(lines.every((line) => line.length <= 5)).toBe(true);
  });
  test('preserves blank lines and accepts an empty headline', () => {
    expect(wrapText('a\n\nb', (value) => value.length, 10)).toEqual(['a', '', 'b']);
    expect(wrapText('', (value) => value.length, 10)).toEqual(['']);
  });
  test('covers the canvas with a landscape image without distortion', () => {
    expect(coverRect(2560, 1440)).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  });
  test('centers and repositions a portrait crop', () => {
    expect(coverRect(720, 1280)).toEqual({
      x: 0,
      y: (720 - (1280 * 1280) / 720) / 2,
      width: 1280,
      height: (1280 * 1280) / 720,
    });
    expect(coverRect(720, 1280, 50, 0).y).toBeCloseTo(0);
  });
  test('starts Arabic designs with Arabic content', () => {
    expect(initialDesign(true).headline).toContain('فكرتك');
  });
  test('draws a fitted, right-aligned Arabic headline', () => {
    const drawn: { text: string; x: number; y: number }[] = [];
    const ctx = {
      clearRect() {},
      fillRect() {},
      save() {},
      translate() {},
      rotate() {},
      beginPath() {},
      arc() {},
      stroke() {},
      restore() {},
      font: '',
      direction: '',
      textAlign: '',
      measureText(value: string) {
        return { width: value.length * 40 };
      },
      fillText(text: string, x: number, y: number) {
        drawn.push({ text, x, y });
      },
    };
    const canvas = { getContext: () => ctx } as unknown as HTMLCanvasElement;
    drawDesign(canvas, initialDesign(true), null, true);
    expect(ctx.direction).toBe('rtl');
    expect(ctx.textAlign).toBe('right');
    expect(drawn[0].x).toBeCloseTo(1190.4);
    expect(drawn.every((line) => line.y >= 0 && line.y < 720)).toBe(true);
  });
});

describe('image validation', () => {
  test('accepts supported image types up to the limit', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp'])
      expect(isSupportedImage({ type, size: 10 * 1024 * 1024 })).toBe(true);
  });
  test('rejects empty, oversized, or unsupported files', () => {
    for (const file of [
      { type: 'image/png', size: 0 },
      { type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 },
      { type: 'image/svg+xml', size: 100 },
      { type: 'text/plain', size: 100 },
    ])
      expect(isSupportedImage(file)).toBe(false);
  });
});
