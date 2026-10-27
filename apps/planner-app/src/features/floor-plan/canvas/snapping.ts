export type Box = { id: string; x: number; y: number; hw: number; hh: number };
export type Guide = { axis: 'x' | 'y'; at: number; from: number; to: number };

// Axis-aligned half extents of a rotated rectangle.
export function halfExtents(width: number, height: number, rotation: number) {
  const r = (rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { hw: (width * c + height * s) / 2, hh: (width * s + height * c) / 2 };
}

// Snap a moving box to the centres and edges of the others. Returns the
// adjusted position and the guide lines to draw.
export function snapToNeighbours(moving: Box, others: Box[], threshold: number) {
  let bestX: { delta: number; at: number } | null = null;
  let bestY: { delta: number; at: number } | null = null;

  const xs = [moving.x - moving.hw, moving.x, moving.x + moving.hw];
  const ys = [moving.y - moving.hh, moving.y, moving.y + moving.hh];

  for (const o of others) {
    const oxs = [o.x - o.hw, o.x, o.x + o.hw];
    const oys = [o.y - o.hh, o.y, o.y + o.hh];
    for (const a of xs)
      for (const b of oxs) {
        const d = b - a;
        if (Math.abs(d) < threshold && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) bestX = { delta: d, at: b };
      }
    for (const a of ys)
      for (const b of oys) {
        const d = b - a;
        if (Math.abs(d) < threshold && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) bestY = { delta: d, at: b };
      }
  }

  const x = moving.x + (bestX?.delta ?? 0);
  const y = moving.y + (bestY?.delta ?? 0);
  const guides: Guide[] = [];

  if (bestX) {
    const aligned = others.filter((o) => [o.x - o.hw, o.x, o.x + o.hw].some((v) => Math.abs(v - bestX!.at) < 0.5));
    const ysAll = [y - moving.hh, y + moving.hh, ...aligned.flatMap((o) => [o.y - o.hh, o.y + o.hh])];
    guides.push({ axis: 'x', at: bestX.at, from: Math.min(...ysAll), to: Math.max(...ysAll) });
  }
  if (bestY) {
    const aligned = others.filter((o) => [o.y - o.hh, o.y, o.y + o.hh].some((v) => Math.abs(v - bestY!.at) < 0.5));
    const xsAll = [x - moving.hw, x + moving.hw, ...aligned.flatMap((o) => [o.x - o.hw, o.x + o.hw])];
    guides.push({ axis: 'y', at: bestY.at, from: Math.min(...xsAll), to: Math.max(...xsAll) });
  }

  return { x, y, guides };
}
