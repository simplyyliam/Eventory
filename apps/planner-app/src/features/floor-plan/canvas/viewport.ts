import type Konva from 'konva';
import { useWorkspace } from '@/store/workspace';
import { useEditor } from '../editorStore';

export const MIN_SCALE = 0.04;
export const MAX_SCALE = 2;

const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

// Keeps the dotted background in step with the stage without a React render.
export function syncBackground(stage: Konva.Stage) {
  const el = stage.container().parentElement;
  if (!el) return;
  const s = stage.scaleX();
  let step = 100 * s;
  while (step < 14) step *= 2;
  el.style.backgroundSize = `${step}px ${step}px`;
  el.style.backgroundPosition = `${stage.x()}px ${stage.y()}px`;
}

let scaleFrame = 0;
export function publishScale(stage: Konva.Stage) {
  cancelAnimationFrame(scaleFrame);
  scaleFrame = requestAnimationFrame(() => useEditor.getState().setScale(stage.scaleX()));
}

export function setView(stage: Konva.Stage, view: { x: number; y: number; scale: number }, animate = true) {
  const done = () => {
    syncBackground(stage);
    publishScale(stage);
  };
  if (!animate) {
    stage.position({ x: view.x, y: view.y });
    stage.scale({ x: view.scale, y: view.scale });
    done();
    return;
  }
  stage.to({
    x: view.x,
    y: view.y,
    scaleX: view.scale,
    scaleY: view.scale,
    duration: 0.3,
    easing: (t: number, b: number, c: number, d: number) => {
      // ease-out-quart
      t = t / d - 1;
      return -c * (t * t * t * t - 1) + b;
    },
    onUpdate: () => syncBackground(stage),
    onFinish: done,
  });
}

export function zoomAt(stage: Konva.Stage, factor: number, point?: { x: number; y: number }, animate = false) {
  const old = stage.scaleX();
  const scale = clamp(old * factor);
  const p = point ?? { x: stage.width() / 2, y: stage.height() / 2 };
  const world = { x: (p.x - stage.x()) / old, y: (p.y - stage.y()) / old };
  setView(stage, { scale, x: p.x - world.x * scale, y: p.y - world.y * scale }, animate);
}

// Frames the room and anything placed outside it, leaving room for the panels.
export function fitToContent(stage: Konva.Stage, animate = true) {
  const { venue, tables } = useWorkspace.getState();
  const { width: w, depth: d } = venue.room;
  let minX = -w / 2,
    maxX = w / 2,
    minY = -d / 2,
    maxY = d / 2;
  for (const item of [...tables, ...venue.elements]) {
    const r = Math.max(item.width, item.height) / 2 + 120;
    minX = Math.min(minX, item.x - r);
    maxX = Math.max(maxX, item.x + r);
    minY = Math.min(minY, item.y - r);
    maxY = Math.max(maxY, item.y + r);
  }
  // leave space for the contents panel (left) and inspector (right) on wide screens
  const wide = stage.width() > 900;
  const left = wide ? 290 : 24;
  const right = wide ? 320 : 24;
  const top = 80;
  const bottom = 48;
  const availW = stage.width() - left - right;
  const availH = stage.height() - top - bottom;
  const scale = clamp(Math.min(availW / (maxX - minX), availH / (maxY - minY)));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  setView(stage, { scale, x: left + availW / 2 - cx * scale, y: top + availH / 2 - cy * scale }, animate);
}

// World position at the middle of the visible canvas, used for click-to-add.
export function viewCentre(stage: Konva.Stage) {
  const s = stage.scaleX();
  return { x: (stage.width() / 2 - stage.x()) / s, y: (stage.height() / 2 - stage.y()) / s };
}
