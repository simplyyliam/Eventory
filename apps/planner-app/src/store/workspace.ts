import { create } from 'zustand';
import { temporal } from 'zundo';
import { clampSeats, seatPoses, tableSize } from '@/domain/geometry';
import { createElement, toGuest, toPlanTable, toVenue } from '@/domain/normalize';
import { autoSeat } from '@/domain/seating';
import type {
  ChecklistItem,
  ElementKind,
  EventMetadata,
  EventStatus,
  EventSummary,
  Guest,
  PlanTable,
  Room,
  TableShape,
  Venue,
  VenueElement,
} from '@/domain/types';

export type GuestInput = Pick<Guest, 'name'> & Partial<Omit<Guest, 'id' | 'name'>>;

type EventInfo = { id: string; name: string; slug: string; status: EventStatus; updatedAt: string };

type Doc = { tables: PlanTable[]; guests: Guest[]; venue: Venue };

type WorkspaceState = Doc & {
  event: EventInfo | null;
  details: EventMetadata;

  hydrate: (event: EventSummary) => void;
  clear: () => void;
  setEventInfo: (info: Partial<EventInfo>) => void;
  updateDetails: (patch: Partial<Omit<EventMetadata, 'venue'>>) => void;
  setChecklist: (items: ChecklistItem[]) => void;

  addTable: (shape: TableShape, x: number, y: number, seatCount?: number) => string;
  updateTable: (id: string, patch: Partial<Omit<PlanTable, 'id'>>) => void;
  moveItems: (moves: { id: string; x: number; y: number }[]) => void;
  patchItems: (patches: ({ id: string } & Partial<Pick<VenueElement, 'x' | 'y' | 'rotation' | 'width' | 'height'>>)[]) => void;
  duplicate: (ids: string[]) => string[];
  removeItems: (ids: string[]) => void;
  toggleSeat: (tableId: string, seat: string) => void;

  addElement: (kind: ElementKind, x: number, y: number) => string;
  updateElement: (id: string, patch: Partial<Omit<VenueElement, 'id'>>) => void;
  setRoom: (room: Room) => void;

  addGuests: (inputs: GuestInput[]) => void;
  updateGuest: (id: string, patch: Partial<Omit<Guest, 'id'>>) => void;
  updateGuests: (ids: string[], patch: Partial<Omit<Guest, 'id'>>) => void;
  removeGuests: (ids: string[]) => void;
  assignSeat: (guestId: string, tableId: string, seat: string) => void;
  unseat: (guestIds: string[]) => void;
  autoSeat: () => number;
};

const empty: Doc & { event: null; details: EventMetadata } = {
  event: null,
  details: {},
  tables: [],
  guests: [],
  venue: toVenue(null, []),
};

const nextNumber = (tables: PlanTable[]) => tables.reduce((max, t) => Math.max(max, t.tableNumber), 0) + 1;

const defaultName = (shape: TableShape, n: number, seats: number) =>
  shape === 'row' ? (seats === 1 ? `Chair ${n}` : `Chair row ${n}`) : `Table ${n}`;

// Drop guests from seats that no longer exist after a table changed.
const reconcileGuests = (guests: Guest[], table: PlanTable | null, tableId: string) => {
  const valid = table ? new Set(seatPoses(table).filter((s) => !table.hiddenSeats.includes(s.id)).map((s) => s.id)) : new Set<string>();
  return guests.map((g) => (g.tableId === tableId && (!g.seat || !valid.has(g.seat)) ? { ...g, tableId: null, seat: null } : g));
};

