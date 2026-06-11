import { GuestListContainer } from '@/components';
import { Input } from '@app/shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { GuestCard } from '@/features/guests-list';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { EventResponse } from '@app/shared/types/event.types';
import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';
import { ListFilter } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

// This handles the window-level viewport fadeout natively
const ScrollFadeItem = ({ children, isLast }: { children: React.ReactNode; isLast: boolean }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  // If it's the last item, make it snap to fully visible instantly at 0.01 
  // Otherwise, use your gorgeous 0.12 fade/blur transition for everyone else!
  const startThreshold = isLast ? 0.01 : 0.12;

  const opacity = useTransform(scrollYProgress, [0, startThreshold, 0.88, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, startThreshold, 0.88, 1], [0.97, 1, 1, 0.96]);
  const filter = useTransform(
    scrollYProgress, 
    [0, startThreshold, 0.88, 1], 
    ['blur(4px)', 'blur(0px)', 'blur(0px)', 'blur(4px)']
  );

  return (
    <motion.div ref={itemRef} style={{ opacity, scale, filter }}>
      {children}
    </motion.div>
  );
};

export const GuestListPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/events/${slug}`)
      .then((res) => {
        setEvent(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const filteredGuests = event?.guests.filter((guest) => {
    const name = guest.name.toLowerCase();
    const qry = query.toLowerCase();
    return name.startsWith(qry);
  });

  // Your original pristine cascade rules unchanged
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 0.1, 
        staggerChildren: 0.06, 
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
    exit: { 
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

      {!isLoading && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          // Added 'pb-28' to give the last item plenty of room to breathe and animate completely
          className="flex flex-col gap-2.5 w-full h-full pb-28" 
        >
          <AnimatePresence mode="popLayout">
            {filteredGuests?.map((guest, index) => {
              const isLastItem = index === (filteredGuests.length - 1)
              return (
              <motion.div 
                key={guest.id} 
                variants={item}
                layout 
              >
                <ScrollFadeItem isLast={isLastItem}>
                  <GuestCard
                    name={guest.name}
                    onClick={() => {
                      setTimeout(() => {
                        navigate(`/events/${slug}/guests/${guest.id}`);
                      }, 300); 
                    }}
                  />
                </ScrollFadeItem>
              </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </GuestListContainer>
  );
};