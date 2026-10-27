import { cn } from '@app/shared';
import type { EventStatus, RsvpStatus } from '@/domain/types';

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-subtle text-muted-foreground',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-[color-mix(in_oklch,var(--warn)_80%,black)] dark:text-warn',
  bad: 'bg-bad-soft text-bad',
  info: 'bg-info-soft text-info',
};

const dots: Record<Tone, string> = {
  neutral: 'bg-faint',
  ok: 'bg-ok',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
};

export function Pill({ tone = 'neutral', children, className, dot = true }: { tone?: Tone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex h-5 items-center gap-1 rounded-[4px] px-1.5 text-[11.5px] font-medium whitespace-nowrap', tones[tone], className)}>
      {dot && <span className={cn('size-[5px] rounded-full', dots[tone])} />}
      {children}
    </span>
  );
}

export const rsvpTone: Record<RsvpStatus, Tone> = { confirmed: 'ok', pending: 'warn', declined: 'bad' };
export const rsvpLabel: Record<RsvpStatus, string> = { confirmed: 'Attending', pending: 'Awaiting reply', declined: 'Declined' };

export const RsvpPill = ({ status }: { status: RsvpStatus }) => <Pill tone={rsvpTone[status]}>{rsvpLabel[status]}</Pill>;

const eventTone: Record<EventStatus, Tone> = { draft: 'neutral', published: 'info', archived: 'neutral' };
const eventLabel: Record<EventStatus, string> = { draft: 'Draft', published: 'Live', archived: 'Archived' };

export const EventStatusPill = ({ status }: { status: EventStatus }) => <Pill tone={eventTone[status]}>{eventLabel[status]}</Pill>;
