import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Armchair, Check, ChevronDown, Download, MessageSquareText, MoreHorizontal, Plus, Search, Trash2, Upload, UserRoundX, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from '@app/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { seatNumber } from '@/domain/geometry';
import type { Guest, RsvpStatus } from '@/domain/types';
import { getInitials, plural } from '@/lib/format';
import { Card, EmptyState, Page } from '@/components/layout';
import { RsvpPill } from '@/components/StatusPill';
import { rsvpLabel } from '@/components/status';
import { TopbarActions } from '@/app/Topbar';
import { GuestDialog } from './GuestDialog';
import { ImportDialog } from './ImportDialog';
import { download, guestsToCsv } from './csv';

type RsvpFilter = 'all' | RsvpStatus;
type SeatFilter = 'all' | 'seated' | 'unseated';

const RSVP_OPTIONS: { value: RsvpFilter; label: string }[] = [
  { value: 'all', label: 'Any RSVP' },
  { value: 'confirmed', label: 'Attending' },
  { value: 'pending', label: 'Awaiting reply' },
  { value: 'declined', label: 'Declined' },
];
const SEAT_OPTIONS: { value: SeatFilter; label: string }[] = [
  { value: 'all', label: 'Any seating' },
  { value: 'seated', label: 'Seated' },
  { value: 'unseated', label: 'Not seated' },
];

