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
import { useTableStore } from '@/store/useTableStore';
import { useGuest } from '@/hooks/useGuests';
import { getInitials } from '@/lib/getInitials';

export const SeatedGuestsSection = () => {
  const [isUnseatedOpen, setIsUnseatedOpen] = useState(true);
  const seatedGuest = useGuestStore((s) => s.seatedGuests);
  const guests = useGuestStore((s) => s.guests);
  const tables = useTableStore((s) => s.tables);
  const { SeatedGuestAmount } = useGuest();

  return (
    <SidebarGroup>
      <div className="flex items-center gap-2 px-2">
        <SidebarGroupLabel className="h-10 flex-1 px-0">
          Seated Guests
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
        <IconButton Label={SeatedGuestAmount} />
      </div>
      {isUnseatedOpen && (
        <SidebarGroupContent className="px-2">
          {seatedGuest.map((seat) => {
            const guest = guests.find((guest) => guest.id === seat.guestId);
            const table = tables.find((t) => t.id === seat.tableId);
            const seatNumber = seat.seatId.split('-').pop();

            if (!guest) return null;


            return (
              <GuestCard
                key={seat.guestId}
                name={guest.Name}
                initials={getInitials(guest.Name)}
                table={table?.name}
                seat={seatNumber}
                guestId={guest.id}
                showSeatedActions
              />
            );
          })}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};

