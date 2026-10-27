import { format, parseISO } from 'date-fns';
import { useWorkspace } from '@/store/workspace';
import { daysUntil } from '@/domain/stats';
import { SaveIndicator } from '@/components/SaveIndicator';
import { EventStatusPill, Pill } from '@/components/StatusPill';
import { whenLabel } from '@/features/dashboard/summaries';

export function EventMeta() {
  const details = useWorkspace((s) => s.details);
  const status = useWorkspace((s) => s.event?.status ?? 'draft');
  const days = daysUntil(details);
  const bits = [details.date ? format(parseISO(details.date), 'EEEE d MMMM yyyy') : null, details.startTime, details.venueName].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
      <EventStatusPill status={status} />
      {days !== null && days >= 0 && <Pill tone={days <= 14 ? 'warn' : 'neutral'} dot={false}>{whenLabel(days)}</Pill>}
      {bits.length > 0 ? <span>{bits.join(' · ')}</span> : <span className="text-faint">No date or venue yet</span>}
    </div>
  );
}

export function EventHeader({ title, actions }: { title?: string; actions?: React.ReactNode }) {
  const name = useWorkspace((s) => s.event?.name ?? '');
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="truncate text-[22px] font-semibold tracking-[-0.02em]">{title ?? name}</h1>
        <EventMeta />
      </div>
      <div className="flex items-center gap-2">
        <SaveIndicator />
        {actions}
      </div>
    </div>
  );
}
