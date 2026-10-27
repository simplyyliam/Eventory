import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { Box, CalendarPlus, Home, LayoutGrid, Moon, QrCode, Search, Settings2, Sun, Users } from 'lucide-react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cn } from '@app/shared';
import { useEvents } from '@/lib/queries';
import { useTheme, resolvedTheme } from '@/lib/theme';
import { useWorkspace } from '@/store/workspace';
import { EventMark } from './Sidebar';
import { useNewEventDialog } from '@/features/dashboard/NewEventDialog';

export const useCommandMenu = create<{ open: boolean; setOpen: (v: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

type Command = { id: string; group: string; label: string; icon: React.ReactNode; run: () => void };

// Opens instantly with no animation: it's used too often for motion to help.
export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const navigate = useNavigate();
  const { data: events } = useEvents();
  const event = useWorkspace((s) => s.event);
  const { theme, setTheme } = useTheme();
  const openNewEvent = useNewEventDialog((s) => s.setOpen);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useCommandMenu.getState().open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const commands = useMemo<Command[]>(() => {
    const icon = (I: React.ElementType) => <I className="size-4 text-faint" strokeWidth={1.75} />;
    const list: Command[] = [];
    if (event) {
      const base = `/events/${event.slug}`;
      list.push(
        { id: 'overview', group: event.name, label: 'Overview', icon: icon(Home), run: () => navigate(base) },
        { id: 'floor', group: event.name, label: 'Floor plan', icon: icon(LayoutGrid), run: () => navigate(`${base}/floor-plan`) },
        { id: 'guests', group: event.name, label: 'Guests', icon: icon(Users), run: () => navigate(`${base}/guests`) },
        { id: 'view', group: event.name, label: '3D view', icon: icon(Box), run: () => navigate(`${base}/view`) },
        { id: 'share', group: event.name, label: 'Share & QR code', icon: icon(QrCode), run: () => navigate(`${base}/share`) },
        { id: 'settings', group: event.name, label: 'Event settings', icon: icon(Settings2), run: () => navigate(`${base}/settings`) },
      );
    }
    for (const e of events ?? []) {
      list.push({ id: `event-${e.id}`, group: 'Events', label: e.name, icon: <EventMark name={e.name} size="sm" />, run: () => navigate(`/events/${e.slug}`) });
    }
    const dark = resolvedTheme(theme) === 'dark';
    list.push(
      { id: 'home', group: 'General', label: 'All events', icon: icon(Home), run: () => navigate('/') },
      { id: 'new', group: 'General', label: 'Create event…', icon: icon(CalendarPlus), run: () => openNewEvent(true) },
      { id: 'theme', group: 'General', label: dark ? 'Switch to light theme' : 'Switch to dark theme', icon: icon(dark ? Sun : Moon), run: () => setTheme(dark ? 'light' : 'dark') },
    );
    return list;
  }, [event, events, navigate, theme, setTheme, openNewEvent]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()));

  const run = (c: Command | undefined) => {
    if (!c) return;
    setOpen(false);
    c.run();
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup = '';

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setQuery('');
          setActive(0);
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/15" />
        <DialogPrimitive.Popup className="fixed top-[18vh] left-1/2 z-50 flex w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-popover shadow-[0_24px_60px_-16px_rgb(0_0_0/0.3),0_0_0_1px_var(--hairline)] outline-none">
          <DialogPrimitive.Title className="sr-only">Command menu</DialogPrimitive.Title>
          <div className="flex items-center gap-2.5 border-b px-4">
            <Search className="size-4 text-faint" strokeWidth={1.75} />
            <input
              autoFocus
              value={query}
              placeholder="Jump to a page or event…"
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(filtered.length - 1, a + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === 'Enter') {
                  run(filtered[active]);
                }
              }}
              className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
          </div>
          <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">Nothing matches “{query}”</p>}
            {filtered.map((c, i) => {
              const header = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              return (
                <div key={c.id}>
                  {header && <p className="px-2.5 pt-2.5 pb-1 text-[11.5px] font-medium text-faint">{header}</p>}
                  <button
                    data-index={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(c)}
                    className={cn('flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px]', i === active && 'bg-accent')}
                  >
                    {c.icon}
                    <span className="truncate">{c.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