function FilterMenu<T extends string>({ icon, value, options, onChange }: { icon: React.ReactNode; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const current = options.find((o) => o.value === value)!;
  const active = value !== options[0].value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              'pressable flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors',
              active ? 'border-brand/30 bg-brand-soft text-brand' : 'border-hairline bg-surface text-foreground hover:bg-accent',
            )}
          />
        }
      >
        {icon}
        {current.label}
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => onChange(o.value)}>
            <span className="flex-1">{o.label}</span>
            {o.value === value && <Check className="size-3.5 text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RsvpMenu({ guest }: { guest: Guest }) {
  const update = useWorkspace((s) => s.updateGuest);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button aria-label={`RSVP for ${guest.name}`} className="rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />}>
        <RsvpPill status={guest.status} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {(['confirmed', 'pending', 'declined'] as RsvpStatus[]).map((s) => (
          <DropdownMenuItem key={s} onClick={() => update(guest.id, { status: s })}>
            <span className="flex-1">{rsvpLabel[s]}</span>
            {guest.status === s && <Check className="size-3.5 text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors',
        checked || indeterminate ? 'border-foreground bg-foreground text-background' : 'border-input bg-surface hover:border-faint',
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2 rounded-full bg-current" /> : checked ? <Check className="size-3" strokeWidth={3} /> : null}
    </button>
  );
}

const COLS = 'grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto]';

export function GuestsPage() {
  const guests = useWorkspace((s) => s.guests);
  const tables = useWorkspace((s) => s.tables);
  const slug = useWorkspace((s) => s.event?.slug);
  const eventName = useWorkspace((s) => s.event?.name ?? 'guests');
  const updateGuests = useWorkspace((s) => s.updateGuests);
  const removeGuests = useWorkspace((s) => s.removeGuests);
  const unseat = useWorkspace((s) => s.unseat);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Guest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const rsvp = (params.get('status') as RsvpFilter) || 'all';
  const seat = (params.get('seating') as SeatFilter) || 'all';
  const setFilter = (key: string, value: string) =>
    setParams((p) => {
      if (value === 'all') p.delete(key);
      else p.set(key, value);
      return p;
    }, { replace: true });

  const tableById = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => (rsvp === 'all' ? true : g.status === rsvp))
      .filter((g) => (seat === 'all' ? true : seat === 'seated' ? !!g.tableId : !g.tableId))
      .filter((g) => !q || g.name.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q) || g.dietary.some((d) => d.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [guests, query, rsvp, seat]);

  const allSelected = visible.length > 0 && visible.every((g) => selected.has(g.id));
  const someSelected = visible.some((g) => selected.has(g.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const ids = [...selected];
  const clearSel = () => setSelected(new Set());

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <Page wide className="pb-28">
      <TopbarActions>
        <Button variant="ghost" size="sm" onClick={() => download(`${eventName.toLowerCase().replace(/\s+/g, '-')}-guests.csv`, guestsToCsv(guests, tables))} disabled={guests.length === 0}>
          <Download className="size-3.5" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="size-3.5" />
          Import
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-3.5" />
          Add guest
        </Button>
      </TopbarActions>

      <h1 className="flex items-baseline gap-2 text-[26px] font-semibold tracking-[-0.025em]">
        Guests <span className="font-normal text-faint tabular">{guests.length}</span>
      </h1>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-8 w-64 items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="size-3.5 text-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, dietary" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint" />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery('')} className="text-faint hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </label>
          <FilterMenu icon={<Users className="size-3.5 opacity-70" />} value={rsvp} options={RSVP_OPTIONS} onChange={(v) => setFilter('status', v)} />
          <FilterMenu icon={<Armchair className="size-3.5 opacity-70" />} value={seat} options={SEAT_OPTIONS} onChange={(v) => setFilter('seating', v)} />
          {(rsvp !== 'all' || seat !== 'all' || query) && (
            <button
              onClick={() => {
                setQuery('');
                setParams({}, { replace: true });
              }}
              className="h-8 px-2 text-[13px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-[12.5px] text-muted-foreground tabular">{visible.length !== guests.length && `${visible.length} of ${guests.length} shown`}</span>
        </div>

        {guests.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="size-4.5" />}
              title="No guests yet"
              description="Import your list from a spreadsheet, or add people one at a time."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setImportOpen(true)}>
                    <Upload className="size-4" />
                    Import
                  </Button>
                  <Button onClick={openNew}>
                    <Plus className="size-4" />
                    Add guest
                  </Button>
                </div>
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className={cn('grid items-center gap-4 border-b border-hairline bg-canvas px-4 py-2 text-[12px] text-muted-foreground', COLS)}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                label="Select all"
                onChange={() => (allSelected ? clearSel() : setSelected(new Set(visible.map((g) => g.id))))}
              />
              <span>Name</span>
              <span>RSVP</span>
              <span>Seat</span>
              <span>Dietary</span>
              <span className="w-7" />
            </div>
            {visible.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No guests match these filters.</p>}
            {visible.map((g) => {
              const table = g.tableId ? tableById.get(g.tableId) : undefined;
              const isSel = selected.has(g.id);
              return (
                <div
                  key={g.id}
                  onClick={() => {
                    setEditing(g);
                    setDialogOpen(true);
                  }}
                  className={cn('group grid cursor-pointer items-center gap-4 border-b border-hairline px-4 py-2.5 transition-colors last:border-b-0', COLS, isSel ? 'bg-brand-soft/60' : 'hover:bg-canvas')}
                >
                  <Checkbox checked={isSel} onChange={() => toggle(g.id)} label={`Select ${g.name}`} />
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-subtle text-[10px] font-semibold text-muted-foreground">{getInitials(g.name)}</span>
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate text-[13px]">
                        {g.name}
                        {g.comments && (
                          <Tooltip>
                            <TooltipTrigger render={<span className="text-faint" />}>
                              <MessageSquareText className="size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-60">{g.comments}</TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                      {g.email && <span className="truncate text-[12px] text-muted-foreground">{g.email}</span>}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <RsvpMenu guest={g} />
                  </div>
                  <span className="truncate text-[13px]">
                    {table ? (
                      <>
                        {table.name}
                        <span className="text-muted-foreground"> · Seat {seatNumber(g.seat ?? '0')}</span>
                      </>
                    ) : g.status === 'declined' ? (
                      <span className="text-faint">—</span>
                    ) : (
                      <Link to={`/events/${slug}/floor-plan`} onClick={(e) => e.stopPropagation()} className="text-[12.5px] text-warn hover:underline">
                        Not seated
                      </Link>
                    )}
                  </span>
                  <div className="flex min-w-0 gap-1 overflow-hidden">
                    {g.dietary.length === 0 ? (
                      <span className="text-[13px] text-faint">—</span>
                    ) : (
                      g.dietary.map((d) => (
                        <span key={d} className="inline-flex h-5 shrink-0 items-center rounded-[4px] border border-hairline px-1.5 text-[11.5px]">
                          {d}
                        </span>
                      ))
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<button aria-label={`Actions for ${g.name}`} className="grid size-7 place-items-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100 aria-expanded:opacity-100" />}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(g);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        {g.tableId && <DropdownMenuItem onClick={() => unseat([g.id])}>Unseat</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => removeGuests([g.id])}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {createPortal(
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, transform: 'translate(-50%, 12px)' }}
            animate={{ opacity: 1, transform: 'translate(-50%, 0px)' }}
            exit={{ opacity: 0, transform: 'translate(-50%, 12px)', transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 left-1/2 z-30 flex items-center gap-1 rounded-xl bg-foreground p-1 pl-3 text-background shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35)] md:left-[calc(50%+124px)]"
          >
            <span className="pr-2 text-[13px] tabular">{plural(selected.size, 'guest')} selected</span>
            {(
              [
                { label: 'Attending', run: () => updateGuests(ids, { status: 'confirmed' }) },
                { label: 'Declined', run: () => updateGuests(ids, { status: 'declined' }) },
              ] as const
            ).map((a) => (
              <button key={a.label} onClick={a.run} className="pressable h-7 rounded-md px-2.5 text-[12.5px] hover:bg-background/10">
                Mark {a.label.toLowerCase()}
              </button>
            ))}
            <button onClick={() => unseat(ids)} className="pressable flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] hover:bg-background/10">
              <UserRoundX className="size-3.5" />
              Unseat
            </button>
            <button
              onClick={() => {
                removeGuests(ids);
                toast(`Deleted ${plural(ids.length, 'guest')}`, { action: { label: 'Undo', onClick: () => useWorkspace.temporal.getState().undo() } });
                clearSel();
              }}
              className="pressable flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] text-[#ff8a80] hover:bg-background/10"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
            <span className="mx-1 h-4 w-px bg-background/20" />
            <button aria-label="Clear selection" onClick={clearSel} className="pressable grid size-7 place-items-center rounded-md hover:bg-background/10">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body,
      )}

      <GuestDialog guest={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </Page>
  );
}
