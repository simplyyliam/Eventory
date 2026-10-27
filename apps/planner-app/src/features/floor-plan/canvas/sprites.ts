import type { TableFinish } from '@/domain/types';

// Table tops and chairs are drawn once into offscreen canvases (with their
// shadow baked in) and reused as images. Live canvas shadows on every shape
// were the main cost when panning.

const RES = 1.25; // sprite pixels per plan unit; crisp up to ~125% zoom
export const SHADOW_PAD = 28; // plan units around the shape for the baked shadow
export const CHAIR_PAD = 14;

const cache = new Map<string, HTMLCanvasElement>();

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

type Look = { base: string; edge: string; grain?: string; light: string; weave?: boolean };

const LOOKS: Record<TableFinish, { light: Look; dark: Look }> = {
  linen: {
    light: { base: '#fdfcfa', edge: '#ebe7df', light: 'rgba(255,255,255,0.9)', weave: true },
    dark: { base: '#e9e6df', edge: '#cfcac0', light: 'rgba(255,255,255,0.5)', weave: true },
  },
  ivory: {
    light: { base: '#f6eedd', edge: '#e3d6bb', light: 'rgba(255,255,255,0.7)', weave: true },
    dark: { base: '#d9ccad', edge: '#bba98a', light: 'rgba(255,255,255,0.35)', weave: true },
  },
  sage: {
    light: { base: '#e2eadb', edge: '#c7d4bc', light: 'rgba(255,255,255,0.6)', weave: true },
    dark: { base: '#a9b99d', edge: '#8e9f83', light: 'rgba(255,255,255,0.3)', weave: true },
  },
  oak: {
    light: { base: '#d8b78c', edge: '#b8915f', grain: '#9c7445', light: 'rgba(255,240,215,0.55)' },
    dark: { base: '#b9946a', edge: '#94704a', grain: '#7a5a37', light: 'rgba(255,240,215,0.3)' },
  },
  walnut: {
    light: { base: '#8a6447', edge: '#664631', grain: '#4f3423', light: 'rgba(255,225,190,0.28)' },
    dark: { base: '#7a573d', edge: '#5a3d29', grain: '#3f291b', light: 'rgba(255,225,190,0.2)' },
  },
};

function shapePath(ctx: CanvasRenderingContext2D, round: boolean, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (round) ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else ctx.roundRect(x, y, w, h, r);
}

