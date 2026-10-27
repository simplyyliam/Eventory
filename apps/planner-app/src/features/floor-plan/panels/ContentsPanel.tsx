import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from '@app/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { getInitials, plural } from '@/lib/format';
import { DND_GUEST, DND_ITEM, GRID, useEditor } from '../editorStore';
import { ELEMENT_PRESETS } from '@/domain/normalize';
import { tableSize } from '@/domain/geometry';
import { halfExtents } from '../canvas/snapping';
import { viewCentre } from '../canvas/viewport';
import type { DropPayload } from '../canvas/PlanCanvas';
import { Preview } from './previews';

type Entry = { label: string; hint: string; payload: DropPayload };

const GROUPS: { title: string; items: Entry[] }[] = [
  {
    title: 'Tables',
    items: [
      { label: 'Round', hint: '8 seats', payload: { type: 'table', shape: 'circle', seats: 8 } },
      { label: 'Round', hint: '10 seats', payload: { type: 'table', shape: 'circle', seats: 10 } },
      { label: 'Banquet', hint: '10 seats', payload: { type: 'table', shape: 'rectangle', seats: 10 } },
      { label: 'Square', hint: '8 seats', payload: { type: 'table', shape: 'square', seats: 8 } },
    ],
  },
  {
    title: 'Chairs',
    items: [
      { label: 'Chair', hint: '1 seat', payload: { type: 'table', shape: 'row', seats: 1 } },
      { label: 'Chair row', hint: '6 seats', payload: { type: 'table', shape: 'row', seats: 6 } },
    ],
  },
  {
    title: 'Room',
    items: [
      { label: 'Stage', hint: '6 × 3 m', payload: { type: 'element', kind: 'stage' } },
      { label: 'Dance floor', hint: '5 × 5 m', payload: { type: 'element', kind: 'dance-floor' } },
      { label: 'Bar', hint: '4 m', payload: { type: 'element', kind: 'bar' } },
      { label: 'Buffet', hint: '4 m', payload: { type: 'element', kind: 'buffet' } },
      { label: 'DJ booth', hint: '2 m', payload: { type: 'element', kind: 'dj' } },
      { label: 'Entrance', hint: '2 m', payload: { type: 'element', kind: 'entrance' } },
      { label: 'Pillar', hint: '0.5 m', payload: { type: 'element', kind: 'pillar' } },
      { label: 'Plant', hint: '0.7 m', payload: { type: 'element', kind: 'plant' } },
    ],
  },
];

const footprint = (payload: DropPayload) => {
  if (payload.type === 'element') return ELEMENT_PRESETS[payload.kind];
  const size = tableSize(payload.shape, payload.seats);
  // include the chairs around the table
  return { width: size.width + 260, height: size.height + 260 };
};

// Walks outward from the middle of the view until the new item doesn't
// overlap anything, so click-to-add never drops things on top of each other.
function freeSpot(centre: { x: number; y: number }, w: number, h: number) {
  const { tables, venue } = useWorkspace.getState();
  const boxes = [...tables, ...venue.elements].map((i) => {
    const pad = 'seatCount' in i ? 130 : 20;
    return { x: i.x, y: i.y, ...halfExtents(i.width + pad * 2, i.height + pad * 2, i.rotation) };
  });
  const free = (x: number, y: number) => boxes.every((b) => Math.abs(b.x - x) >= b.hw + w / 2 || Math.abs(b.y - y) >= b.hh + h / 2);
  const step = GRID * 2;
  for (let ring = 0; ring < 40; ring++) {
    for (let i = -ring; i <= ring; i++) {
      for (const [dx, dy] of [[i, -ring], [i, ring], [-ring, i], [ring, i]]) {
        const x = Math.round((centre.x + dx * step) / GRID) * GRID;
        const y = Math.round((centre.y + dy * step) / GRID) * GRID;
        if (free(x, y)) return { x, y };
      }
    }
  }
  return centre;
}

function addAtCentre(payload: DropPayload) {
  const stage = useEditor.getState().stage;
  if (!stage) return;
  const ws = useWorkspace.getState();
  const { width, height } = footprint(payload);
  const { x, y } = freeSpot(viewCentre(stage), width, height);
  const id = payload.type === 'table' ? ws.addTable(payload.shape, x, y, payload.seats) : ws.addElement(payload.kind, x, y);
  useEditor.getState().select([id]);
}

