import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { CalendarDays, CalendarPlus, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { Skeleton } from '@app/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { useDeleteEvent, useEvents } from '@/lib/queries';
import { Card, EmptyState, Kbd, MOD, Page } from '@/components/layout';
import { EventStatusPill } from '@/components/StatusPill';
import { ProgressRing } from '@/components/ProgressRing';
import { EventMark } from '@/app/Sidebar';
import { useNewEventDialog } from './NewEventDialog';
import { DeleteEventDialog } from './DeleteEventDialog';
import { greeting, sortRows, toRows, whenLabel, type EventRow } from './summaries';

type Tab = 'upcoming' | 'past' | 'all';

function Summary({ rows }: { rows: EventRow[] }) {
  const upcoming = rows.filter((r) => !r.past);
  const next = upcoming.find((r) => r.days !== null);
  const needSeats = upcoming.reduce((n, r) => n + r.stats.unseated, 0);
  const pending = upcoming.reduce((n, r) => n + r.stats.pending, 0);
  const strong = 'font-medium text-foreground';

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{greeting()}.</h1>
      <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {upcoming.length === 0 ? (
          <>No events coming up. Create one to start building a seating plan.</>
        ) : (
          <>
            You have <span className={strong}>{upcoming.length} upcoming {upcoming.length === 1 ? 'event' : 'events'}</span>
            {next ? (
              <>
                {'. '}
                <Link to={`/events/${next.event.slug}`} className={cn(strong, 'underline decoration-hairline underline-offset-4 hover:decoration-foreground')}>
                  {next.event.name}
                </Link>{' '}
                is <span className={strong}>{whenLabel(next.days).toLowerCase()}</span>
              </>
            ) : null}
            {needSeats > 0 || pending > 0 ? (
              <>
                {', and '}
                {needSeats > 0 && (
                  <>
                    <span className={strong}>
                      {needSeats} {needSeats === 1 ? 'guest' : 'guests'}
                    </span>{' '}
                    still {needSeats === 1 ? 'needs' : 'need'} a seat
                  </>
                )}
                {needSeats > 0 && pending > 0 && ' while '}
                {pending > 0 && (
                  <>
                    <span className={strong}>{pending} RSVPs</span> are outstanding
                  </>
                )}
                .
              </>
            ) : (
              '. Everyone is seated.'
            )}
          </>
        )}
      </p>
    </div>
  );
}

function Tabs({ tab, setTab, counts }: { tab: Tab; setTab: (t: Tab) => void; counts: Record<Tab, number> }) {
  const items: { value: Tab; label: string }[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'all', label: 'All' },
  ];
  return (
    <div className="flex items-center gap-1" role="tablist">
      {items.map((i) => (
        <button
          key={i.value}
          role="tab"
          aria-selected={tab === i.value}
          onClick={() => setTab(i.value)}
          className="pressable relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-muted-foreground hover:text-foreground aria-selected:text-foreground"
        >
          {tab === i.value && (
            <motion.span layoutId="dash-tab" className="absolute inset-0 rounded-md bg-subtle" transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }} />
          )}
          <span className="relative">{i.label}</span>
          <span className="relative tabular text-[12px] text-faint">{counts[i.value]}</span>
        </button>
      ))}
    </div>
  );
}

