import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, Eye, EyeOff, Minus, Plus, RotateCw, Trash2, UserPlus, X } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { SEAT_LIMITS, capacity, seatPoses } from '@/domain/geometry';
import { UNITS_PER_METRE, type PlanTable, type TableFinish, type TableShape, type VenueElement } from '@/domain/types';
import { getInitials, plural } from '@/lib/format';
import { RollingNumber } from '@/components/RollingNumber';
import { useEditor } from '../editorStore';
import { FINISHES } from '../canvas/palette';
import { SeatPicker } from './SeatPicker';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

// Text input that commits on blur/Enter so typing doesn't flood undo history.
function CommitInput({ value, onCommit, className, ...props }: { value: string; onCommit: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <input
      {...props}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setDraft(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn('h-8 rounded-lg bg-canvas px-2.5 text-[13px] outline-none shadow-[inset_0_0_0_1px_var(--hairline)] focus:shadow-[inset_0_0_0_1px_var(--ring)]', className)}
    />
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const btn = 'pressable grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30';
  return (
    <div className="flex items-center rounded-lg bg-canvas shadow-[inset_0_0_0_1px_var(--hairline)]">
      <button aria-label="Fewer" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-[13px] font-medium">
        <RollingNumber value={value} />
      </span>
      <button aria-label="More" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange, id }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; id: string }) {
  return (
    <div className="grid w-full grid-flow-col rounded-lg bg-canvas p-0.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cn('relative h-7 rounded-md text-[12px] text-muted-foreground', value === o.value && 'text-foreground')}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-md bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--hairline)]" transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

const metres = (u: number) => Math.round((u / UNITS_PER_METRE) * 10) / 10;

function MetreInput({ value, onCommit, label }: { value: number; onCommit: (units: number) => void; label: string }) {
  return (
    <label className="flex flex-1 items-center gap-1.5 rounded-lg bg-canvas pr-2.5 shadow-[inset_0_0_0_1px_var(--hairline)] focus-within:shadow-[inset_0_0_0_1px_var(--ring)]">
      <span className="pl-2.5 text-[11.5px] text-faint">{label}</span>
      <CommitInput
        value={String(metres(value))}
        inputMode="decimal"
        onCommit={(v) => {
          const n = parseFloat(v.replace(',', '.'));
          if (Number.isFinite(n) && n > 0) onCommit(n * UNITS_PER_METRE);
        }}
        className="w-full bg-transparent px-0 shadow-none focus:shadow-none tabular"
      />
      <span className="text-[11.5px] text-faint">m</span>
    </label>
  );
}

function Actions({ ids }: { ids: string[] }) {
  const duplicate = useWorkspace((s) => s.duplicate);
  const remove = useWorkspace((s) => s.removeItems);
  const select = useEditor((s) => s.select);
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1" onClick={() => select(duplicate(ids))}>
        <Copy className="size-3.5" />
        Duplicate
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 hover:border-bad/30 hover:bg-bad-soft hover:text-bad"
        onClick={() => {
          remove(ids);
          select([]);
        }}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
    </div>
  );
}

function SeatRow({ table, seat, index }: { table: PlanTable; seat: string; index: number }) {
  const guest = useWorkspace((s) => s.guests.find((g) => g.seat === seat) ?? null);
  const unseat = useWorkspace((s) => s.unseat);
  const toggleSeat = useWorkspace((s) => s.toggleSeat);
  const focusSeat = useEditor((s) => s.focusSeat);
  const setFocusSeat = useEditor((s) => s.setFocusSeat);
  const hidden = table.hiddenSeats.includes(seat);
  const focused = focusSeat === seat;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focused]);

  return (
    <div ref={ref} className={cn('group flex h-9 items-center gap-2 rounded-lg px-2 transition-colors', focused ? 'bg-brand-soft' : 'hover:bg-canvas', hidden && 'opacity-50')}>
      <span className="w-4 text-right text-[11px] text-faint tabular">{index + 1}</span>
      {guest ? (
        <>
          <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-info-soft text-[9.5px] font-semibold text-info">{getInitials(guest.name)}</span>
          <span className="flex-1 truncate text-[12.5px]">{guest.name}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <button aria-label={`Unseat ${guest.name}`} onClick={() => unseat([guest.id])} className="grid size-6 place-items-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100">
                  <X className="size-3.5" />
                </button>
              }
            />
            <TooltipContent>Unseat</TooltipContent>
          </Tooltip>
        </>
      ) : hidden ? (
        <span className="flex-1 text-[12.5px] text-faint">Seat removed</span>
      ) : (
        <SeatPicker
          tableId={table.id}
          seat={seat}
          open={focused}
          onOpenChange={(v) => setFocusSeat(v ? seat : null)}
          trigger={
            <button className="flex flex-1 items-center gap-2 text-left text-[12.5px] text-faint hover:text-foreground">
              <span className="grid size-5.5 place-items-center rounded-full border border-dashed border-input">
                <UserPlus className="size-3" />
              </span>
              Assign guest
            </button>
          }
        />
      )}
      {!guest && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button aria-label={hidden ? 'Restore seat' : 'Remove seat'} onClick={() => toggleSeat(table.id, seat)} className="grid size-6 place-items-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100">
                {hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            }
          />
          <TooltipContent>{hidden ? 'Restore seat' : 'Remove seat (e.g. where tables join)'}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

const SHAPES: { value: TableShape; label: string }[] = [
  { value: 'circle', label: 'Round' },
  { value: 'rectangle', label: 'Long' },
  { value: 'square', label: 'Square' },
  { value: 'row', label: 'Row' },
];

function TableInspector({ table }: { table: PlanTable }) {
  const update = useWorkspace((s) => s.updateTable);
  const seated = useWorkspace((s) => s.guests.filter((g) => g.tableId === table.id).length);
  const poses = seatPoses(table);
  const limits = SEAT_LIMITS[table.shape];
  const cap = capacity(table);

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-hairline p-4">
        <CommitInput value={table.name} onCommit={(name) => update(table.id, { name: name.trim() || table.name })} className="w-full font-medium" aria-label="Table name" />
        <p className="text-[12px] text-muted-foreground tabular">
          {seated} of {plural(cap, 'seat')} filled
        </p>
      </div>
      <div className="flex flex-col gap-3 border-b border-hairline p-4">
        <Segmented id="shape" value={table.shape} options={SHAPES} onChange={(shape) => update(table.id, { shape })} />
        <Field label="Seats">
          <Stepper value={table.seatCount} min={limits.min} max={limits.max} onChange={(seatCount) => update(table.id, { seatCount })} />
        </Field>
        <Field label="Rotation">
          <div className="flex items-center gap-1">
            <CommitInput
              value={`${Math.round(table.rotation)}`}
              inputMode="numeric"
              onCommit={(v) => {
                const n = parseFloat(v);
                if (Number.isFinite(n)) update(table.id, { rotation: ((n % 360) + 360) % 360 });
              }}
              className="w-14 text-right tabular"
              aria-label="Rotation in degrees"
            />
            <Button variant="ghost" size="icon-sm" aria-label="Rotate 45 degrees" onClick={() => update(table.id, { rotation: (table.rotation + 45) % 360 })}>
              <RotateCw className="size-3.5" />
            </Button>
          </div>
        </Field>
        {table.shape !== 'row' && (
          <Field label="Finish">
            <div className="flex gap-1.5">
              {(Object.keys(FINISHES) as TableFinish[]).map((f) => (
                <Tooltip key={f}>
                  <TooltipTrigger
                    render={
                      <button
                        aria-label={FINISHES[f].label}
                        onClick={() => update(table.id, { finish: f })}
                        className={cn('pressable size-5.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] transition-shadow', table.finish === f && 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--brand)]')}
                        style={{ background: FINISHES[f].light }}
                      />
                    }
                  />
                  <TooltipContent>{FINISHES[f].label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Field>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="px-4 pt-3 pb-1.5 text-[11.5px] font-medium text-faint">Seats</p>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
          {poses.map((s) => (
            <SeatRow key={s.id} table={table} seat={s.id} index={s.index} />
          ))}
        </div>
      </div>
      <div className="border-t border-hairline p-3">
        <Actions ids={[table.id]} />
      </div>
    </>
  );
}

function ElementInspector({ element }: { element: VenueElement }) {
  const update = useWorkspace((s) => s.updateElement);
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-hairline p-4">
        <CommitInput value={element.label} onCommit={(label) => update(element.id, { label: label.trim() || element.label })} className="w-full font-medium" aria-label="Label" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <MetreInput label="W" value={element.width} onCommit={(width) => update(element.id, { width })} />
          <MetreInput label="D" value={element.height} onCommit={(height) => update(element.id, { height })} />
        </div>
        <Field label="Rotation">
          <Button variant="outline" size="sm" onClick={() => update(element.id, { rotation: (element.rotation + 90) % 360 })}>
            <RotateCw className="size-3.5" />
            {Math.round(element.rotation)}°
          </Button>
        </Field>
        <p className="text-[12px] text-muted-foreground">Drag the corner handles on the plan to resize.</p>
      </div>
      <div className="mt-auto border-t border-hairline p-3">
        <Actions ids={[element.id]} />
      </div>
    </>
  );
}

function RoomInspector() {
  const room = useWorkspace((s) => s.venue.room);
  const setRoom = useWorkspace((s) => s.setRoom);
  const tables = useWorkspace((s) => s.tables);
  const seats = tables.reduce((n, t) => n + capacity(t), 0);
  const area = metres(room.width) * metres(room.depth);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-medium">Room</p>
        <p className="text-[12px] text-muted-foreground">Set the floor size so the plan and 3D view are to scale.</p>
      </div>
      <div className="flex gap-2">
        <MetreInput label="W" value={room.width} onCommit={(width) => setRoom({ ...room, width })} />
        <MetreInput label="D" value={room.depth} onCommit={(depth) => setRoom({ ...room, depth })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-canvas p-2.5">
          <p className="text-[11.5px] text-faint">Floor area</p>
          <p className="text-[13px] font-medium tabular">{Math.round(area)} m²</p>
        </div>
        <div className="rounded-lg bg-canvas p-2.5">
          <p className="text-[11.5px] text-faint">Per seat</p>
          <p className="text-[13px] font-medium tabular">{seats ? `${(area / seats).toFixed(1)} m²` : '—'}</p>
        </div>
      </div>
      <p className="text-[12px] leading-5 text-muted-foreground">
        Banquet seating usually needs about 1–1.4 m² per guest including aisles.
      </p>
    </div>
  );
}

export function Inspector() {
  const selected = useEditor((s) => s.selected);
  const table = useWorkspace((s) => (selected.length === 1 ? s.tables.find((t) => t.id === selected[0]) : undefined));
  const element = useWorkspace((s) => (selected.length === 1 ? s.venue.elements.find((e) => e.id === selected[0]) : undefined));
  const key = selected.length === 1 ? selected[0] : selected.length > 1 ? 'multi' : 'room';

  return (
    <div className="flex max-h-full w-72 flex-col overflow-hidden rounded-2xl bg-surface/95 shadow-[0_0_0_1px_var(--hairline),0_8px_30px_-8px_rgb(0_0_0/0.12)] backdrop-blur-xl">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(2px)', transition: { duration: 0.08 } }}
          transition={{ duration: 0.16 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {table ? (
            <TableInspector table={table} />
          ) : element ? (
            <ElementInspector element={element} />
          ) : selected.length > 1 ? (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-[13px] font-medium">{plural(selected.length, 'item')} selected</p>
              <p className="text-[12px] text-muted-foreground">Drag to move them together, or use the handle to rotate the group.</p>
              <Actions ids={selected} />
            </div>
          ) : (
            <RoomInspector />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