function ItemTile({ entry }: { entry: Entry }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DND_ITEM, JSON.stringify(entry.payload));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => addAtCentre(entry.payload)}
            className="pressable group flex cursor-grab flex-col items-center gap-1.5 rounded-lg border border-transparent p-2 hover:border-hairline hover:bg-canvas active:cursor-grabbing"
          />
        }
      >
        <span className="grid h-11 w-full place-items-center text-faint transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:text-muted-foreground">
          <Preview payload={entry.payload} />
        </span>
        <span className="flex flex-col items-center leading-tight">
          <span className="text-[12px] text-foreground">{entry.label}</span>
          <span className="text-[11px] text-faint">{entry.hint}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">Drag onto the plan, or click to add</TooltipContent>
    </Tooltip>
  );
}

function AddTab() {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-2 pb-3 scrollbar-none">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-1">
          <p className="px-1.5 text-[11.5px] font-medium text-faint">{g.title}</p>
          <div className="grid grid-cols-2 gap-0.5">
            {g.items.map((item) => (
              <ItemTile key={`${item.label}-${item.hint}`} entry={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GuestsTab() {
  const guests = useWorkspace((s) => s.guests);
  const tables = useWorkspace((s) => s.tables);
  const autoSeat = useWorkspace((s) => s.autoSeat);
  const setDragging = useEditor((s) => s.setDraggingGuest);
  const [query, setQuery] = useState('');

  const waiting = useMemo(
    () =>
      guests
        .filter((g) => !g.tableId && g.status !== 'declined')
        .filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [guests, query],
  );
  const total = guests.filter((g) => !g.tableId && g.status !== 'declined').length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 px-3 pb-2">
        <label className="flex h-8 items-center gap-2 rounded-lg bg-canvas px-2.5 shadow-[inset_0_0_0_1px_var(--hairline)] focus-within:shadow-[inset_0_0_0_1px_var(--ring)]">
          <Search className="size-3.5 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search unseated"
            className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-faint"
          />
        </label>
        <Button
          variant="outline"
          size="sm"
          disabled={total === 0 || tables.length === 0}
          onClick={() => {
            const placed = autoSeat();
            toast.success(placed ? `Seated ${plural(placed, 'guest')}` : 'No free seats left', {
              description: placed ? 'Undo with Ctrl+Z if you’d rather do it yourself.' : 'Add tables or seats, then try again.',
            });
          }}
        >
          <Sparkles className="size-3.5" />
          Auto-seat {total > 0 ? total : ''}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-none">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-1 px-3 py-8 text-center">
            <span className="grid size-8 place-items-center rounded-full bg-ok-soft text-ok">✓</span>
            <p className="text-[12.5px] font-medium">Everyone has a seat</p>
            <p className="text-[12px] text-muted-foreground">Drag seated guests in the inspector to move them.</p>
          </div>
        ) : waiting.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">No one matches “{query}”</p>
        ) : (
          waiting.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, transform: 'translateY(4px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ delay: Math.min(i, 12) * 0.02, duration: 0.2 }}
            >
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DND_GUEST, g.id);
                  e.dataTransfer.effectAllowed = 'link';
                  setDragging(g.id);
                }}
                onDragEnd={() => setDragging(null)}
                className="group flex h-9 cursor-grab items-center gap-2.5 rounded-lg px-2 hover:bg-canvas active:cursor-grabbing"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-subtle text-[10px] font-semibold text-muted-foreground">
                  {getInitials(g.name)}
                </span>
                <span className="flex-1 truncate text-[12.5px]">{g.name}</span>
                {g.dietary.length > 0 && <span className="size-1.5 rounded-full bg-warn" title={g.dietary.join(', ')} />}
                <span className="text-[11px] text-faint opacity-0 transition-opacity group-hover:opacity-100">drag</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function ContentsPanel() {
  const [tab, setTab] = useState<'add' | 'guests'>('add');
  const unseated = useWorkspace((s) => s.guests.filter((g) => !g.tableId && g.status !== 'declined').length);

  return (
    <div className="flex h-full w-60 flex-col overflow-hidden rounded-2xl bg-surface/95 shadow-[0_0_0_1px_var(--hairline),0_8px_30px_-8px_rgb(0_0_0/0.12)] backdrop-blur-xl">
      <div className="flex gap-1 p-2" role="tablist">
        {(['add', 'guests'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="pressable relative flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[12.5px] text-muted-foreground aria-selected:text-foreground"
          >
            {tab === t && <motion.span layoutId="contents-tab" className="absolute inset-0 rounded-md bg-subtle" transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }} />}
            <span className="relative">{t === 'add' ? 'Add' : 'Guests'}</span>
            {t === 'guests' && unseated > 0 && (
              <span className={cn('relative rounded-full bg-warn-soft px-1.5 text-[10.5px] font-medium tabular text-[color-mix(in_oklch,var(--warn)_80%,black)] dark:text-warn')}>
                {unseated}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === 'add' ? <AddTab /> : <GuestsTab />}
    </div>
  );
}
