import { GuestListContainer } from '@/components';
import { Input } from '@app/shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { GuestCard } from '@/features/guests-list';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { EventResponse } from '@app/shared/types/event.types';
import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';
import { ListFilter } from 'lucide-react';

export const GuestListPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [query, setQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/events/${slug}`)
      .then((res) => setEvent(res.data));
  }, []);

  const filteredGuests = event?.guests.filter((guest) => {
    const name = guest.name.toLowerCase();
    const qry = query.toLowerCase();

    return name.startsWith(qry);
  });

  return (
    <GuestListContainer className="font-dmSans ">
      <span className="px-2.5 py-3.5 font-medium">{event?.name}</span>
      <div className="flex items-center gap-1.75 py-3.5 px-2.5">
        <HugeiconsIcon icon={Search01Icon} size={16}/>
        <Input
          className="focus:outline-none font-medium"
          placeholder="Search your name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between text-[13px] gap-2 py-3.5 px-2.5">
        <span className="text-muted-foreground">{`Guest - ${event?.guests.length}`}</span>
        <ListFilter size={20}/>
      </div>
      <div className="flex flex-col gap-2.5 w-full h-full">
        {filteredGuests?.map((guest) => {
          return (
            <GuestCard
              name={guest.name}
              onClick={() => navigate(`/events/${slug}/guests/${guest.id}`)}
            />
          );
        })}
      </div>
      <span className='text-xs text-center text-muted-foreground'>powered by eventory</span>
    </GuestListContainer>
  );
};
