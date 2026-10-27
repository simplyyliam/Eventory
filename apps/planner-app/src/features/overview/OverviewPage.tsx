import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Info, LayoutGrid, TriangleAlert, Utensils } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { attentionItems, daysUntil, eventStats, seatingProgress, type Attention } from '@/domain/stats';
import { capacity } from '@/domain/geometry';
import { guestsAt } from '@/domain/seating';
import { Card, Page, Section } from '@/components/layout';
import { RollingNumber } from '@/components/RollingNumber';
import { ProgressBar, ProgressRing } from '@/components/ProgressRing';
import { CopyButton } from '@/components/CopyButton';
import { EventHeader } from '@/features/event/EventHeader';
import { Checklist } from './Checklist';

function Stat({ label, value, sub, children, to }: { label: string; value: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode; to?: string }) {
  const body = (
    <>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-[24px] leading-8 font-semibold tracking-[-0.02em]">{value}</span>
      {children}
      {sub && <span className="text-[12px] text-muted-foreground">{sub}</span>}
    </>
  );
  const cls = 'flex flex-col gap-1.5 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--hairline),0_1px_2px_rgb(0_0_0/0.03)]';
  return to ? (
    <Link to={to} className={cn(cls, 'pressable transition-shadow hover:shadow-[0_0_0_1px_var(--hairline),0_4px_12px_-4px_rgb(0_0_0/0.1)]')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const toneIcon: Record<Attention['tone'], React.ReactNode> = {
  bad: <TriangleAlert className="size-4 text-bad" strokeWidth={1.75} />,
  warn: <span className="grid size-4 place-items-center"><span className="size-2 rounded-full bg-warn" /></span>,
  info: <Info className="size-4 text-faint" strokeWidth={1.75} />,
};

function AttentionList({ items, base }: { items: Attention[]; base: string }) {
  if (items.length === 0) {
    return (
      <Card className="flex items-center gap-3 px-4 py-3.5 text-[13px] text-muted-foreground">
        <span className="size-2 rounded-full bg-ok" />
        Everything’s on track.
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      {items.map((a) => (
        <Link
          key={a.id}
          to={`${base}/${a.to}`}
          className="group flex items-center gap-3 border-b border-hairline px-4 py-3 transition-colors last:border-b-0 hover:bg-canvas/60"
        >
          {toneIcon[a.tone]}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[13px] font-medium">{a.title}</span>
            <span className="truncate text-[12px] text-muted-foreground">{a.detail}</span>
          </div>
          <ChevronRight className="size-4 text-faint transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ))}
    </Card>
  );
}

export function OverviewPage() {
  const event = useWorkspace((s) => s.event)!;
  const tables = useWorkspace((s) => s.tables);
  const guests = useWorkspace((s) => s.guests);
  const details = useWorkspace((s) => s.details);
  const base = `/events/${event.slug}`;

  const stats = useMemo(() => eventStats(tables, guests), [tables, guests]);
  const attention = attentionItems(details, stats, event.status === 'published');
  const progress = seatingProgress(stats);
  const attending = stats.guests - stats.declined;
  const days = daysUntil(details);
  const seatingTables = tables.filter((t) => t.shape !== 'row').sort((a, b) => a.tableNumber - b.tableNumber);

  const dietaryText = stats.dietary.map((d) => `${d.label}: ${d.count}`).join('\n');

  return (
    <Page wide>
      <EventHeader
        actions={
          <Button nativeButton={false} render={<Link to={`${base}/floor-plan`} />}>
            <LayoutGrid className="size-4" />
            Floor plan
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Attending" value={<RollingNumber value={attending} />} to={`${base}/guests`}>
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-subtle">
            {stats.guests > 0 && (
              <>
                <span className="h-full bg-ok transition-[width] duration-500" style={{ width: `${(stats.confirmed / stats.guests) * 100}%` }} />
                <span className="h-full bg-warn transition-[width] duration-500" style={{ width: `${(stats.pending / stats.guests) * 100}%` }} />
                <span className="h-full bg-bad/70 transition-[width] duration-500" style={{ width: `${(stats.declined / stats.guests) * 100}%` }} />
              </>
            )}
          </div>
          <span className="flex gap-3 text-[12px] text-muted-foreground tabular">
            <span>{stats.confirmed} yes</span>
            <span>{stats.pending} pending</span>
            <span>{stats.declined} no</span>
          </span>
        </Stat>

        <Stat
          label="Seated"
          value={
            <span className="flex items-center gap-2">
              <RollingNumber value={stats.seated} />
              <span className="text-[15px] font-normal text-faint tabular">/ {attending}</span>
            </span>
          }
          to={`${base}/floor-plan`}
        >
          <ProgressBar value={progress} tone={progress >= 1 ? 'bg-ok' : 'bg-foreground'} />
          <span className="text-[12px] text-muted-foreground">{stats.unseated > 0 ? `${stats.unseated} still to place` : attending > 0 ? 'Everyone has a seat' : 'No guests yet'}</span>
        </Stat>

        <Stat
          label="Seats"
          value={<RollingNumber value={stats.seats} />}
          sub={
            stats.seats >= attending
              ? `${stats.seats - attending} spare across ${stats.tables} ${stats.tables === 1 ? 'table' : 'tables'}`
              : `${attending - stats.seats} short of what’s needed`
          }
          to={`${base}/floor-plan`}
        />

        <Stat
          label={days !== null && days < 0 ? 'Days since' : 'Days to go'}
          value={days === null ? <span className="text-faint">—</span> : <RollingNumber value={Math.abs(days)} />}
          sub={days === null ? <Link to={`${base}/settings`} className="underline underline-offset-2 hover:text-foreground">Set a date</Link> : days === 0 ? 'It’s today' : undefined}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-8">
          <Section title="Needs attention">
            <AttentionList items={attention} base={base} />
          </Section>

          <Section
            title="Tables"
            action={
              seatingTables.length > 0 && (
                <Link to={`${base}/floor-plan`} className="flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground">
                  Open floor plan <ArrowRight className="size-3.5" />
                </Link>
              )
            }
          >
            {seatingTables.length === 0 ? (
              <Card className="px-4 py-3.5 text-[13px] text-muted-foreground">No tables placed yet.</Card>
            ) : (
              <Card className="overflow-hidden">
                {seatingTables.slice(0, 8).map((t) => {
                  const seated = guestsAt(t.id, guests).length;
                  const cap = capacity(t);
                  return (
                    <div key={t.id} className="flex items-center gap-3 border-b border-hairline px-4 py-2.5 last:border-b-0">
                      <ProgressRing value={cap ? seated / cap : 0} className={seated >= cap ? 'text-ok' : 'text-foreground'} />
                      <span className="flex-1 truncate text-[13px]">{t.name}</span>
                      <span className="text-[12.5px] text-muted-foreground tabular">
                        {seated}/{cap}
                      </span>
                    </div>
                  );
                })}
                {seatingTables.length > 8 && (
                  <Link to={`${base}/floor-plan`} className="block px-4 py-2.5 text-[12.5px] text-muted-foreground hover:text-foreground">
                    {seatingTables.length - 8} more tables
                  </Link>
                )}
              </Card>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-8">
          <Section title="Checklist">
            <Checklist />
          </Section>

          <Section
            title="Dietary requirements"
            action={
              stats.dietary.length > 0 && (
                <Tooltip>
                  <TooltipTrigger render={<span />}>
                    <CopyButton value={dietaryText} label="Copy for caterer" variant="ghost" />
                  </TooltipTrigger>
                  <TooltipContent>Copies a plain-text count per requirement</TooltipContent>
                </Tooltip>
              )
            }
          >
            {stats.dietary.length === 0 ? (
              <Card className="flex items-center gap-3 px-4 py-3.5 text-[13px] text-muted-foreground">
                <Utensils className="size-4 text-faint" strokeWidth={1.75} />
                No requirements recorded yet.
              </Card>
            ) : (
              <Card className="flex flex-wrap gap-1.5 p-3">
                {stats.dietary.map((d) => (
                  <span key={d.label} className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-hairline bg-surface px-2.5 text-[12.5px]">
                    {d.label}
                    <span className="tabular text-muted-foreground">{d.count}</span>
                  </span>
                ))}
              </Card>
            )}
          </Section>
        </div>
      </div>
    </Page>
  );
}
