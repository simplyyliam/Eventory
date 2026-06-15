import { withHistory } from '@/lib/withHistory';
import { GuestCard } from '@/shared/components';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import { getInitials } from '@/lib/getInitials';
import { Input } from '@app/shared';
import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react"

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  seatId: string;
};

// exact variant tokens from your page file
const containerVariants = {
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

const itemVariants = {
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

export const AssignSeatDialog = ({
  open,
  onOpenChange,
  tableId,
  seatId,
}: Props) => {
  const guests = useGuestStore((s) => s.guests);
  const seatGuest = useGuestStore((s) => s.seatGuest);
  const tables = useTableStore((s) => s.tables);
  const unseatedGuests = guests.filter((guest) => !guest.tableId);
  const table = tables.find((t) => t.id === tableId);
  const seatNumber = seatId.split('-').pop();

  const [query, setQuery] = useState('')

  const handleSeatGuest = (guestId: string) => {
    withHistory(() => seatGuest(guestId, tableId, seatId));
    onOpenChange(false);
  };

  const filteredGuest = unseatedGuests.filter((guest) => {
    const name = guest.name.toLowerCase()
    const qry = query.toLowerCase()
    return name.startsWith(qry)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
        }}
        className="w-full max-w-md flex flex-col max-h-[70vh] p-0 gap-0"
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-input shrink-0">
          <DialogTitle>Assign to seat</DialogTitle>
          <DialogDescription>
            {table && seatNumber ? `${table.name} · Seat ${seatNumber}` : 'Select a guest'}
          </DialogDescription>
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder='Search the guests name'
          />
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-3 py-3">
          {unseatedGuests.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {/* Changing the key on query update triggers a clean, buttery restagger */}
              <motion.div
                key={query}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-0.5"
              >
                {filteredGuest.map((guest) => (
                  <motion.div
                    key={guest.id}
                    variants={itemVariants}
                  >
                    <GuestCard
                      name={guest.name ?? ''}
                      initials={getInitials(guest.name ?? '')}
                      onClick={() => handleSeatGuest(guest.id)}
                      guestId={guest.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">No unseated guests</span>
            </div>
          )}
        </div>

        {unseatedGuests.length > 0 && (
          <div className="px-4 py-3 border-t border-input shrink-0">
            <span className="text-xs text-muted-foreground">
              {unseatedGuests.length} unseated {unseatedGuests.length === 1 ? 'guest' : 'guests'}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};