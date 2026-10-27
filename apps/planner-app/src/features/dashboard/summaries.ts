import { isPast, parseISO } from 'date-fns';
import { toGuest, toPlanTable } from '@/domain/normalize';
import { daysUntil, eventStats, seatingProgress, type EventStats } from '@/domain/stats';
import type { EventSummary } from '@/domain/types';

export type EventRow = {
  event: EventSummary;
  stats: EventStats;
  progress: number;
  days: number | null;
  past: boolean;
};

export function toRows(events: EventSummary[]): EventRow[] {
  return events.map((event) => {
    const tables = (event.tables as Record<string, unknown>[]).map(toPlanTable);
    const guests = (event.guests as Record<string, unknown>[]).map(toGuest);
    const stats = eventStats(tables, guests);
    const days = daysUntil(event.metadata);
    return {
      event,
      stats,
      progress: seatingProgress(stats),
      days,
      past: event.metadata?.date ? isPast(parseISO(event.metadata.date)) && (days ?? 0) < 0 : false,
    };
  });
}

// Upcoming first (soonest at the top), then undated, then past.
export function sortRows(rows: EventRow[]) {
  const rank = (r: EventRow) => (r.past ? 2 : r.days === null ? 1 : 0);
  return [...rows].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff) return diff;
    if (a.days !== null && b.days !== null) return a.past ? b.days - a.days : a.days - b.days;
    return b.event.updatedAt.localeCompare(a.event.updatedAt);
  });
}

export const whenLabel = (days: number | null) => {
  if (days === null) return 'No date';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${-days} days ago`;
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
};

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
