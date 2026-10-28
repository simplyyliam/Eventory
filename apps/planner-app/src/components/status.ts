import type { RsvpStatus } from '@/domain/types';
import type { Tone } from './StatusPill';

export const rsvpTone: Record<RsvpStatus, Tone> = { confirmed: 'ok', pending: 'warn', declined: 'bad' };
export const rsvpLabel: Record<RsvpStatus, string> = { confirmed: 'Attending', pending: 'Awaiting reply', declined: 'Declined' };
