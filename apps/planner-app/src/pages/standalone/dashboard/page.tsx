import { IconButton, PageContainer } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import type { EventResponse } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';
import { Plus } from '@hugeicons/core-free-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const entry = true;

export default function DashboardPage() {
  const [events, setEvent] = useState<EventResponse[]>([]);
  const navigate = useNavigate();
  const createEvent = useEventStore((s) => s.createEvent);

  const handleCreateEvent = () => {
    const name = window.prompt('Event name')?.trim() || 'Untitled Event';
    const event = createEvent(name);

    navigate(`/venue/${event.id}`);
  };

useEffect(() => {
  console.log('API_BASE_URL:', API_BASE_URL)
  axios
    .get(`${API_BASE_URL}/events`)
    .then((res) => {
      console.log('Events response:', res.data)
      setEvent(res.data)
    })
    .catch((err) => {
      console.error('Failed to retrieve events:', err);
    });
}, []);

  return (
    <PageContainer className="items-center justify-center min-h-screen">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-2xl">Eventory</span>
            <p className="text-sm">Manage your event experience</p>
          </div>
          <IconButton
            Icon={Plus}
            Label="Create Event"
            onClick={handleCreateEvent}
          />
        </div>

        <div className="flex flex-col gap-2">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Link
                key={event.id}
                to={`/venue/${event.slug}`}
                className="flex items-center justify-between rounded-md border bg-background px-4 py-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-medium">{event.name}</span>
                <span className="text-muted-foreground">{event.status}</span>
              </Link>
            ))
          ) : (
            <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No events yet
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
