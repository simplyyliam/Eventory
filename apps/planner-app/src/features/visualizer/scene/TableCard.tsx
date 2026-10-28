import { Html } from '@react-three/drei';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { useWorkspace } from '@/store/workspace';
import { seatNumber, seatPoses } from '@/domain/geometry';
import type { PlanTable } from '@/domain/types';
import { getInitials } from '@/lib/format';
import { ProgressRing } from '@/components/ProgressRing';
import { toMetres, useView } from '../viewStore';

const SHAPE: Record<PlanTable['shape'], string> = { circle: 'Round', rectangle: 'Banquet', square: 'Square', row: 'Chairs' };

function CardBody({ table }: { table: PlanTable }) {
  const guests = useWorkspace((s) => s.guests).filter((g) => g.tableId === table.id);
  const select = useView((s) => s.select);
  const cap = seatPoses(table).filter((p) => !table.hiddenSeats.includes(p.id)).length;
  const sorted = [...guests].sort((a, b) => seatNumber(a.seat ?? '0') - seatNumber(b.seat ?? '0'));
  const dietary = guests.flatMap((g) => g.dietary);
  const counts = [...new Set(dietary)].map((d) => `${dietary.filter((x) => x === d).length} ${d.toLowerCase()}`);

  return (
      <motion.div
        key={table.id}
        exit={{ opacity: 0, transform: 'translateY(4px) scale(0.98)', transition: { duration: 0.12 } }}
        initial={{ opacity: 0, transform: 'translateY(8px) scale(0.97)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="w-64 overflow-hidden rounded-xl bg-surface/85 text-foreground shadow-[0_0_0_1px_var(--hairline),0_20px_50px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-3.5 pt-3 pb-2.5">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-semibold tracking-[-0.01em]">{table.name}</span>
            <span className="text-[12px] text-muted-foreground">
              {SHAPE[table.shape]} · {cap} seats
            </span>
          </div>
          <button aria-label="Close" onClick={() => select(null)} className="grid size-6 place-items-center rounded-md text-faint hover:bg-accent hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-y border-hairline text-[12px]">
          <div className="flex items-center gap-2 border-r border-hairline px-3.5 py-2">
            <ProgressRing value={cap ? guests.length / cap : 0} size={14} className={guests.length >= cap ? 'text-ok' : 'text-foreground'} />
            <span className="tabular">
              {guests.length}/{cap} seated
            </span>
          </div>
          <div className="px-3.5 py-2 text-muted-foreground tabular">{cap - guests.length > 0 ? `${cap - guests.length} free` : 'Full'}</div>
        </div>

        <div className="max-h-48 overflow-y-auto px-1.5 py-1.5">
          {sorted.length === 0 ? (
            <p className="px-2 py-3 text-[12.5px] text-muted-foreground">No one seated yet.</p>
          ) : (
            sorted.map((g) => (
              <div key={g.id} className="flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px]">
                <span className="w-4 text-right text-[11px] text-faint tabular">{seatNumber(g.seat ?? '0')}</span>
                <span className="grid size-5 place-items-center rounded-full bg-subtle text-[9px] font-semibold text-muted-foreground">{getInitials(g.name)}</span>
                <span className="flex-1 truncate">{g.name}</span>
                {g.dietary.length > 0 && <span className="size-1.5 rounded-full bg-warn" title={g.dietary.join(', ')} />}
              </div>
            ))
          )}
        </div>

        {counts.length > 0 && <p className="border-t border-hairline px-3.5 py-2 text-[11.5px] text-muted-foreground">Dietary: {counts.join(', ')}</p>}

        <button
          onClick={() => useView.getState().openInPlan(table.id)}
          className="flex w-full items-center justify-between border-t border-hairline px-3.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Edit seating in 2D
          <ArrowUpRight className="size-3.5" />
        </button>
      </motion.div>
  );
}

// Frosted card that floats beside the selected table, like an info plaque in
// the room. A single instance stays mounted and moves to whichever table is
// selected.
export function TableCard() {
  const selected = useView((s) => s.selected);
  const table = useWorkspace((s) => s.tables.find((t) => t.id === selected) ?? null);
  const pos: [number, number, number] = table ? [toMetres(table.x), 1.2, toMetres(table.y)] : [0, -100, 0];
  return (
    <Html position={pos} zIndexRange={[40, 30]} style={{ pointerEvents: table ? 'auto' : 'none' }}>
      <div className="translate-x-6 -translate-y-1/2">
        <AnimatePresence mode="wait">{table && <CardBody table={table} />}</AnimatePresence>
      </div>
    </Html>
  );
}
