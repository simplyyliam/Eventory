import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';
import { fromPlanTable } from '@/domain/normalize';
import type { EventMetadata, EventStatus, EventSummary, Guest, PlanTable } from '@/domain/types';

const http = axios.create({ baseURL: API_BASE_URL });

export const api = {
  listEvents: () => http.get<EventSummary[]>('/internal/events').then((r) => r.data),

  getEvent: (slug: string) => http.get<EventSummary>(`/internal/events/${slug}`).then((r) => r.data),

  createEvent: (name: string) => http.post<EventSummary>('/events/create', { name }).then((r) => r.data),

  // Renaming changes the slug on the server, so callers must follow the new one.
  updateEvent: (slug: string, data: { name?: string; status?: EventStatus; metadata?: EventMetadata }) =>
    http.patch<EventSummary>(`/events/${slug}`, data).then((r) => r.data),

  deleteEvent: (slug: string) => http.delete(`/events/${slug}`),

  saveWorkspace: (
    slug: string,
    data: { name: string; metadata: EventMetadata; tables: PlanTable[]; guests: Guest[] },
  ) =>
    http.patch(`/internal/events/${slug}`, {
      name: data.name,
      metadata: data.metadata,
      tables: data.tables.map(fromPlanTable),
      guests: data.guests,
    }),
};

export const GUEST_APP_URL = (import.meta.env.VITE_GUEST_APP_URL as string | undefined) ?? 'https://eventory-guest-app.vercel.app';

export const guestPageUrl = (slug: string) => `${GUEST_APP_URL}/events/${slug}`;
