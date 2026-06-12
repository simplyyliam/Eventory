import { useEventStore } from '@/store/useEventStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { API_BASE_URL } from '@app/shared/utils/api';
import axios from 'axios';

export async function loadEvent(slug: string) {
  try {
    const { data: event } = await axios.get(
      `${API_BASE_URL}/internal/events/${slug}`
    );

    useEventStore.getState().reset();
    useEventStore.getState().setActiveEvent(event);

    useGuestStore.getState().setGuests(event.id, event.guests ?? []);

    useTableStore.getState().setTables(
      event.id,
      (event.tables ?? []).map((t: any) => ({
        ...t,
        x: t.x ?? 0,
        y: t.y ?? 0,
        rotation: t.rotation ?? 0,
        textureId: t.textureId ?? 'white-oak',
      }))
    );

    return event;
  } catch (error) {
    console.error('Failed to load event', error);
    throw error;
  }
}