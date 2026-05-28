import { GuestCard, IconButton } from '@/shared/components';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ArrowDown01Icon, ArrowUpDown } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { useGuest } from '@/hooks/useGuests';

export const UnseatedGuestsSection = () => {
  const [isUnseatedOpen, setIsUnseatedOpen] = useState(true);
  const guests = useGuestStore((state) => state.guests);
  const seatedGuests = useGuestStore((state) => state.seatedGuests);
  const { UnseatedGuestAmount } = useGuest();

  const unseatedGuest = guests.filter(
    (guest) => !seatedGuests.some((seat) => seat.guestId === guest.id),
  );

  return (
    <SidebarGroup>
      <div className="flex items-center gap-2 px-2">
        <SidebarGroupLabel className="h-10 flex-1 px-0">
          Unseated Guests
        </SidebarGroupLabel>
        <IconButton Icon={ArrowUpDown} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-expanded={isUnseatedOpen}
          aria-label="Toggle unseated guests"
          onClick={() => setIsUnseatedOpen((open) => !open)}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              'transition-transform duration-200',
              isUnseatedOpen && 'rotate-180',
            )}
          />
        </Button>
        <IconButton Label={UnseatedGuestAmount} />
      </div>
      {isUnseatedOpen && (
        <SidebarGroupContent className="px-2">
          {unseatedGuest.map((guest) => {
            const initials = guest.Name.split(' ')
              .map((part) => part[0])
              .join('');
            return (
              <GuestCard
                key={guest.id}
                name={guest.Name}
                initials={initials}
              />
            );
          })}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};
