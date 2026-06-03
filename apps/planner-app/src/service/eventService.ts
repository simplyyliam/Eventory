// Event service

import { useEventStore } from '@/store/useEventStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import axios from 'axios';

export async function loadEvent(slug: string) {
  try {
    const { data: event } = await axios.get(
      `http://localhost:3001/events/${slug}`,
    );

    // Clear previous state
    useEventStore.getState().reset();
    useGuestStore.setState({ guests: [], seatedGuests: [] });
    useTableStore.setState({ tables: [] });

    // Giving the event an identity
    useEventStore.getState().setActiveEvent(event);

    // Load guests into the store
    useGuestStore.setState({
      guests: event.guests ?? [],
      seatedGuests: event.seatedGuests ?? [],
    });

    // Load tables into the store
    useTableStore.setState({
      tables: event.tables ?? [],
    });

    return event;
  } catch (error) {
    console.error('Failed to load event', error);
    throw error;
  }
}
