import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getInitials } from '@/lib/convertToInitials';
import { getSeatLabel } from '@/lib/getSeat';
import { useModalStore } from '@/store/useModalStore';

type GuestInfoModalData = {
  tableId: string;
  seatId: string;
  guestName: string;
};

export const GuestInfoModal = () => {
  const modalData = useModalStore(
    (s) => s.modalData,
  ) as GuestInfoModalData | null;

  if (!modalData) return null;

  return (
    <Card className="w-full min-w-sm rounded-xl">
      <CardHeader className="space-y-4">
        <CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
              {getInitials(modalData.guestName)}
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">
                {modalData.guestName}
              </span>
              <span className="text-xs text-muted-foreground">
                Guest details
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            <span className="text-muted-foreground">Seat</span>
            <span className="font-medium text-foreground">
              {getSeatLabel(modalData.seatId)}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            <span className="text-muted-foreground">Table</span>
            <span className="font-medium text-foreground">
              {modalData.tableId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};