import { useMemo, useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Search } from 'lucide-react';
import { useWorkspace } from '@/store/workspace';
import { getInitials } from '@/lib/format';
import { cn } from '@app/shared';

// Search-and-pick for one seat. Unseated guests first, then everyone else
// (picking a seated guest moves them).
export function SeatPicker({
  tableId,
  seat,
  open,
  onOpenChange,
  trigger,
}: {
  tableId: string;
  seat: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactElement;
}) {
  const guests = useWorkspace((s) => s.guests);
  const tables = useWorkspace((s) => s.tables);
  const assign = useWorkspace((s) => s.assignSeat);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => g.status !== 'declined' && g.seat !== seat && g.name.toLowerCase().includes(q))
      .sort((a, b) => Number(!!a.tableId) - Number(!!b.tableId) || a.name.localeCompare(b.name))
      .slice(0, 50);
  }, [guests, query, seat]);

  const pick = (id: string) => {
    assign(id, tableId, seat);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side="left" align="start" sideOffset={10} className="z-50">
          <Popover.Popup className="flex w-64 origin-(--transform-origin) flex-col overflow-hidden rounded-xl bg-popover shadow-[0_12px_32px_-8px_rgb(0_0_0/0.2),0_0_0_1px_var(--hairline)] outline-none transition-[transform,opacity] duration-150 ease-out data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0">
            <label className="flex items-center gap-2 border-b px-3">
              <Search className="size-3.5 text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActive((a) => Math.min(list.length - 1, a + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActive((a) => Math.max(0, a - 1));
                  } else if (e.key === 'Enter' && list[active]) {
                    pick(list[active].id);
                  }
                }}
                placeholder="Find a guest"
                className="h-9 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-faint"
              />
            </label>
            <div className="max-h-64 overflow-y-auto p-1">
              {list.length === 0 && <p className="px-2 py-4 text-center text-[12.5px] text-muted-foreground">No guests found</p>}
              {list.map((g, i) => {
                const at = g.tableId ? tables.find((t) => t.id === g.tableId)?.name : null;
                return (
                  <button
                    key={g.id}
                    onMouseMove={() => setActive(i)}
                    onClick={() => pick(g.id)}
                    className={cn('flex h-8 w-full items-center gap-2 rounded-md px-2 text-left', i === active && 'bg-accent')}
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-subtle text-[9px] font-semibold text-muted-foreground">{getInitials(g.name)}</span>
                    <span className="flex-1 truncate text-[12.5px]">{g.name}</span>
                    {at && <span className="truncate text-[11px] text-faint">{at}</span>}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
