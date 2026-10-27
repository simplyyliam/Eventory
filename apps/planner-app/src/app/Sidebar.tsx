import { NavLink, useMatch, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Box,
  Check,
  ChevronsUpDown,
  Home,
  LayoutGrid,
  Monitor,
  Moon,
  Plus,
  QrCode,
  Search,
  Settings2,
  Sun,
  Users,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@app/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { useEvents } from '@/lib/queries';
import { useTheme, type Theme } from '@/lib/theme';
import { useWorkspace } from '@/store/workspace';
import { eventStats } from '@/domain/stats';
import { Kbd, MOD } from '@/components/layout';
import { useCommandMenu } from './CommandMenu';
import { useNewEventDialog } from '@/features/dashboard/NewEventDialog';

type Item = { to: string; label: string; icon: React.ElementType; end?: boolean; badge?: number };

function NavItem({ item, group, onNavigate }: { item: Item; group: string; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'pressable group relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30',
          isActive && 'text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`nav-${group}`}
              className="absolute inset-0 rounded-lg bg-surface shadow-[0_0_0_1px_var(--hairline),0_1px_2px_rgb(0_0_0/0.05)]"
              transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
            />
          )}
          <Icon className={cn('relative size-4 shrink-0 transition-colors', isActive ? 'text-foreground' : 'text-faint group-hover:text-muted-foreground')} strokeWidth={1.75} />
          <span className="relative flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="relative rounded-full bg-warn-soft px-1.5 text-[11px] font-medium tabular text-[color-mix(in_oklch,var(--warn)_80%,black)] dark:text-warn">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function EventSwitcher() {
  const navigate = useNavigate();
  const event = useWorkspace((s) => s.event);
  const date = useWorkspace((s) => s.details.date);
  const { data: events } = useEvents();
  if (!event) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="pressable flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent" />
        }
      >
        <EventMark name={event.name} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-medium leading-4">{event.name}</span>
          <span className="truncate text-[11.5px] leading-4 text-muted-foreground">
            {date ? format(parseISO(date), 'EEE d MMM yyyy') : 'No date set'}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-faint" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch event</DropdownMenuLabel>
          {(events ?? []).slice(0, 8).map((e) => (
            <DropdownMenuItem key={e.id} onClick={() => navigate(`/events/${e.slug}`)}>
              <EventMark name={e.name} small />
              <span className="flex-1 truncate">{e.name}</span>
              {e.id === event.id && <Check className="size-3.5 text-muted-foreground" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/')}>
          <Home className="size-3.5" />
          All events
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const MARK_HUES = [25, 55, 145, 200, 255, 300, 340];

// A small coloured monogram so events are recognisable at a glance.
export function EventMark({ name, small }: { name: string; small?: boolean }) {
  const hue = MARK_HUES[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % MARK_HUES.length];
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-md font-semibold text-white', small ? 'size-4.5 text-[9.5px]' : 'size-7 text-[12px]')}
      style={{
        background: `linear-gradient(160deg, oklch(0.72 0.13 ${hue}), oklch(0.58 0.15 ${hue}))`,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.25), 0 1px 2px rgb(0 0 0 / 0.12)',
      }}
    >
      {name.trim().charAt(0).toUpperCase() || 'E'}
    </span>
  );
}

const themes: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center rounded-lg bg-sidebar-accent p-0.5" role="radiogroup" aria-label="Theme">
      {themes.map((t) => (
        <button
          key={t.value}
          role="radio"
          aria-checked={theme === t.value}
          aria-label={t.label}
          onClick={() => setTheme(t.value)}
          className="relative grid size-6 place-items-center rounded-md text-faint hover:text-foreground aria-checked:text-foreground"
        >
          {theme === t.value && (
            <motion.span layoutId="theme-pill" className="absolute inset-0 rounded-md bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)]" transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }} />
          )}
          <t.icon className="relative size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const inEvent = useMatch('/events/:slug/*');
  const event = useWorkspace((s) => s.event);
  const unseated = useWorkspace((s) => (s.event ? eventStats(s.tables, s.guests).unseated : 0));
  const { data: events } = useEvents();
  const openCommand = useCommandMenu((s) => s.setOpen);
  const openNewEvent = useNewEventDialog((s) => s.setOpen);
  const base = event ? `/events/${event.slug}` : '';

  const eventNav: Item[] = [
    { to: base, label: 'Overview', icon: Home, end: true },
    { to: `${base}/floor-plan`, label: 'Floor plan', icon: LayoutGrid, badge: unseated || undefined },
    { to: `${base}/guests`, label: 'Guests', icon: Users },
    { to: `${base}/view`, label: '3D view', icon: Box },
    { to: `${base}/share`, label: 'Share', icon: QrCode },
    { to: `${base}/settings`, label: 'Settings', icon: Settings2 },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-4 px-3 py-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-2 rounded-md text-[13px] font-semibold tracking-[-0.01em]">
          <LogoMark />
          Eventory
        </NavLink>
        <button
          onClick={() => openCommand(true)}
          aria-label="Search"
          className="pressable grid size-7 place-items-center rounded-md text-faint hover:bg-sidebar-accent hover:text-foreground"
        >
          <Search className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      {inEvent && event ? (
        <>
          <EventSwitcher />
          <nav className="flex flex-col gap-0.5">
            {eventNav.map((item) => (
              <NavItem key={item.label} item={item} group="event" onNavigate={onNavigate} />
            ))}
          </nav>
        </>
      ) : (
        <>
          <nav className="flex flex-col gap-0.5">
            <NavItem item={{ to: '/', label: 'Home', icon: Home, end: true }} group="home" onNavigate={onNavigate} />
            <button
              onClick={() => openNewEvent(true)}
              className="pressable flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <Plus className="size-4 text-faint" strokeWidth={1.75} />
              New event
            </button>
          </nav>
          <div className="flex min-h-0 flex-col gap-1">
            <p className="px-2.5 text-[11.5px] font-medium text-faint">Events</p>
            <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto scrollbar-none">
              {(events ?? []).map((e) => (
                <NavLink
                  key={e.id}
                  to={`/events/${e.slug}`}
                  onClick={onNavigate}
                  className="pressable flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                >
                  <EventMark name={e.name} small />
                  <span className="flex-1 truncate">{e.name}</span>
                  {e.status === 'published' && <span className="size-1.5 rounded-full bg-info" aria-label="Live" />}
                </NavLink>
              ))}
              {events?.length === 0 && <p className="px-2.5 text-[12.5px] text-faint">No events yet</p>}
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 px-1">
        <button
          onClick={() => openCommand(true)}
          className="flex items-center gap-1.5 rounded-md text-[12px] text-faint hover:text-muted-foreground"
        >
          <Kbd>{MOD}</Kbd>
          <Kbd>K</Kbd>
          <span className="ml-0.5">Jump to</span>
        </button>
        <ThemeSwitch />
      </div>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-5', className)} aria-hidden>
      <rect x="1" y="1" width="18" height="18" rx="5.5" className="fill-foreground" />
      <circle cx="10" cy="10" r="3.2" className="fill-background" />
      <circle cx="10" cy="4.6" r="1.1" className="fill-background" opacity="0.7" />
      <circle cx="10" cy="15.4" r="1.1" className="fill-background" opacity="0.7" />
      <circle cx="4.6" cy="10" r="1.1" className="fill-background" opacity="0.7" />
      <circle cx="15.4" cy="10" r="1.1" className="fill-background" opacity="0.7" />
    </svg>
  );
}
