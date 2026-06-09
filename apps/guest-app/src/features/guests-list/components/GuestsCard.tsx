import { ArrowRight } from 'lucide-react';
import { GuestAvatar } from './GuestAvatar';
import { motion } from 'motion/react';

interface GuestCardProps {
  name: string;
  onClick: () => void;
}

export const GuestCard = ({ name, onClick }: GuestCardProps) => {
  return (
    <motion.button
    whileTap={{scale: 0.97, y: 1, backgroundColor: "#E7E7E7"}}
    transition={{type: "spring", stiffness: 200, damping: 25 }}
      onClick={onClick}
      className="flex items-center justify-between w-full px-2.5 py-3.5 font-dmSans rounded-[10px]"
    >
      <div className="flex items-center gap-2.5">
        <GuestAvatar />
        <span className="text-muted-foreground text-sm">{name}</span>
      </div>
      <ArrowRight size={20}/>
    </motion.button>
  );
};
