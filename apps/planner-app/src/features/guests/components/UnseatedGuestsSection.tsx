import { GuestCard, IconButton } from '@/shared/components';
import { cn } from '@app/shared/lib/utils';
import { ArrowDown01Icon, ArrowUpDown } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { useGuest } from '@/hooks/useGuests';
import { getInitials } from '@/lib/getInitials';
import { Button, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@app/shared';
import { useSelectionStore } from '@/store/useSelectionStore';

export const UnseatedGuestsSection = () => {
  const [isUnseatedOpen, setIsUnseatedOpen] = useState(true);
  const guests = useGuestStore((s) => s.guests);
  const { UnseatedGuestAmount } = useGuest();
  const unseatedGuests = guests.filter((g) => !g.tableId);

    useEffect(() => {
      const stopDrag = () => {
        useSelectionStore.getState().stopDrag();
      };
  
      window.addEventListener('pointerup', stopDrag);
  
      return () => {
        window.removeEventListener('pointerup', stopDrag);
      };
    }, []);


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
        <SidebarGroupContent className="flex flex-col mt-1.5 px-2 gap-2.5">
          {unseatedGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              name={guest.name ?? ''}
              initials={getInitials(guest.name ?? '')}
              guestId={guest.id}
            />
          ))}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};