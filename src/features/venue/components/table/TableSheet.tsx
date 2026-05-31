import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
// import { useTableStore } from '@/store/useTableStore';
// import { useTableSeatCount } from './utils';

type TableSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableName: string;
  seatCount: number;
};

export const TableSheet = ({
  open,
  onOpenChange,
  tableName,
  seatCount,
}: TableSheetProps) => {
  //   const removeTable = useTableStore((s) => s.removeTable);
  //   const storeSeats = useTableSeatCount(tableId);
  //   const updateTableSeats = useTableStore((s) => s.updateTableSeats);

  //   const increment = () => updateTableSeats(tableId, (storeSeats ?? 0) + 1);
  //   const decrement = () => updateTableSeats(tableId, Math.max(0, (storeSeats ?? 0) - 1));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>{tableName}</SheetTitle>
          <SheetDescription>
            {`${seatCount} Seats • 2 Guests Assigned`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2.5 h-full">
          <div className="w-full h-full bg-muted"></div>
          <div className="w-full h-full bg-muted"></div>
          <div className="w-full h-full bg-muted"></div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
