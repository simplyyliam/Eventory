import { clampSeats, tableSize } from './geometry';
import {
  UNITS_PER_METRE,
  type ElementKind,
  type EventMetadata,
  type Guest,
  type PlanTable,
  type RsvpStatus,
  type TableFinish,
  type TableShape,
  type Venue,
  type VenueElement,
} from './types';

const SHAPES: TableShape[] = ['circle', 'rectangle', 'square', 'row'];
const FINISHES: TableFinish[] = ['linen', 'ivory', 'sage', 'oak', 'walnut'];
const STATUSES: RsvpStatus[] = ['pending', 'confirmed', 'declined'];

type Raw = Record<string, unknown>;

const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

// Old rectangle tables derived their seat count from their length.
const legacyRectSeats = (height: number) => 2 + Math.floor(height / 75) * 2;

export function toPlanTable(raw: Raw, index: number): PlanTable {
  const shape = SHAPES.includes(raw.shape as TableShape) ? (raw.shape as TableShape) : 'circle';
  const textureId = str(raw.textureId);
  const isLegacy = !FINISHES.includes(textureId as TableFinish);
  const rawSeats = num(raw.seatCount, 8);
  const seatCount = clampSeats(
    shape,
    shape === 'rectangle' && isLegacy ? legacyRectSeats(num(raw.height, 320)) : rawSeats,
  );
  const size = tableSize(shape, seatCount);
  const tableNumber = num(raw.tableNumber, index + 1);

  return {
    id: str(raw.id, crypto.randomUUID()),
    name: str(raw.name, `Table ${tableNumber}`),
    tableNumber,
    shape,
    seatCount,
    x: num(raw.x, 0),
    y: num(raw.y, 0),
    rotation: num(raw.rotation, 0),
    width: size.width,
    height: size.height,
    finish: FINISHES.includes(textureId as TableFinish) ? (textureId as TableFinish) : 'linen',
    hiddenSeats: Array.isArray(raw.hiddenSeats) ? (raw.hiddenSeats as string[]) : [],
  };
}

// The table's finish rides in the existing textureId column so the schema
// doesn't need a migration.
export const fromPlanTable = (t: PlanTable) => ({
  id: t.id,
  name: t.name,
  tableNumber: t.tableNumber,
  shape: t.shape,
  seatCount: t.seatCount,
  textureId: t.finish,
  width: t.width,
  height: t.height,
  x: t.x,
  y: t.y,
  rotation: t.rotation,
  hiddenSeats: t.hiddenSeats,
  linkedTableId: null,
});

export function toGuest(raw: Raw): Guest {
  return {
    id: str(raw.id, crypto.randomUUID()),
    name: str(raw.name, 'Unnamed guest'),
    email: typeof raw.email === 'string' && raw.email ? raw.email : null,
    dietary: Array.isArray(raw.dietary) ? (raw.dietary as string[]) : [],
    comments: typeof raw.comments === 'string' && raw.comments ? raw.comments : null,
    status: STATUSES.includes(raw.status as RsvpStatus) ? (raw.status as RsvpStatus) : 'pending',
    tableId: typeof raw.tableId === 'string' ? raw.tableId : null,
    seat: typeof raw.seat === 'string' ? raw.seat : null,
  };
}

const m = (metres: number) => metres * UNITS_PER_METRE;

export const DEFAULT_ROOM = { width: m(24), depth: m(16) };

export const defaultVenue = (): Venue => ({ room: { ...DEFAULT_ROOM }, elements: [] });

export function toVenue(meta: EventMetadata | null | undefined, tables: PlanTable[]): Venue {
  const venue = meta?.venue;
  if (venue?.room) return { room: venue.room, elements: venue.elements ?? [] };

  // Older events have no room: fit one around whatever is already placed.
  if (tables.length === 0) return defaultVenue();
  const xs = tables.flatMap((t) => [t.x - t.height, t.x + t.height]);
  const ys = tables.flatMap((t) => [t.y - t.height, t.y + t.height]);
  const width = Math.max(DEFAULT_ROOM.width, (Math.max(...xs) - Math.min(...xs)) * 1.2);
  const depth = Math.max(DEFAULT_ROOM.depth, (Math.max(...ys) - Math.min(...ys)) * 1.2);
  return { room: { width, depth }, elements: [] };
}

export const ELEMENT_PRESETS: Record<ElementKind, { label: string; width: number; height: number }> = {
  stage: { label: 'Stage', width: m(6), height: m(3) },
  'dance-floor': { label: 'Dance floor', width: m(5), height: m(5) },
  bar: { label: 'Bar', width: m(4), height: m(0.8) },
  buffet: { label: 'Buffet', width: m(4), height: m(1) },
  dj: { label: 'DJ booth', width: m(2), height: m(1) },
  entrance: { label: 'Entrance', width: m(2), height: m(0.3) },
  pillar: { label: 'Pillar', width: m(0.5), height: m(0.5) },
  plant: { label: 'Plant', width: m(0.7), height: m(0.7) },
};

export const createElement = (kind: ElementKind, x: number, y: number): VenueElement => ({
  id: crypto.randomUUID(),
  kind,
  label: ELEMENT_PRESETS[kind].label,
  x,
  y,
  width: ELEMENT_PRESETS[kind].width,
  height: ELEMENT_PRESETS[kind].height,
  rotation: 0,
});
