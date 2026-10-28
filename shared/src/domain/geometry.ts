// Seat geometry shared by the planner (2D and 3D) and the guest app.
// Plan coordinates are in units: 200 units = 1 metre.
export const UNITS_PER_METRE = 200;

export type TableShape = 'circle' | 'rectangle' | 'square' | 'row';

type TableGeometry = { id: string; shape: TableShape; seatCount: number; width: number; height: number; hiddenSeats: string[] };
type Placed = { x: number; y: number; rotation: number };

const m = (metres: number) => metres * UNITS_PER_METRE;

export const CHAIR_SIZE = m(0.45);
const CHAIR_OFFSET = m(0.32);
const COVER = m(0.6);

export const SEAT_LIMITS: Record<TableShape, { min: number; max: number }> = {
  circle: { min: 2, max: 14 },
  rectangle: { min: 2, max: 24 },
  square: { min: 4, max: 12 },
  row: { min: 1, max: 20 },
};

export const clampSeats = (shape: TableShape, count: number) =>
  Math.min(SEAT_LIMITS[shape].max, Math.max(SEAT_LIMITS[shape].min, Math.round(count)));

// Footprint of the table top for a given number of covers, using the usual
// 60cm-per-guest rule of thumb from banquet planning.
export function tableSize(shape: TableShape, seatCount: number) {
  switch (shape) {
    case 'circle': {
      const d = Math.max(m(0.9), (seatCount * COVER) / Math.PI);
      return { width: d, height: d };
    }
    case 'rectangle': {
      const perSide = Math.max(1, Math.ceil(Math.max(0, seatCount - 2) / 2));
      return { width: m(0.8), height: Math.max(m(1.2), perSide * COVER + m(0.2)) };
    }
    case 'square': {
      const perSide = Math.ceil(seatCount / 4);
      const side = Math.max(m(0.9), perSide * COVER + m(0.2));
      return { width: side, height: side };
    }
    case 'row':
      return { width: seatCount * m(0.55), height: CHAIR_SIZE };
  }
}

export const seatId = (tableId: string, index: number) => `${tableId}-seat-${index + 1}`;
export const seatNumber = (seat: string) => Number(seat.split('-').pop());

export type SeatPose = { id: string; index: number; x: number; y: number; angle: number };

// Seat positions relative to the table centre, before table rotation.
// angle is the direction the chair faces, in degrees (0 = facing +y / down).
// The rectangle order (head, foot, then alternating sides) matches the
// original editor so seat ids saved by it stay valid.
export function seatPoses(table: Pick<TableGeometry, 'id' | 'shape' | 'seatCount' | 'width' | 'height'>): SeatPose[] {
  const { shape, seatCount, width, height } = table;
  const out: SeatPose[] = [];
  const push = (index: number, x: number, y: number, angle: number) =>
    out.push({ id: seatId(table.id, index), index, x, y, angle });

  if (shape === 'circle') {
    const r = width / 2 + CHAIR_OFFSET;
    for (let i = 0; i < seatCount; i++) {
      const a = (i / seatCount) * Math.PI * 2 - Math.PI / 2;
      push(i, Math.cos(a) * r, Math.sin(a) * r, (Math.atan2(Math.cos(a), -Math.sin(a)) * 180) / Math.PI);
    }
    return out;
  }

  if (shape === 'row') {
    const step = width / seatCount;
    for (let i = 0; i < seatCount; i++) push(i, -width / 2 + step * (i + 0.5), 0, 180);
    return out;
  }

  if (shape === 'rectangle') {
    const hw = width / 2;
    const hh = height / 2;
    if (seatCount >= 1) push(0, 0, -hh - CHAIR_OFFSET, 0);
    if (seatCount >= 2) push(1, 0, hh + CHAIR_OFFSET, 180);
    const side = seatCount - 2;
    const pairs = Math.max(1, Math.ceil(side / 2));
    const spacing = height / pairs;
    for (let s = 0; s < side; s++) {
      const left = s % 2 === 0;
      const pair = Math.floor(s / 2);
      push(s + 2, left ? -hw - CHAIR_OFFSET : hw + CHAIR_OFFSET, -hh + spacing * (pair + 0.5), left ? -90 : 90);
    }
    return out;
  }

  // square: walk the four sides clockwise from the top
  const half = width / 2 + CHAIR_OFFSET;
  const perSide = Math.ceil(seatCount / 4);
  const step = width / perSide;
  for (let i = 0; i < seatCount; i++) {
    const sideIdx = Math.floor(i / perSide);
    const t = -width / 2 + step * ((i % perSide) + 0.5);
    if (sideIdx === 0) push(i, t, -half, 0);
    else if (sideIdx === 1) push(i, half, t, 90);
    else if (sideIdx === 2) push(i, -t, half, 180);
    else push(i, -half, -t, -90);
  }
  return out;
}

export const visibleSeats = (table: TableGeometry) =>
  seatPoses(table).filter((s) => !table.hiddenSeats.includes(s.id));

export const capacity = (table: TableGeometry) => visibleSeats(table).length;

// Rotate a local point into plan space.
export function toPlan(table: Placed, x: number, y: number) {
  const r = (table.rotation * Math.PI) / 180;
  return {
    x: table.x + x * Math.cos(r) - y * Math.sin(r),
    y: table.y + x * Math.sin(r) + y * Math.cos(r),
  };
}

export const formatMetres = (units: number) => `${(units / UNITS_PER_METRE).toFixed(1).replace(/\.0$/, '')} m`;

const FINISH_IDS = ['linen', 'ivory', 'sage', 'oak', 'walnut'];

// Tables saved by the first editor stored a texture id instead of a finish and
// derived rectangle seats from the table's length. Keep their seat numbering.
export function resolveSeatCount(shape: TableShape, seatCount: number, textureId: string | null | undefined, height: number | null | undefined) {
  const legacy = !FINISH_IDS.includes(textureId ?? '');
  const raw = shape === 'rectangle' && legacy ? 2 + Math.floor((height ?? 320) / 75) * 2 : seatCount;
  return clampSeats(shape, raw);
}