function drawWood(ctx: CanvasRenderingContext2D, look: Look, w: number, h: number, rand: () => number) {
  // grain runs along the long side
  const along = Math.max(w, h);
  const across = Math.min(w, h);
  const vertical = h >= w;
  ctx.save();
  if (!vertical) {
    ctx.translate(w, 0);
    ctx.rotate(Math.PI / 2);
  }
  const phase = rand() * 100;
  for (let i = 0; i < across; i += 1.4) {
    const wave = Math.sin(i * 0.045 + phase) * 0.5 + Math.sin(i * 0.17 + phase * 2) * 0.3;
    ctx.globalAlpha = 0.05 + Math.max(0, wave) * 0.11 + rand() * 0.03;
    ctx.strokeStyle = look.grain!;
    ctx.lineWidth = 0.8 + rand() * 0.9;
    ctx.beginPath();
    const drift = (rand() - 0.5) * 6;
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + drift, along * 0.33, i - drift, along * 0.66, i + drift * 0.5, along);
    ctx.stroke();
  }
  // a couple of soft knots
  for (let k = 0; k < 2; k++) {
    const kx = across * (0.2 + rand() * 0.6);
    const ky = along * (0.15 + rand() * 0.7);
    for (let r = 2; r < 14; r += 2.5) {
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(kx, ky, r * 0.6, r * 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawWeave(ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) {
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  for (let x = 0; x < w; x += 3) ctx.fillRect(x, 0, 1, h);
  ctx.globalAlpha = 0.025;
  for (let i = 0; i < (w * h) / 40; i++) ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
  ctx.globalAlpha = 1;
}

export function tableSprite(round: boolean, width: number, height: number, finish: TableFinish, dark: boolean): HTMLCanvasElement {
  const key = `t:${round}:${Math.round(width)}:${Math.round(height)}:${finish}:${dark}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const look = LOOKS[finish][dark ? 'dark' : 'light'];
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((width + SHADOW_PAD * 2) * RES);
  canvas.height = Math.ceil((height + SHADOW_PAD * 2) * RES);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(RES, RES);
  const rand = rng(hash(key));
  const x = SHADOW_PAD;
  const y = SHADOW_PAD;
  const radius = round ? 0 : look.weave ? 10 : 8;

  // baked contact shadow
  ctx.save();
  ctx.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(40,30,20,0.16)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  shapePath(ctx, round, x, y, width, height, radius);
  ctx.fillStyle = look.base;
  ctx.fill();
  ctx.restore();

  ctx.save();
  shapePath(ctx, round, x, y, width, height, radius);
  ctx.clip();
  ctx.translate(x, y);
  if (look.grain) drawWood(ctx, look, width, height, rand);
  if (look.weave) drawWeave(ctx, width, height, rand);
  // soft falloff towards the edge (cloth drape / varnish sheen)
  const g = round
    ? ctx.createRadialGradient(width / 2, height * 0.42, Math.min(width, height) * 0.15, width / 2, height / 2, Math.max(width, height) * 0.55)
    : ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, look.light);
  g.addColorStop(round ? 0.65 : 0.5, 'rgba(255,255,255,0)');
  g.addColorStop(1, look.edge);
  ctx.globalAlpha = round ? 0.9 : 0.35;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // fine edge: dark outline, light inner rim
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  shapePath(ctx, round, x, y, width, height, radius);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = look.light;
  shapePath(ctx, round, x + 3, y + 3, width - 6, height - 6, Math.max(0, radius - 3));
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  cache.set(key, canvas);
  return canvas;
}

export type ChairState = 'empty' | 'taken';

// Dining chair from above, facing +y: oak frame, padded cushion, curved
// spindle back. Taken seats get a soft blue cushion so the plan reads at a glance.
export function chairSprite(w: number, d: number, state: ChairState, dark: boolean): HTMLCanvasElement {
  const key = `c:${Math.round(w)}:${Math.round(d)}:${state}:${dark}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const pad = CHAIR_PAD;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((w + pad * 2) * RES);
  canvas.height = Math.ceil((d + pad * 2) * RES);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(RES, RES);
  const x = pad;
  const y = pad;
  const r = d * 0.26;

  const frame = dark ? '#8a6a48' : '#c89f6e';
  const frameDark = dark ? '#5e4630' : '#a07848';
  const cushion =
    state === 'taken'
      ? dark ? ['#3a4f80', '#2b3b63'] : ['#f3f6ff', '#d9e3fd']
      : dark ? ['#2e2e2e', '#232323'] : ['#ffffff', '#efebe4'];
  const seam = state === 'taken' ? (dark ? 'rgba(140,170,255,0.35)' : 'rgba(80,110,220,0.25)') : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  // shadow + frame
  ctx.save();
  ctx.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(40,30,20,0.18)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, d, r);
  ctx.fillStyle = frame;
  ctx.fill();
  ctx.restore();
  const fg = ctx.createLinearGradient(0, y, 0, y + d);
  fg.addColorStop(0, frame);
  fg.addColorStop(1, frameDark);
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, d, r);
  ctx.fill();

  // cushion, inset from the frame, with a soft top-left light
  const inset = 4;
  const cy = y + 11;
  const ch = d - 11 - inset;
  const cg = ctx.createLinearGradient(x, cy, x + w * 0.3, cy + ch);
  cg.addColorStop(0, cushion[0]);
  cg.addColorStop(1, cushion[1]);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.roundRect(x + inset, cy, w - inset * 2, ch, r * 0.8);
  ctx.fill();
  // piping seam
  ctx.strokeStyle = seam;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x + inset + 4, cy + 4, w - inset * 2 - 8, ch - 8, r * 0.5);
  ctx.stroke();
  // button tuft
  ctx.fillStyle = seam;
  ctx.beginPath();
  ctx.arc(x + w / 2, cy + ch / 2, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // curved backrest with spindles
  ctx.strokeStyle = frameDark;
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 6);
  ctx.quadraticCurveTo(x + w / 2, y - 4, x + w - 5, y + 6);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,220,0.35)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 4.5);
  ctx.quadraticCurveTo(x + w / 2, y - 5, x + w - 7, y + 4.5);
  ctx.stroke();

  cache.set(key, canvas);
  return canvas;
}


export const SPRITE_RES = RES;
