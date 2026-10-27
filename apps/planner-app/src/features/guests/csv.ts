import { seatNumber } from '@/domain/geometry';
import type { Guest, PlanTable, RsvpStatus } from '@/domain/types';

const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

const RSVP_TEXT: Record<RsvpStatus, string> = { confirmed: 'Attending', pending: 'Awaiting reply', declined: 'Declined' };

// Sorted by table then seat, which is the order caterers and venue staff want.
export function guestsToCsv(guests: Guest[], tables: PlanTable[]) {
  const byId = new Map(tables.map((t) => [t.id, t]));
  const rows = [...guests].sort((a, b) => {
    const ta = a.tableId ? byId.get(a.tableId)?.tableNumber ?? 999 : 999;
    const tb = b.tableId ? byId.get(b.tableId)?.tableNumber ?? 999 : 999;
    if (ta !== tb) return ta - tb;
    if (a.seat && b.seat) return seatNumber(a.seat) - seatNumber(b.seat);
    return a.name.localeCompare(b.name);
  });
  const header = ['Name', 'Email', 'RSVP', 'Table', 'Seat', 'Dietary', 'Notes'];
  const lines = rows.map((g) => {
    const t = g.tableId ? byId.get(g.tableId) : undefined;
    return [g.name, g.email ?? '', RSVP_TEXT[g.status], t?.name ?? '', g.seat ? String(seatNumber(g.seat)) : '', g.dietary.join('; '), g.comments ?? '']
      .map(escape)
      .join(',');
  });
  return [header.join(','), ...lines].join('\n');
}

export function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Column detection for imports: matches common header spellings.
const MATCHERS: { field: 'name' | 'first' | 'last' | 'email' | 'dietary' | 'notes' | 'rsvp'; re: RegExp }[] = [
  { field: 'first', re: /^(first|given)[ _-]?name$/i },
  { field: 'last', re: /^(last|family|sur)[ _-]?name$|^surname$/i },
  { field: 'name', re: /^(full[ _-]?)?name$|^guest([ _-]?name)?$/i },
  { field: 'email', re: /e-?mail/i },
  { field: 'dietary', re: /diet|allerg|food|meal/i },
  { field: 'notes', re: /note|comment|remark/i },
  { field: 'rsvp', re: /rsvp|status|attend|coming/i },
];

export type ImportedGuest = { name: string; email: string | null; dietary: string[]; comments: string | null; status: RsvpStatus };

export function detectColumns(headers: string[]) {
  const map: Partial<Record<(typeof MATCHERS)[number]['field'], string>> = {};
  for (const h of headers) {
    const m = MATCHERS.find((x) => x.re.test(h.trim()) && !map[x.field]);
    if (m) map[m.field] = h;
  }
  return map;
}

const parseRsvp = (v: string): RsvpStatus => {
  const s = v.trim().toLowerCase();
  if (/^(y|yes|attending|confirmed|accept|accepted|going|true|1)$/.test(s)) return 'confirmed';
  if (/^(n|no|declined|decline|not attending|false|0)$/.test(s)) return 'declined';
  return 'pending';
};

export function rowsToGuests(rows: Record<string, unknown>[], cols: ReturnType<typeof detectColumns>): ImportedGuest[] {
  const get = (row: Record<string, unknown>, key?: string) => (key ? String(row[key] ?? '').trim() : '');
  return rows
    .map((row) => {
      const name = get(row, cols.name) || [get(row, cols.first), get(row, cols.last)].filter(Boolean).join(' ');
      return {
        name,
        email: get(row, cols.email) || null,
        dietary: get(row, cols.dietary)
          .split(/[,;/]/)
          .map((d) => d.trim())
          .filter((d) => d && !/^(none|n\/a|no|-)$/i.test(d)),
        comments: get(row, cols.notes) || null,
        status: cols.rsvp ? parseRsvp(get(row, cols.rsvp)) : 'pending',
      };
    })
    .filter((g) => g.name);
}
