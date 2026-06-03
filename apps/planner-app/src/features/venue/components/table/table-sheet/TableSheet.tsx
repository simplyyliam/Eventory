import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TablePreview } from '../TablePreview';
import { TableSheetGroup } from './TableSheetGroup';
import { Label } from '@/components/ui/label';
import { useGuestStore } from '@/store/useGuestStore';
import { getInitials } from '@/lib/getInitials';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Minus, Plus, UserSearch01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { GuestCard, IconButton } from '@/shared/components';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';
import { useTableStore } from '@/store/useTableStore';
import { useTableSeatCount } from '../utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTableName } from './EditTableName';
import { TEXTURE_LOADER } from '@/config';
import { TextureSwatch } from './TextureSwatch';

type TableSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableName: string;
  seatCount: number;
  shape: 'circle' | 'rectangle';
  rotation: number;
};

export const TableSheet = ({
  open,
  onOpenChange,
  tableId,
  tableName,
  seatCount,
  shape,
  rotation,
}: TableSheetProps) => {
  const guests = useGuestStore((s) => s.guests);
  const seatedGuest = useGuestStore((s) => s.seatedGuests);
  const updateTableSeats = useTableStore((s) => s.updateTableSeats);
  const updateTableShape = useTableStore((s) => s.updateTableShape);
  const updateTableTexture = useTableStore((s) => s.updateTableTexture);
  const table = useTableStore((s) =>
    s.tables.find((table) => table.id === tableId),
  );

  const storeSeats = useTableSeatCount(tableId);
  if (!storeSeats) return;

  const tableLabel = table?.shape === 'circle' ? 'Round Table' : 'Long Table';

  const AssignedGuests = seatedGuest.filter(
    (seat) => seat.tableId === tableId,
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
        }}
        className="flex flex-col"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>
            <EditTableName tableName={tableName} tableId={tableId} />
          </SheetTitle>
          <SheetDescription>
            {`${seatCount} Seats • ${AssignedGuests} Guests Assigned`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-2.5 pr-2">
            <TableSheetGroup className="items-center justify-center">
              <TablePreview
                shape={shape}
                seatCount={seatCount}
                rotation={rotation}
                name={tableName}
                tableId={tableId}
              />
            </TableSheetGroup>
            <TableSheetGroup>
              <Label className="py-3">Textures</Label>
              <div className="flex items-center gap-2.5">
                <TextureSwatch
                  onClick={() =>
                    updateTableTexture(tableId, TEXTURE_LOADER.WHITE_OAK.id)
                  }
                  textureSwatch="WHITE_OAK"
                />
                <TextureSwatch
                  onClick={() =>
                    updateTableTexture(tableId, TEXTURE_LOADER.WHITE_ELM.id)
                  }
                  textureSwatch="WHITE_ELM"
                />
              </div>
            </TableSheetGroup>

            <TableSheetGroup>
              {seatedGuest.filter((seat) => seat.tableId === tableId).length >
                0 && <Label className="py-3">Seated Guests</Label>}

              {seatedGuest.filter((seat) => seat.tableId === tableId).length >
              0 ? (
                seatedGuest
                  .filter((seat) => seat.tableId === tableId)
                  .map((seat) => {
                    const guest = guests.find(
                      (guest) => guest.id == seat.guestId,
                    );

                    return (
                      <GuestCard
                        key={guest?.id ?? ''}
                        initials={getInitials(guest?.Name ?? '')}
                        name={guest?.Name ?? ''}
                        guestId={guest?.id ?? ''}
                        showSeatedActions
                      />
                    );
                  })
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={UserSearch01Icon} />
                    </EmptyMedia>
                    <EmptyTitle>No guests at this table</EmptyTitle>
                    <EmptyDescription>
                      Please add guests to this table
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </TableSheetGroup>
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
                  <IconButton
                    Icon={Minus}
                    onClick={() =>
                      updateTableSeats(tableId, Math.max(1, storeSeats - 1))
                    }
                  />

                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-input px-2 text-sm font-medium">
                    {storeSeats}
                  </div>

                  <IconButton
                    Icon={Plus}
                    onClick={() => updateTableSeats(tableId, storeSeats + 1)}
                  />
                </div>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>Table Shape</ItemTitle>
                </ItemContent>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<IconButton Label={tableLabel} />}
                  />
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => updateTableShape(tableId, 'rectangle')}
                      >
                        Long Table
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateTableShape(tableId, 'circle')}
                      >
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
