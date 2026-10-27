import { NavLink, useMatch, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Box,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  LayoutGrid,
  List,
  Monitor,
  Moon,
  PanelLeft,
  Plus,
  QrCode,
  Search,
  Settings2,
  Sun,
  Users,
} from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useEvents } from '@/lib/queries';
import { useTheme, type Theme } from '@/lib/theme';
import { useWorkspace } from '@/store/workspace';
import { eventStats } from '@/domain/stats';
import { Kbd, MOD } from '@/components/layout';
import { useCommandMenu } from './CommandMenu';
import { useShell } from './shellStore';
import { useNewEventDialog } from '@/features/dashboard/NewEventDialog';

type Item = { to: string; label: string; icon: React.ElementType; end?: boolean; badge?: number };

function NavItem({ item, onNavigate }: { item: Item; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30',
          isActive && 'bg-sidebar-accent font-medium text-foreground hover:bg-sidebar-accent',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('size-4 shrink-0', isActive ? 'text-foreground' : 'text-faint group-hover:text-muted-foreground')} strokeWidth={1.75} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="min-w-4.5 rounded-[4px] bg-bad px-1 text-center text-[10.5px] leading-4 font-semibold text-white tabular">{item.badge}</span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

const MARK_COLORS = ['#e5484d', '#f76b15', '#ffc53d', '#30a46c', '#12a594', '#0090ff', '#6e56cf', '#d6409f'];

// Flat monogram: one solid colour, no gradient or bevel.
export function EventMark({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const color = MARK_COLORS[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % MARK_COLORS.length];
  return (
    <span
      className={cn('grid shrink-0 place-items-center font-semibold text-white', size === 'sm' ? 'size-4 rounded-[4px] text-[9px]' : 'size-5 rounded-[5px] text-[10.5px]')}
      style={{ background: color }}
    >
      {name.trim().charAt(0).toUpperCase() || 'E'}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('grid size-5 shrink-0 place-items-center rounded-[5px] bg-foreground', className)}>
      <span className="size-2 rounded-full bg-background" />
    </span>
  );
}

function Switcher() {
  const navigate = useNavigate();
  const inEvent = useMatch('/events/:slug/*');
  const event = useWorkspace((s) => s.event);
  const { data: events } = useEvents();
  const openNew = useNewEventDialog((s) => s.setOpen);
  const current = inEvent && event ? event : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-sidebar-accent/60 aria-expanded:bg-sidebar-accent" />}
      >
        {current ? <EventMark name={current.name} /> : <LogoMark />}
        <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em]">{current ? current.name : 'All events'}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-faint" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Events</DropdownMenuLabel>
          {(events ?? []).slice(0, 10).map((e) => (
            <DropdownMenuItem key={e.id} onClick={() => navigate(`/events/${e.slug}`)}>
              <EventMark name={e.name} size="sm" />
              <span className="flex-1 truncate">{e.name}</span>
              {current?.id === e.id && <Check className="size-3.5 text-muted-foreground" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/')}>
          <List className="size-3.5" />
          All events
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openNew(true)}>
          <Plus className="size-3.5" />
          New event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <div className="flex items-center gap-0.5 rounded-md border border-hairline p-0.5" role="radiogroup" aria-label="Theme">
      {themes.map((t) => (
        <button
          key={t.value}
          role="radio"
          aria-checked={theme === t.value}
          aria-label={t.label}
          onClick={() => setTheme(t.value)}
          className="relative grid size-5.5 place-items-center rounded-[4px] text-faint hover:text-foreground aria-checked:text-foreground"
        >
          {theme === t.value && <motion.span layoutId="theme-pill" className="absolute inset-0 rounded-[4px] bg-sidebar-accent" transition={{ type: 'spring', duration: 0.3, bounce: 0 }} />}
          <t.icon className="relative size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex h-7 items-center justify-between px-2">
      <span className="text-[12px] text-faint">{children}</span>
      {action}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const inEvent = useMatch('/events/:slug/*');
  const event = useWorkspace((s) => s.event);
  const unseated = useWorkspace((s) => (s.event ? eventStats(s.tables, s.guests).unseated : 0));
  const { data: events } = useEvents();
  const openCommand = useCommandMenu((s) => s.setOpen);
  const openNew = useNewEventDialog((s) => s.setOpen);
  const toggleCollapsed = useShell((s) => s.toggleCollapsed);
  const base = event ? `/events/${event.slug}` : '';
  const showEvent = inEvent && event;

  const eventNav: Item[] = [
    { to: base, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: `${base}/floor-plan`, label: 'Floor plan', icon: LayoutGrid, badge: unseated || undefined },
    { to: `${base}/guests`, label: 'Guests', icon: Users },
    { to: `${base}/view`, label: '3D view', icon: Box },
  ];
  const eventManage: Item[] = [
    { to: `${base}/share`, label: 'Share', icon: QrCode },
    { to: `${base}/settings`, label: 'Settings', icon: Settings2 },
  ];

  return (
    <div className="flex h-full w-full flex-col px-2.5 pt-2.5 pb-3">
      <div className="flex items-center gap-1">
        <Switcher />
        <Tooltip>
          <TooltipTrigger
            render={
              <button onClick={() => openCommand(true)} aria-label="Search" className="pressable grid size-7 shrink-0 place-items-center rounded-md text-faint hover:bg-sidebar-accent hover:text-foreground" />
            }
          >
            <Search className="size-4" strokeWidth={1.75} />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-1.5">
            Search <Kbd className="border-white/15 bg-white/10 text-background/80 shadow-none">{MOD} K</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <button onClick={toggleCollapsed} aria-label="Hide sidebar" className="pressable hidden size-7 shrink-0 place-items-center rounded-md text-faint hover:bg-sidebar-accent hover:text-foreground md:grid" />
            }
          >
            <PanelLeft className="size-4" strokeWidth={1.75} />
          </TooltipTrigger>
          <TooltipContent side="bottom">Hide sidebar</TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto scrollbar-none">
        {showEvent ? (
          <>
            <nav className="flex flex-col gap-px">
              {eventNav.map((item) => (
                <NavItem key={item.label} item={item} onNavigate={onNavigate} />
              ))}
            </nav>
            <div className="flex flex-col gap-px">
              <SectionLabel>Manage</SectionLabel>
              {eventManage.map((item) => (
                <NavItem key={item.label} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </>
        ) : (
          <nav className="flex flex-col gap-px">
            <NavItem item={{ to: '/', label: 'All events', icon: List, end: true }} onNavigate={onNavigate} />
            <button onClick={() => openNew(true)} className="flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground">
              <Plus className="size-4 text-faint" strokeWidth={1.75} />
              New event
            </button>
          </nav>
        )}

        <div className="flex flex-col gap-px">
          <SectionLabel>{showEvent ? 'Other events' : 'Events'}</SectionLabel>
          {(events ?? [])
            .filter((e) => !showEvent || e.id !== event.id)
            .slice(0, 12)
            .map((e) => (
              <NavLink
                key={e.id}
                to={`/events/${e.slug}`}
                onClick={onNavigate}
                className="flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
              >
                <EventMark name={e.name} size="sm" />
                <span className="flex-1 truncate">{e.name}</span>
                {e.status === 'published' && <span className="size-1.5 rounded-full bg-info" aria-label="Live" />}
              </NavLink>
            ))}
          {events?.length === 0 && <p className="px-2 text-[12.5px] text-faint">No events yet</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-1 pt-2">
        <button onClick={() => openCommand(true)} className="flex items-center gap-1 text-[12px] text-faint hover:text-muted-foreground">
          <Kbd>{MOD}</Kbd>
          <Kbd>K</Kbd>
          <span className="ml-1">Jump to</span>
        </button>
        <ThemeSwitch />
      </div>
    </div>
  );
}
