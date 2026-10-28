import * as THREE from 'three';

// Procedural textures so the scene needs no downloads.

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

let floor: THREE.CanvasTexture | null = null;

// Light oak planks, ~2 m across one texture tile.
export function floorTexture() {
  if (floor) return floor;
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const rand = rng(42);
  const plankW = size / 10;
  for (let col = 0; col < 10; col++) {
    let y = -rand() * size;
    while (y < size) {
      const len = size * (0.35 + rand() * 0.5);
      const tone = 196 + Math.floor(rand() * 26);
      ctx.fillStyle = `rgb(${tone + 22}, ${tone - 4}, ${tone - 42})`;
      ctx.fillRect(col * plankW, y, plankW, len);
      // grain
      for (let g = 0; g < 14; g++) {
        const gx = col * plankW + rand() * plankW;
        ctx.strokeStyle = `rgba(120, 80, 40, ${0.04 + rand() * 0.07})`;
        ctx.lineWidth = 0.6 + rand() * 1.4;
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.bezierCurveTo(gx + (rand() - 0.5) * 8, y + len * 0.3, gx + (rand() - 0.5) * 8, y + len * 0.6, gx + (rand() - 0.5) * 6, y + len);
        ctx.stroke();
      }
      // seams
      ctx.fillStyle = 'rgba(90, 60, 30, 0.25)';
      ctx.fillRect(col * plankW, y, plankW, 1.5);
      y += len;
    }
    ctx.fillStyle = 'rgba(90, 60, 30, 0.22)';
    ctx.fillRect(col * plankW, 0, 1.5, size);
  }
  floor = new THREE.CanvasTexture(c);
  floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
  floor.colorSpace = THREE.SRGBColorSpace;
  floor.anisotropy = 8;
  return floor;
}

const wood = new Map<string, THREE.CanvasTexture>();

export function woodTexture(base: string, grain: string) {
  const key = base + grain;
  const hit = wood.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;
  const rand = rng(7);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 1.6) {
    const w = Math.sin(x * 0.05) * 0.5 + Math.sin(x * 0.19) * 0.3;
    ctx.globalAlpha = 0.06 + Math.max(0, w) * 0.12;
    ctx.strokeStyle = grain;
    ctx.lineWidth = 0.8 + rand();
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (rand() - 0.5) * 10, 170, x - (rand() - 0.5) * 10, 340, x, 512);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  wood.set(key, t);
  return t;
}

let cloth: THREE.CanvasTexture | null = null;

// Fine weave, used as a bump map so linen catches the light.
export function clothTexture() {
  if (cloth) return cloth;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#9a9a9a';
  for (let i = 0; i < 256; i += 4) {
    ctx.fillRect(i, 0, 2, 256);
    ctx.fillRect(0, i, 256, 2);
  }
  cloth = new THREE.CanvasTexture(c);
  cloth.wrapS = cloth.wrapT = THREE.RepeatWrapping;
  cloth.repeat.set(8, 8);
  return cloth;
}
