import { TablePreview } from '../TablePreview';
import { TableSheetGroup } from './TableSheetGroup';
import { useGuestStore } from '@/store/useGuestStore';
import { getInitials } from '@/lib/getInitials';
import { Minus, Plus, UserSearch01Icon, Link02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { GuestCard, IconButton } from '@/shared/components';
import { useTableStore } from '@/store/useTableStore';
import { TEXTURE_LOADER } from '@/config';
import { TextureSwatch } from './TextureSwatch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@app/shared/components/ui/sheet';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@app/shared/components/ui/empty';
import { Item, ItemContent, ItemTitle, ItemDescription } from '@app/shared/components/ui/item';
import {
  Label,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  EditableName,
} from '@app/shared';

type TableSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableName: string;
  seatCount: number;
  shape: 'circle' | 'rectangle';
  rotation: number;
  // — New props —
  hiddenSeats?: string[];
  onToggleSeat?: (seatId: string) => void;
  isLinked?: boolean;
  linkedTableId?: string;
  onUnlink?: () => void;
};

export const TableSheet = ({
  open,
  onOpenChange,
  tableId,
  tableName,
  seatCount,
  shape,
  rotation,
  hiddenSeats = [],
  onToggleSeat,
  isLinked = false,
  onUnlink,
}: TableSheetProps) => {
  const guests = useGuestStore((s) => s.guests);
  const updateTableShape   = useTableStore((s) => s.updateTableShape);
  const updateTableTexture = useTableStore((s) => s.updateTableTexture);
  const updateTableName    = useTableStore((s) => s.updateTableName);
  const updateTableHeight = useTableStore((s) => s.updateTableHeight)
  const updateTableSeats = useTableStore((s) => s.updateTableSeats);
  const table = useTableStore((s) => s.tables.find((t) => t.id === tableId));
  


const storeSeats =
  table?.shape === 'rectangle'
    ? 2 + Math.floor((table.height ?? 300) / 75) * 2
    : table?.seatCount ?? 0;

  if (!storeSeats) return null;

  const tableLabel     = table?.shape === 'circle' ? 'Round Table' : 'Long Table';
  const assignedGuests = guests.filter((g) => g.tableId === tableId);

  // ── Seat side helpers ────────────────────────────────────────────────────
  // Seat indices: 0 = top head, 1 = bottom foot, 2+ = long sides
  // Long side seats: even sideIndex = left, odd = right
  // We build seat IDs the same way Table.tsx does: `${tableId}-seat-${idx + 1}`
  const leftSeatIds: string[]  = [];
  const rightSeatIds: string[] = [];

  const currentHeight = table?.height ?? 300;

    const increaseSeats = () => {
      if (shape === 'rectangle') {
        updateTableHeight(tableId, currentHeight + 75);
      } else {
        updateTableSeats(tableId, Math.min(10, storeSeats + 1));
      }
    };

    const decreaseSeats = () => {
      if (shape === 'rectangle') {
        const newHeight = Math.max(120, currentHeight - 75);
        updateTableHeight(tableId, newHeight);
      } else {
        updateTableSeats(tableId, Math.max(8, storeSeats - 1));
      }
    };

  for (let idx = 2; idx < seatCount; idx++) {
    const sideIndex = idx - 2;
    const seatId    = `${tableId}-seat-${idx + 1}`;
    if (sideIndex % 2 === 0) leftSeatIds.push(seatId);
    else rightSeatIds.push(seatId);
  }

  const headTopId    = `${tableId}-seat-1`;
  const headBottomId = `${tableId}-seat-2`;

  const leftHidden    = leftSeatIds.length  > 0 && leftSeatIds.every((id)  => hiddenSeats.includes(id));
  const rightHidden   = rightSeatIds.length > 0 && rightSeatIds.every((id) => hiddenSeats.includes(id));
  const headTopHidden = hiddenSeats.includes(headTopId);
  const headBotHidden = hiddenSeats.includes(headBottomId);

  // Toggle every seat on a given side at once
  const toggleSide = (seatIds: string[], currentlyHidden: boolean) => {
    if (!onToggleSeat) return;
    seatIds.forEach((seatId) => {
      const isHidden = hiddenSeats.includes(seatId);
      // If we want to show (currentlyHidden=true) restore hidden ones only
      // If we want to hide (currentlyHidden=false) hide visible ones only
      if (currentlyHidden && isHidden) onToggleSeat(seatId);
      if (!currentlyHidden && !isHidden) onToggleSeat(seatId);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="flex flex-col"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>
            <EditableName
              name={tableName}
              onSave={(newName) => updateTableName(tableId, newName)}
            />
          </SheetTitle>
          <SheetDescription>
            {`${seatCount - hiddenSeats.length} Seats • ${assignedGuests.length} Guests Assigned`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-2.5 pr-2">

            {/* Preview */}
            <TableSheetGroup className="items-center justify-center">
              <TablePreview
                shape={shape}
                seatCount={seatCount}
                rotation={rotation}
                name={tableName}
                tableId={tableId}
              />
            </TableSheetGroup>

            {/* Textures */}
            <TableSheetGroup>
              <Label className="py-3">Textures</Label>
              <div className="flex items-center gap-2.5">
                <TextureSwatch
                  onClick={() => updateTableTexture(tableId, TEXTURE_LOADER.WHITE_OAK.id)}
                  textureSwatch="WHITE_OAK"
                />
                <TextureSwatch
                  onClick={() => updateTableTexture(tableId, TEXTURE_LOADER.WHITE_ELM.id)}
                  textureSwatch="WHITE_ELM"
                />
              </div>
            </TableSheetGroup>

            {/* Seat Layout — rectangle only */}
            {shape === 'rectangle' && (
              <TableSheetGroup>
                <Label className="py-3">Seat Layout</Label>

                {/* Visual seat diagram */}
                <div className="flex flex-col items-center gap-1.5 py-3">
                  {/* Top head toggle */}
                  <SeatToggleChip
                    label="Head"
                    active={!headTopHidden}
                    onClick={() => onToggleSeat?.(headTopId)}
                    orientation="horizontal"
                  />
                  {/* Long sides */}
                  <div className="flex items-center gap-3">
                    <SeatToggleChip
                      label="Left"
                      active={!leftHidden}
                      onClick={() => toggleSide(leftSeatIds, leftHidden)}
                      orientation="vertical"
                    />
                    {/* Table body representation */}
                    <div className="w-14 h-20 rounded-[6px] bg-muted border border-border flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground font-medium tracking-wide">TABLE</span>
                    </div>
                    <SeatToggleChip
                      label="Right"
                      active={!rightHidden}
                      onClick={() => toggleSide(rightSeatIds, rightHidden)}
                      orientation="vertical"
                    />
                  </div>
                  {/* Bottom foot toggle */}
                  <SeatToggleChip
                    label="Foot"
                    active={!headBotHidden}
                    onClick={() => onToggleSeat?.(headBottomId)}
                    orientation="horizontal"
                  />
                </div>

                <p className="text-[11px] text-muted-foreground pb-2 leading-relaxed">
                  Tap a side to show or hide all seats on it. Individual seats can also be removed by right-clicking them on the canvas.
                </p>
              </TableSheetGroup>
            )}

            {/* Linked table */}
            {isLinked && (
              <TableSheetGroup>
                <Label className="py-3">Joined Table</Label>
                <Item>
                  <ItemContent>
                    <ItemTitle>Linked to another table</ItemTitle>
                    <ItemDescription>Inner head seats are hidden</ItemDescription>
                  </ItemContent>
                  <button
                    onClick={onUnlink}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <HugeiconsIcon icon={Link02Icon} size={14} />
                    Separate
                  </button>
                </Item>
              </TableSheetGroup>
            )}

            {/* Seated guests */}
            <TableSheetGroup>
              {assignedGuests.length > 0 && <Label className="py-3">Seated Guests</Label>}
              {assignedGuests.length > 0 ? (
                assignedGuests.map((guest) => (
                  <GuestCard
                    key={guest.id}
                    initials={getInitials(guest.name ?? '')}
                    name={guest.name ?? ''}
                    guestId={guest.id}
                    showSeatedActions
                  />
                ))
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={UserSearch01Icon} />
                    </EmptyMedia>
                    <EmptyTitle>No guests at this table</EmptyTitle>
                    <EmptyDescription>Please add guests to this table</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </TableSheetGroup>

            {/* Properties */}
            <TableSheetGroup>
              <Label className="py-3">Properties</Label>
              <Item>
                <ItemContent>
                  <ItemTitle>Seat Count</ItemTitle>
                </ItemContent>
                <div
                  className="flex items-center gap-1.5"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                <IconButton Icon={Minus} onClick={decreaseSeats} />
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-input px-2 text-sm font-medium">
                    {storeSeats}
                  </div>
                  <IconButton Icon={Plus} onClick={increaseSeats} />
                </div>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>Table Shape</ItemTitle>
                </ItemContent>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<IconButton Label={tableLabel} />} />
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => updateTableShape(tableId, 'rectangle')}>
                        Long Table
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTableShape(tableId, 'circle')}>
                        Round Table
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Item>
            </TableSheetGroup>

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Seat Toggle Chip ─────────────────────────────────────────────────────────

type SeatToggleChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  orientation: 'horizontal' | 'vertical';
};

const SeatToggleChip = ({ label, active, onClick, orientation }: SeatToggleChipProps) => (
  <button
    onClick={onClick}
    onPointerDown={(e) => e.stopPropagation()}
    className={[
      'rounded-[6px] border text-[11px] font-medium transition-all duration-150 select-none',
      orientation === 'horizontal' ? 'px-5 py-1.5' : 'px-2.5 py-4',
      active
        ? 'bg-foreground text-background border-foreground'
        : 'bg-muted text-muted-foreground border-border hover:border-foreground/30',
    ].join(' ')}
  >
    {label}
  </button>
);