import * as THREE from 'three';

export { THEMES, ACCENTS, DEFAULT_DECOR, decorOf, type ThemeStyle } from '@/domain/decor';

// Text on a canvas, for banners, signs and table number cards.
const textCache = new Map<string, THREE.CanvasTexture>();

export function textTexture(
  text: string,
  opts: { w: number; h: number; bg: string; fg: string; font?: string; size?: number; border?: string },
) {
  const key = JSON.stringify([text, opts]);
  const hit = textCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = opts.w;
  c.height = opts.h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, opts.w, opts.h);
  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = opts.h * 0.025;
    const inset = opts.h * 0.06;
    ctx.strokeRect(inset, inset, opts.w - inset * 2, opts.h - inset * 2);
  }
  ctx.fillStyle = opts.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = text.split('\n');
  const size = opts.size ?? opts.h * 0.32;
  lines.forEach((line, i) => {
    const s = i === 0 && lines.length > 1 ? size * 0.55 : size;
    ctx.font = `${opts.font ?? 'italic 400'} ${s}px Georgia, 'Times New Roman', serif`;
    let fit = s;
    while (ctx.measureText(line).width > opts.w * 0.86 && fit > 10) {
      fit -= 2;
      ctx.font = `${opts.font ?? 'italic 400'} ${fit}px Georgia, 'Times New Roman', serif`;
    }
    const y = opts.h / 2 + (i - (lines.length - 1) / 2) * size * 1.05;
    ctx.fillText(line, opts.w / 2, y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  textCache.set(key, t);
  return t;
}

let checker: THREE.CanvasTexture | null = null;

// Glossy black and white tiles for the dance floor, ~0.5 m squares.
export function danceFloorTexture() {
  if (checker) return checker;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 2; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#1b1b1d' : '#efece6';
      ctx.fillRect(x * 128, y * 128, 128, 128);
    }
  ctx.strokeStyle = 'rgba(120,120,120,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 256, 256);
  checker = new THREE.CanvasTexture(c);
  checker.wrapS = checker.wrapT = THREE.RepeatWrapping;
  checker.colorSpace = THREE.SRGBColorSpace;
  return checker;
}

let glow: THREE.CanvasTexture | null = null;

// Soft radial falloff used for uplight washes on the walls.
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 128, 4, 64, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glow = new THREE.CanvasTexture(c);
  return glow;
}

// Pleated fabric: a plane with sine folds, shared by curtains and backdrops.
export function pleatGeometry(width: number, height: number, folds: number, depth = 0.04) {
  const geo = new THREE.PlaneGeometry(width, height, Math.max(8, folds * 6), 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, Math.sin((x / width) * folds * Math.PI * 2) * depth);
  }
  geo.computeVertexNormals();
  return geo;
}
