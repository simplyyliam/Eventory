import { GuestListContainer } from '@/components';
import { MessageCard, TicketCard } from '@/features/guests-details';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export const GuestDetailsScreen = () => {
  const location = useLocation();
  const guest = location.state?.guest;
  const event = location.state?.event;
  
  if (!guest) return null;
  if(!event) return null
  console.log("EVENT:", event)
  const seatNumber = guest?.seat?.split('-').pop();

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
      type: 'spring' as const,
      stiffness: 110,
      damping: 18,
    },
  },
};


const container = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    },
  },
};

  return (
    <GuestListContainer className="items-center justify-center mesh-gradient font-dmSans">
      <motion.div
        className="flex flex-col gap-2.5 items-center justify-between w-full h-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="w-full h-full" variants={item}>
          <TicketCard
            eventName={event.name ?? 'No Event'}
            guestName={guest.name}
            seatNumber={seatNumber ?? '0'}
            tableNumber={guest.table?.tableNumber ?? 0}
          />
        </motion.div>

        <motion.div className="w-full h-full" variants={item}>
          <MessageCard />
        </motion.div>
      </motion.div>
    </GuestListContainer>
  );
};