function EventRowItem({ row, onDelete }: { row: EventRow; onDelete: () => void }) {
  const navigate = useNavigate();
  const { event, stats, progress, days } = row;
  const meta = event.metadata;
  const attending = stats.guests - stats.declined;
  const to = `/events/${event.slug}`;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      className="group relative grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline px-4 py-3 transition-colors last:border-b-0 hover:bg-canvas/60 md:grid-cols-[minmax(0,2.2fr)_1.1fr_0.9fr_1fr_auto]"
      onClick={() => navigate(to)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <EventMark name={event.name} />
        <div className="flex min-w-0 flex-col">
          <Link to={to} onClick={(e) => e.stopPropagation()} className="truncate text-[13.5px] font-medium outline-none focus-visible:underline">
            {event.name}
          </Link>
          <span className="truncate text-[12px] text-muted-foreground">
            {meta?.venueName || 'No venue yet'}
          </span>
        </div>
      </div>

      <div className="hidden flex-col md:flex">
        <span className="text-[13px] tabular">{meta?.date ? format(parseISO(meta.date), 'd MMM yyyy') : '—'}</span>
        <span className={cn('text-[12px]', days !== null && days >= 0 && days <= 14 ? 'text-warn' : 'text-muted-foreground')}>{whenLabel(days)}</span>
      </div>

      <div className="hidden items-center gap-1.5 text-[13px] tabular md:flex">
        <Users className="size-3.5 text-faint" strokeWidth={1.75} />
        {attending}
        {stats.pending > 0 && <span className="text-[12px] text-muted-foreground">· {stats.pending} pending</span>}
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <ProgressRing value={progress} className={progress >= 1 ? 'text-ok' : 'text-foreground'} />
        <span className="text-[13px] tabular">{attending === 0 ? '—' : `${Math.round(progress * 100)}% seated`}</span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <EventStatusPill status={event.status} />
        <span className="hidden w-16 text-right text-[12px] text-faint lg:inline">
          {formatDistanceToNowStrict(parseISO(event.updatedAt))}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  aria-label={`Actions for ${event.name}`}
                  className="pressable grid size-7 place-items-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100 aria-expanded:opacity-100"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(to)}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${to}/floor-plan`)}>Floor plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${to}/settings`)}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

function ListSkeleton() {
  return (
    <Card>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-b-0">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      ))}
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useEvents();
  const openNew = useNewEventDialog((s) => s.setOpen);
  const remove = useDeleteEvent();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [deleting, setDeleting] = useState<EventRow | null>(null);

  const rows = useMemo(() => sortRows(toRows(data ?? [])), [data]);
  const counts = { upcoming: rows.filter((r) => !r.past).length, past: rows.filter((r) => r.past).length, all: rows.length };
  const visible = rows.filter((r) => (tab === 'all' ? true : tab === 'past' ? r.past : !r.past));

  return (
    <Page wide>
      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
      ) : (
        <Summary rows={rows} />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Tabs tab={tab} setTab={setTab} counts={counts} />
          <Button onClick={() => openNew(true)}>
            <Plus className="size-4" />
            New event
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Card>
            <EmptyState
              icon={<CalendarDays className="size-4.5" />}
              title="Couldn’t load your events"
              description="The server didn’t respond. It may be waking up, which can take a few seconds."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<CalendarPlus className="size-4.5" />}
              title="Plan your first event"
              description="Add guests, lay out the room, and share a page where everyone can find their seat."
              action={
                <Button onClick={() => openNew(true)}>
                  <Plus className="size-4" />
                  New event
                </Button>
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_1.1fr_0.9fr_1fr_auto] gap-4 border-b border-hairline bg-canvas/50 px-4 py-2 text-[12px] text-muted-foreground md:grid">
              <span>Event</span>
              <span>Date</span>
              <span>Attending</span>
              <span>Seating</span>
              <span className="pr-9 text-right lg:pr-[6.5rem]">Status</span>
            </div>
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((row) => (
                <EventRowItem key={row.event.id} row={row} onDelete={() => setDeleting(row)} />
              ))}
            </AnimatePresence>
            {visible.length === 0 && (
              <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                {tab === 'past' ? 'No past events yet.' : 'Nothing upcoming. Events without a date show under All.'}
              </p>
            )}
          </Card>
        )}

        {rows.length > 0 && (
          <p className="flex items-center gap-1.5 self-end text-[12px] text-faint">
            Press <Kbd>{MOD}</Kbd>
            <Kbd>K</Kbd> to jump to any event
          </p>
        )}
      </div>

      <DeleteEventDialog
        event={deleting?.event ?? null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.event.slug);
          setDeleting(null);
        }}
      />
    </Page>
  );
}
