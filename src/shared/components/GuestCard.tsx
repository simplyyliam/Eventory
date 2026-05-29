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
} from '@/components/ui/dropdown-menu';

interface GuestCardProps {
  key: string;
  onClick?: () => void;
  initials: string;
  name: string;
  table?: string;
  seat?: string;
  guestId: string;
}

export const GuestCard = ({
  key,
  onClick,
  initials,
  name,
  table,
  seat,
  guestId,
}: GuestCardProps) => {
  const openModal = useModalStore((s) => s.openModal);
  const setEditingGuestId = useModalStore((s) => s.setEditingGuestId);
  const setForm = useFormStore((s) => s.setForm);
  const guest = useGuestStore((s) =>
    s.guests.find((guest) => guest.id === guestId),
  );
  const removeGuest = useGuestStore((s) => s.removeGuest)

  const handleEdit = () => {
    if (!guest) return;
    setForm({
      name: guest.Name,
      email: guest.Email,
      comment: guest.Comments,
      dietary: guest.Dietary,
    });
    setEditingGuestId(guestId);
    openModal('GuestModal');
  };

  return (
    <div
      key={key}
      onClick={onClick}
      className="flex gap-2 items-center justify-between p-2.5 hover:bg-muted transition-all ease-linear rounded-md"
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
        <DropdownMenuTrigger>
          <IconButton Icon={MoreHorizontalIcon} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleEdit}>Edit Guest</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => removeGuest(guestId)}>Delete</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
