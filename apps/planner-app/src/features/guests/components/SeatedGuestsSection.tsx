import { GuestCard, IconButton } from '@/shared/components';
import { cn } from '@app/shared/lib/utils';
import { ArrowDown01Icon, ArrowUpDown } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { useGuest } from '@/hooks/useGuests';
import { getInitials } from '@/lib/getInitials';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, Button } from '@app/shared';
import { useSelectionStore } from '@/store/useSelectionStore';

export const SeatedGuestsSection = () => {
  const [isSeatedOpen, setIsSeatedOpen] = useState(true);
  const guests = useGuestStore((s) => s.guests);
  const tables = useTableStore((s) => s.tables);
  const { SeatedGuestAmount } = useGuest();
  const seatedGuests = guests.filter((g) => g.tableId !== null);

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
          Seated Guests
        </SidebarGroupLabel>
        <IconButton Icon={ArrowUpDown} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-expanded={isSeatedOpen}
          aria-label="Toggle seated guests"
          onClick={() => setIsSeatedOpen((open) => !open)}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              'transition-transform duration-200',
              isSeatedOpen && 'rotate-180',
            )}
          />
        </Button>
        <IconButton Label={SeatedGuestAmount} />
      </div>
      {isSeatedOpen && (
        <SidebarGroupContent className="flex flex-col mt-1.5 px-2 gap-2.5">
          {seatedGuests.map((guest) => {
            const table = tables.find((t) => t.id === guest.tableId);
            const seatNumber = guest.seat?.split('-').pop();
            return (
              <GuestCard
                key={guest.id}
                name={guest.name ?? ''}
                initials={getInitials(guest.name ?? '')}
                table={table?.name}
                seat={seatNumber}
                guestId={guest.id}
                // showSeatedActions
              />
            );
          })}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};