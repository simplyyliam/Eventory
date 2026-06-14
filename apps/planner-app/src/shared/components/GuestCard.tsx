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
import { withHistory } from '@/lib/withHistory';
import { Checkbox } from '@app/shared/components/ui/checkbox';
import { cn } from '@app/shared/lib/utils';
import { useSelectionStore } from '@/store/useSelectionStore';

interface GuestCardProps {
  onClick?: () => void;
  initials: string;
  name: string;
  table?: string;
  seat?: string;
  guestId: string;
  showSeatedActions?: boolean;
}

export const GuestCard = ({
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
  const guest = useGuestStore((s) => s.guests.find((g) => g.id === guestId));
  const isSeated = !!guest?.tableId;

  const isSelected = useSelectionStore((s) => s.selectedIds.has(guestId));
  const isSelecting = useSelectionStore((s) => s.selectedIds.size > 0);
  const toggle = useSelectionStore((s) => s.toggle);

  const handleEdit = () => {
    if (!guest) return;
    setForm({
      name: guest.name,
      email: guest.email ?? undefined,
      comment: guest.comments ?? undefined,
      dietary: guest.dietary ?? undefined,
      tableId: guest.tableId ?? null,
      seatId: guest.seat ?? null,
    });
    setEditingGuestId(guestId);
    setAddGuestOpen(true);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-2.5 py-2 rounded-lg w-full',
        'transition-colors duration-100 ease-linear cursor-pointer border',
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggle(guestId)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md border border-input text-xs font-medium bg-muted">
          {initials}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate leading-tight">{name}</span>
          {table && seat ? (
            <span className="text-xs text-muted-foreground truncate leading-tight">
              {table} · Seat {seat}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50 leading-tight">
              Unseated
            </span>
          )}
        </div>
      </div>

      <div className={cn('shrink-0', isSelecting && 'opacity-0 pointer-events-none')}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<IconButton Icon={MoreHorizontalIcon} />}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleEdit}>Edit guest</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (showSeatedActions && isSeated) {
                    withHistory(() => unseatGuest(guestId));
                  } else {
                    withHistory(() => removeGuest(guestId));
                  }
                }}
              >
                {showSeatedActions && isSeated ? 'Unassign guest' : 'Remove guest'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};