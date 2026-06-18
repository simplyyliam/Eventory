import { GuestListContainer } from '@/components';
import { Button, Input, Skeleton } from '@app/shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { GuestCard } from '@/features/guests-list';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { EventResponse } from '@app/shared/types/event.types';
import { ListFilter, X } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { getPublicEventBySlug } from '@app/shared/utils/publicEvent';


// ─── Skeleton ─────────────────────────────────────────────────────────────────

const GuestCardSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-3.5 rounded-2xl">
    <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-muted-foreground/15" />
    <div className="flex flex-col gap-2 flex-1">
      <Skeleton className="h-3.5 w-3/4 bg-muted-foreground/15" />
      <Skeleton className="h-2.5 w-2/5 bg-muted-foreground/15" />
    </div>
    <Skeleton className="w-4 h-4 shrink-0 bg-muted-foreground/15" />
  </div>
);

const GuestListSkeleton = () => (
  <div className="flex flex-col gap-2.5 w-full">
    <div className="flex items-center justify-between h-12 px-2.5">
      <Skeleton className="h-4 w-36 bg-muted-foreground/15" />
      <Skeleton className="h-12 w-12 rounded-xl bg-muted-foreground/15" />
    </div>
    <div className="flex items-center justify-between px-2.5 py-3.5">
      <Skeleton className="h-3 w-20 bg-muted-foreground/15" />
      <Skeleton className="h-3 w-12 bg-muted-foreground/15" />
    </div>
    {Array.from({ length: 8 }).map((_, i) => (
      <GuestCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Scroll fade wrapper ──────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.06,
      ease: 'easeOut' as const,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)', scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      opacity: { duration: 0.2 },
      filter: { duration: 0.2 },
      y: { type: 'spring' as const, stiffness: 100, damping: 18 },
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

const ScrollFadeItem = ({ children }: { children: React.ReactNode; isLast: boolean }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { margin: '0px 0px -5% 0px' });

  return (
    <motion.div
      ref={itemRef}
      animate={{
        opacity: isInView ? 1 : 0,
        scale: isInView ? 1 : 0.97,
        filter: isInView ? 'blur(0px)' : 'blur(4px)',
      }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        filter: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const GuestListPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    getPublicEventBySlug(slug)
      .then((res) => {
        setEvent(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const filteredGuests = event?.guests
    .filter((guest) => guest.name.toLowerCase().startsWith(query.toLowerCase()))
    .sort((a, b) =>
      sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  if (isLoading) {
    return (
      <GuestListContainer className="font-dmSans">
        <GuestListSkeleton />
      </GuestListContainer>
    );
  }

  return (
    <GuestListContainer className="font-dmSans">
      <div className="flex items-center justify-between h-12">
        <AnimatePresence mode="popLayout">
          {!isSearchOpen && (
            <motion.span
              key="event-name"
              className="px-2.5 py-3.5 font-medium whitespace-nowrap"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {event?.name}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              key="search-input"
              className="flex-1 mx-2"
              style={{ originX: 1 }}
              initial={{ opacity: 0, scaleX: 0.85 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.85 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Input
                ref={inputRef}
                className="focus:outline-none h-12 p-3 border-none font-medium w-full"
                placeholder="Find yourself..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div
              key="close-btn"
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Button variant="outline" className="h-12 w-12 shrink-0" onClick={handleSearchClose}>
                <X size={20} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="search-btn"
              initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Button variant="outline" className="h-12 w-12 shrink-0" onClick={handleSearchOpen}>
                <HugeiconsIcon icon={Search01Icon} size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-[13px] gap-2 py-3.5 px-2.5">
        <span className="text-muted-foreground">{`Guest - ${event?.guests.length ?? 0}`}</span>
        <button
          onClick={() => setSortAZ((prev) => !prev)}
          className="flex items-center gap-1 text-muted-foreground"
        >
          <span className="text-[12px] font-medium">{sortAZ ? 'A–Z' : 'Z–A'}</span>
          <ListFilter size={20} />
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        layout="position"
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col gap-2.5 w-full h-full pb-28"
      >
        <AnimatePresence mode="popLayout">
          {filteredGuests?.map((guest, index) => {
            const isLastItem = index === filteredGuests.length - 1;
            return (
              <motion.div key={guest.id} variants={item}>
                <ScrollFadeItem key={`${guest.id}-${query}`} isLast={isLastItem}>
                  <GuestCard
                    name={guest.name}
                    onClick={() => {
                      setTimeout(() => {
                        navigate('/loading', {
                          state: {
                            destination: `/events/${slug}/guests/${guest.id}`,
                            slug,
                            guestId: guest.id,
                          },
                        });
                      });
                    }}
                  />
                </ScrollFadeItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </GuestListContainer>
  );
};