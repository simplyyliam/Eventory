import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from './api';
import { useWorkspace } from '@/store/workspace';
import { flushSave } from '@/store/autosave';
import type { EventStatus, EventSummary } from '@/domain/types';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export const useEvents = () => useQuery({ queryKey: ['events'], queryFn: api.listEvents, staleTime: 30_000 });

// The open event is owned by the workspace store once loaded, so this never
// refetches behind the user's back.
export const useEventQuery = (slug: string) =>
  useQuery({ queryKey: ['event', slug], queryFn: () => api.getEvent(slug), staleTime: Infinity, gcTime: 0 });

export function useCreateEvent() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: api.createEvent,
    onSuccess: (event) => {
      queryClient.setQueryData<EventSummary[]>(['events'], (list) => [{ ...event, tables: [], guests: [] }, ...(list ?? [])]);
      navigate(`/events/${event.slug}`);
    },
    onError: () => toast.error('Couldn’t create the event', { description: 'An event with that name may already exist.' }),
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: (slug: string) => api.deleteEvent(slug),
    onMutate: (slug) => {
      const previous = queryClient.getQueryData<EventSummary[]>(['events']);
      queryClient.setQueryData<EventSummary[]>(['events'], (list) => list?.filter((e) => e.slug !== slug));
      return { previous };
    },
    onError: (_e, _slug, ctx) => {
      queryClient.setQueryData(['events'], ctx?.previous);
      toast.error('Couldn’t delete the event');
    },
  });
}

// Rename and status changes go through the event endpoint. A rename moves the
// event to a new slug, so the URL follows it.
export function useUpdateEventInfo() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ name, status }: { name?: string; status?: EventStatus }) => {
      await flushSave();
      const current = useWorkspace.getState().event;
      if (!current) throw new Error('No event open');
      return { before: current.slug, event: await api.updateEvent(current.slug, { name, status }) };
    },
    onSuccess: ({ before, event }) => {
      useWorkspace.getState().setEventInfo({ name: event.name, slug: event.slug, status: event.status });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      if (before !== event.slug) {
        const rest = window.location.pathname.split(`/events/${before}`)[1] ?? '';
        navigate(`/events/${event.slug}${rest}`, { replace: true });
      }
    },
    onError: () => toast.error('Couldn’t update the event', { description: 'That name may already be taken.' }),
  });
}
