import { differenceInCalendarDays, parseISO } from 'date-fns';
import { capacity } from './geometry';
import type { EventMetadata, Guest, PlanTable } from './types';

export type EventStats = {
  guests: number;
  confirmed: number;
  pending: number;
  declined: number;
  seated: number;
  unseated: number;
  seats: number;
  tables: number;
  dietary: { label: string; count: number }[];
};

// Declined guests don't need a seat, so they're left out of "unseated".
export function eventStats(tables: PlanTable[], guests: Guest[]): EventStats {
  const dietary = new Map<string, number>();
  for (const g of guests) {
    if (g.status === 'declined') continue;
    for (const d of g.dietary) {
      const key = d.trim();
      if (key) dietary.set(key, (dietary.get(key) ?? 0) + 1);
    }
  }
  const seated = guests.filter((g) => g.tableId).length;
  const attending = guests.filter((g) => g.status !== 'declined');
  return {
    guests: guests.length,
    confirmed: guests.filter((g) => g.status === 'confirmed').length,
    pending: guests.filter((g) => g.status === 'pending').length,
    declined: guests.filter((g) => g.status === 'declined').length,
    seated,
    unseated: attending.filter((g) => !g.tableId).length,
    seats: tables.reduce((sum, t) => sum + capacity(t), 0),
    tables: tables.filter((t) => t.shape !== 'row').length,
    dietary: [...dietary.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
  };
}

export function daysUntil(meta: EventMetadata | null | undefined, now = new Date()) {
  if (!meta?.date) return null;
  return differenceInCalendarDays(parseISO(meta.date), now);
}

export const seatingProgress = (s: EventStats) => {
  const needed = s.guests - s.declined;
  return needed === 0 ? 0 : s.seated / needed;
};

export type Attention = { id: string; tone: 'warn' | 'bad' | 'info'; title: string; detail: string; to: string };

// The "needs attention" list on the overview. Each item links to where it's fixed.
export function attentionItems(meta: EventMetadata | null | undefined, stats: EventStats, published: boolean): Attention[] {
  const items: Attention[] = [];
  if (!meta?.date) items.push({ id: 'date', tone: 'info', title: 'Set the event date', detail: 'Countdowns and reminders depend on it.', to: 'settings' });
  if (stats.guests === 0) items.push({ id: 'guests', tone: 'info', title: 'Add your guest list', detail: 'Import a spreadsheet or add guests one by one.', to: 'guests' });
  if (stats.tables === 0) items.push({ id: 'tables', tone: 'info', title: 'Lay out the room', detail: 'Drag tables onto the floor plan.', to: 'floor-plan' });
  const attending = stats.guests - stats.declined;
  if (stats.seats > 0 && attending > stats.seats)
    items.push({ id: 'capacity', tone: 'bad', title: `${attending - stats.seats} more seats needed`, detail: `${attending} guests are expected, but the plan only seats ${stats.seats}.`, to: 'floor-plan' });
  if (stats.unseated > 0 && stats.seats > 0)
    items.push({ id: 'unseated', tone: 'warn', title: `${stats.unseated} ${stats.unseated === 1 ? 'guest needs' : 'guests need'} a seat`, detail: 'Assign them on the floor plan, or use auto-seat.', to: 'floor-plan' });
  if (stats.pending > 0)
    items.push({ id: 'pending', tone: 'warn', title: `${stats.pending} RSVPs outstanding`, detail: 'Follow up with guests who haven’t replied.', to: 'guests?status=pending' });
  if (!published && stats.guests > 0)
    items.push({ id: 'publish', tone: 'info', title: 'Publish the guest page', detail: 'Guests can then find their table from a QR code.', to: 'share' });
  return items;
}
