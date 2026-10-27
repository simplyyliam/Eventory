import { visibleSeats } from './geometry';
import type { Guest, PlanTable } from './types';

export function freeSeats(table: PlanTable, guests: Guest[]) {
  const taken = new Set(guests.filter((g) => g.tableId === table.id).map((g) => g.seat));
  return visibleSeats(table).filter((s) => !taken.has(s.id));
}

// Fills empty seats table by table, in table-number order, so people who were
// imported together (usually a household or a company) end up side by side.
export function autoSeat(tables: PlanTable[], guests: Guest[]): { guests: Guest[]; placed: number } {
  const waiting = guests.filter((g) => !g.tableId && g.status !== 'declined').map((g) => g.id);
  if (waiting.length === 0) return { guests, placed: 0 };

  const assignments = new Map<string, { tableId: string; seat: string }>();
  const ordered = [...tables].sort((a, b) => a.tableNumber - b.tableNumber);
  for (const table of ordered) {
    for (const seat of freeSeats(table, guests)) {
      const guestId = waiting.shift();
      if (!guestId) break;
      assignments.set(guestId, { tableId: table.id, seat: seat.id });
    }
    if (waiting.length === 0) break;
  }

  return {
    placed: assignments.size,
    guests: guests.map((g) => {
      const a = assignments.get(g.id);
      return a ? { ...g, tableId: a.tableId, seat: a.seat } : g;
    }),
  };
}

export const guestsAt = (tableId: string, guests: Guest[]) => guests.filter((g) => g.tableId === tableId);

export const guestInSeat = (seat: string, guests: Guest[]) => guests.find((g) => g.seat === seat) ?? null;
