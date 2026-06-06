import { MoreHorizontalIcon } from '@hugeicons/core-free-icons';
import { IconButton } from './IconButton';
import { useModalStore } from '@/store/useModalStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useFormStore } from '@/store/useFormStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';

interface GuestCardProps {
  key: string;
  onClick?: () => void;
  initials: string;
  name: string;
  table?: string;
  seat?: string;
  guestId: string;
  showSeatedActions?: boolean;
}

export const GuestCard = ({
  key,
  onClick,
  initials,
  name,
  table,
  seat,
  guestId,
  showSeatedActions,
}: GuestCardProps) => {
  const setEditingGuestId = useModalStore((s) => s.setEditingGuestId);
  const setAddGuestOpen = useModalStore((s) => s.setAddGuestOpen);
  const setForm = useFormStore((s) => s.setForm);
  const unseatGuest = useGuestStore((s) => s.unseatGuest);
  const removeGuest = useGuestStore((s) => s.removeGuest);
  const guest = useGuestStore((s) =>
    s.guests.find((g) => g.id === guestId),
  );

  const isSeated = !!guest?.tableId;

  const handleEdit = () => {
    if (!guest) return;
    setForm({
      name: guest.name,
      email: guest.email ?? undefined,
      comment: guest.comments ?? undefined,
      dietary: guest.dietary ?? undefined,
    });
    setEditingGuestId(guestId);
    setAddGuestOpen(true);
  };

  return (
    <div
      key={key}
      onClick={onClick}
      className="flex gap-2 items-center justify-between p-2.5 hover:bg-muted transition-all ease-linear rounded-md w-full"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 border border-input rounded-md">
          {initials}
        </div>
        <div className="flex flex-col">
          <span>{name}</span>
          {table && seat && (
            <span className="text-xs text-muted-foreground">
              {table} - Seat {seat}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<IconButton Icon={MoreHorizontalIcon} />}
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleEdit}>Edit Guest</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                if (showSeatedActions && isSeated) {
                  unseatGuest(guestId);
                } else {
                  removeGuest(guestId);
                }
              }}
            >
              {showSeatedActions && isSeated
                ? 'Unassign Guest'
                : 'Remove Guest'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};