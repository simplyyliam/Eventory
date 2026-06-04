import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { EventResponse } from '@/types/event.types';
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

    // Finding the guest =
    const guest = event.guests.find(
      (guest) => guest.Name.toLowerCase() === name.toLowerCase(),
    );

    if (!guest) {
      alert('Guest not found');
      return;
    }

    // Find the guests seat
    const seat = event.seatedGuests.find((seat) => seat.guestId=== guest.id);

    if (!seat) {
      alert(`No seat assigned to ${guest.Name}`);
      return;
    }

    // Find the guests table
    const table = event.tables.find((table) => table.id === seat.tableId);

    alert(`You are at ${table?.name}, seat ${seat.seatId}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{event?.event?.name}</h1>

      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={findSeat}>Find My Seat</button>
    </div>
  );
};
