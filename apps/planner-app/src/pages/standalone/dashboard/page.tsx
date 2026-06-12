import { IconButton, PageContainer } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import { API_BASE_URL } from '@app/shared/utils/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventLink } from './EventLink';
import { Plus } from '@hugeicons/core-free-icons';
import { CreateEventDialog } from './CreateEventDialog';

export const entry = true;

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const events = useEventStore((s) => s.events)
  const setEvents = useEventStore((s) => s.setEvents)
  const navigate = useNavigate();
  const createEvent = useEventStore((s) => s.createEvent);

  const handleCreateEvent = async (name: string): Promise<void> => {
    try {
      const event = await createEvent(name);

      setOpen(false);

      navigate('/loading', {
        state: {
          destination: `/venue/${event.slug}`,
          eventName: event.name,
        },
      });
    } catch (err) {
      console.error('Failed to create event', err);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/internal/events`)
      .then((res) => setEvents(res.data))
      .catch((err) =>
        console.error('Failed to retrieve events:', err),
      );
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
            onClick={() => setOpen(true)}
          />
        </div>

        <div className="flex flex-col gap-2">
          {events && events.length > 0 ? (
            events.map((event) => (
              <EventLink key={event.id} event={event} />
            ))
          ) : (
            <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No events yet
            </div>
          )}
        </div>
      </div>

      <CreateEventDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleCreateEvent}
      />
    </PageContainer>
  );
}