export const useWorkspace = create<WorkspaceState>()(
  temporal(
    (set, get) => {
      const commit = (fn: (s: WorkspaceState) => Partial<WorkspaceState>) => set(fn);

      return {
        ...empty,

        hydrate: (event) => {
          const tables = (event.tables as Record<string, unknown>[]).map(toPlanTable);
          const { venue: _venue, ...details } = event.metadata ?? {};
          set({
            event: { id: event.id, name: event.name, slug: event.slug, status: event.status, updatedAt: event.updatedAt },
            details,
            tables,
            guests: (event.guests as Record<string, unknown>[]).map(toGuest),
            venue: toVenue(event.metadata, tables),
          });
          useWorkspace.temporal.getState().clear();
        },

        clear: () => {
          set(empty);
          useWorkspace.temporal.getState().clear();
        },

        setEventInfo: (info) => set((s) => ({ event: s.event ? { ...s.event, ...info } : s.event })),

        updateDetails: (patch) => commit((s) => ({ details: { ...s.details, ...patch } })),

        setChecklist: (checklist) => commit((s) => ({ details: { ...s.details, checklist } })),

        addTable: (shape, x, y, seats) => {
          const id = crypto.randomUUID();
          commit((s) => {
            const n = nextNumber(s.tables);
            const seatCount = clampSeats(shape, seats ?? (shape === 'row' ? 6 : shape === 'square' ? 8 : shape === 'rectangle' ? 10 : 8));
            const table: PlanTable = {
              id,
              name: defaultName(shape, n, seatCount),
              tableNumber: n,
              shape,
              seatCount,
              x,
              y,
              rotation: 0,
              ...tableSize(shape, seatCount),
              finish: 'linen',
              hiddenSeats: [],
            };
            return { tables: [...s.tables, table] };
          });
          return id;
        },

        updateTable: (id, patch) =>
          commit((s) => {
            let changed: PlanTable | null = null;
            const tables = s.tables.map((t) => {
              if (t.id !== id) return t;
              const next = { ...t, ...patch };
              if (patch.shape || patch.seatCount !== undefined) {
                next.seatCount = clampSeats(next.shape, next.seatCount);
                Object.assign(next, tableSize(next.shape, next.seatCount));
              }
              changed = next;
              return next;
            });
            const geometryChanged = patch.shape || patch.seatCount !== undefined || patch.hiddenSeats;
            return { tables, guests: geometryChanged ? reconcileGuests(s.guests, changed, id) : s.guests };
          }),

        moveItems: (moves) =>
          commit((s) => {
            const byId = new Map(moves.map((m) => [m.id, m]));
            const move = <T extends { id: string; x: number; y: number }>(item: T) => {
              const m = byId.get(item.id);
              return m ? { ...item, x: m.x, y: m.y } : item;
            };
            return { tables: s.tables.map(move), venue: { ...s.venue, elements: s.venue.elements.map(move) } };
          }),

        // One history step for a whole multi-select transform.
        patchItems: (patches) =>
          commit((s) => {
            const byId = new Map(patches.map((p) => [p.id, p]));
            return {
              tables: s.tables.map((t) => {
                const p = byId.get(t.id);
                return p ? { ...t, x: p.x ?? t.x, y: p.y ?? t.y, rotation: p.rotation ?? t.rotation } : t;
              }),
              venue: {
                ...s.venue,
                elements: s.venue.elements.map((e) => {
                  const p = byId.get(e.id);
                  return p ? { ...e, ...p } : e;
                }),
              },
            };
          }),

        duplicate: (ids) => {
          const created: string[] = [];
          commit((s) => {
            let n = nextNumber(s.tables);
            const offset = 80;
            const tables = s.tables
              .filter((t) => ids.includes(t.id))
              .map((t) => {
                const id = crypto.randomUUID();
                created.push(id);
                const num = n++;
                return { ...t, id, tableNumber: num, name: defaultName(t.shape, num, t.seatCount), x: t.x + offset, y: t.y + offset, hiddenSeats: [] };
              });
            const elements = s.venue.elements
              .filter((e) => ids.includes(e.id))
              .map((e) => {
                const id = crypto.randomUUID();
                created.push(id);
                return { ...e, id, x: e.x + offset, y: e.y + offset };
              });
            return { tables: [...s.tables, ...tables], venue: { ...s.venue, elements: [...s.venue.elements, ...elements] } };
          });
          return created;
        },

        removeItems: (ids) =>
          commit((s) => ({
            tables: s.tables.filter((t) => !ids.includes(t.id)),
            venue: { ...s.venue, elements: s.venue.elements.filter((e) => !ids.includes(e.id)) },
            guests: s.guests.map((g) => (g.tableId && ids.includes(g.tableId) ? { ...g, tableId: null, seat: null } : g)),
          })),

        toggleSeat: (tableId, seat) => {
          const table = get().tables.find((t) => t.id === tableId);
          if (!table) return;
          const hidden = table.hiddenSeats.includes(seat)
            ? table.hiddenSeats.filter((s) => s !== seat)
            : [...table.hiddenSeats, seat];
          get().updateTable(tableId, { hiddenSeats: hidden });
        },

        addElement: (kind, x, y) => {
          const element = createElement(kind, x, y);
          commit((s) => ({ venue: { ...s.venue, elements: [...s.venue.elements, element] } }));
          return element.id;
        },

        updateElement: (id, patch) =>
          commit((s) => ({
            venue: { ...s.venue, elements: s.venue.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) },
          })),

        setRoom: (room) => commit((s) => ({ venue: { ...s.venue, room } })),

        addGuests: (inputs) =>
          commit((s) => ({
            guests: [
              ...s.guests,
              ...inputs.map((i) => ({
                id: crypto.randomUUID(),
                name: i.name.trim(),
                email: i.email ?? null,
                dietary: i.dietary ?? [],
                comments: i.comments ?? null,
                status: i.status ?? 'pending',
                tableId: null,
                seat: null,
              })),
            ],
          })),

        updateGuest: (id, patch) => commit((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

        updateGuests: (ids, patch) => commit((s) => ({ guests: s.guests.map((g) => (ids.includes(g.id) ? { ...g, ...patch } : g)) })),

        removeGuests: (ids) => commit((s) => ({ guests: s.guests.filter((g) => !ids.includes(g.id)) })),

        // Dropping someone on a taken seat swaps the two guests.
        assignSeat: (guestId, tableId, seat) =>
          commit((s) => {
            const mover = s.guests.find((g) => g.id === guestId);
            if (!mover) return {};
            const occupant = s.guests.find((g) => g.seat === seat && g.id !== guestId);
            return {
              guests: s.guests.map((g) => {
                if (g.id === guestId) return { ...g, tableId, seat, status: g.status === 'declined' ? 'pending' : g.status };
                if (occupant && g.id === occupant.id) return { ...g, tableId: mover.tableId, seat: mover.seat };
                return g;
              }),
            };
          }),

        unseat: (ids) =>
          commit((s) => ({ guests: s.guests.map((g) => (ids.includes(g.id) ? { ...g, tableId: null, seat: null } : g)) })),

        autoSeat: () => {
          const { guests, placed } = autoSeat(get().tables, get().guests);
          if (placed > 0) commit(() => ({ guests }));
          return placed;
        },
      };
    },
    {
      limit: 100,
      partialize: (s) => ({ tables: s.tables, guests: s.guests, venue: s.venue }),
      equality: (a, b) => a.tables === b.tables && a.guests === b.guests && a.venue === b.venue,
    },
  ),
);

export const undo = () => useWorkspace.temporal.getState().undo();
export const redo = () => useWorkspace.temporal.getState().redo();

// Metadata as the server stores it: details plus the venue layout.
export const metadataOf = (s: Pick<WorkspaceState, 'details' | 'venue'>): EventMetadata => ({ ...s.details, venue: s.venue });
