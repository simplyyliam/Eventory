import { IconButton, PageContainer } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@app/shared/components/ui/dropdown-menu';
import { Button } from "@app/shared/components/ui/button"
import type { EventResponse } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';
import { MoreHorizontalIcon, Plus } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditableName, type EditableNameHandle } from '@app/shared/components/custom/EditableName';
import { EventLink } from './EventLink';

export const entry = true;

export default function DashboardPage() {
  const [events, setEvent] = useState<EventResponse[]>([]);
  const navigate = useNavigate();
  const createEvent = useEventStore((s) => s.createEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent)
  const renameEvent = useEventStore((s) => s.renameEvent)

  const nameRef = useRef<EditableNameHandle>(null)

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
              <EventLink key={event.id} event={event}/>
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
