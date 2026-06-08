import { ArrowRight } from 'lucide-react';
import { GuestAvatar } from './GuestAvatar';
import { Button } from '@app/shared';

interface GuestCardProps {
  name: string;
  onClick: () => void;
}

export const GuestCard = ({ name, onClick }: GuestCardProps) => {
  return (
    <Button
      onClick={onClick}
      variant="link"
      className="flex items-center justify-between p-2.5 font-dmSans"
    >
      <div className="flex items-center gap-2.5">
        <GuestAvatar />
        <span className="text-muted-foreground text-sm">{name}</span>
      </div>
      <ArrowRight />
    </Button>
  );
};
