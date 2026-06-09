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
import { motion, AnimatePresence } from 'motion/react'; // Added AnimatePresence for filter smoothness

export const GuestListPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 1. Added loading state

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/events/${slug}`)
      .then((res) => {
        setEvent(res.data);
        setIsLoading(false); // 2. Stop loading when data arrives
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const filteredGuests = event?.guests.filter((guest) => {
    const name = guest.name.toLowerCase();
    const qry = query.toLowerCase();
    return name.startsWith(qry);
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 0.1, // Slightly reduced since we already waited for fetch
        staggerChildren: 0.06, // Snappy but noticeable stagger
        ease: "easeOut" as const,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
      scale: 0.98,
    },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.2 },
        y: {
          type: 'spring' as const,
          stiffness: 100,
          damping: 18,
        },
      },
    },
    exit: { // Added an exit state for when users filter names out
      opacity: 0,
      y: -20,
      filter: 'blur(4px)',
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" as const }
    }
  };

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
        <span className="text-muted-foreground">{`Guest - ${event?.guests.length ?? 0}`}</span>
        <ListFilter size={20}/>
      </div>

      {/* 3. Only animate the block once loading is complete */}
      {!isLoading && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2.5 w-full h-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredGuests?.map((guest) => (
              <motion.div 
                key={guest.id} 
                variants={item}
                layout // Smoothly slide items up/down when others are filtered out
              >
                <GuestCard
                  name={guest.name}
                  onClick={() => {
                    setTimeout(() => {
                      navigate(`/events/${slug}/guests/${guest.id}`);
                    }, 300); 
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
    </GuestListContainer>
  );
};