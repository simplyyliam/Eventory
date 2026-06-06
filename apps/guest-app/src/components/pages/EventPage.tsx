import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { EventResponse } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';

export const EventPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/events/${slug}`)
      .then((res) => setEvent(res.data));
  }, [slug]);

  function findSeat() {
    if (!event) return;

    const guest = event.guests.find(
      (g) => g.name.toLowerCase() === name.toLowerCase(),
    );

    if (!guest) {
      alert('Guest not found');
      return;
    }

    if (!guest.tableId) {
      alert(`No seat assigned to ${guest.name}`);
      return;
    }

    const table = event.tables.find((t) => t.id === guest.tableId);
    alert(`You are at ${table?.name}, seat ${guest.seat}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{event?.name}</h1>
      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={findSeat}>Find My Seat</button>
    </div>
  );
};