import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@app/shared/components/ui/card';

import { getInitials } from '@/lib/getInitials';
import { getSeatLabel } from '@/lib/getSeat';
import type { GuestInfoModalData } from '@/features/venue/components/table/table.types';

type Props = {
  data: GuestInfoModalData | null;
};

export const GuestInfoModal = ({ data }: Props) => {
  if (!data) return null;

  return (
    <Card className="w-full min-w-sm rounded-xl">
      <CardHeader className="space-y-4">
        <CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
              {getInitials(data.guestName)}
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">
                {data.guestName}
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
              {getSeatLabel(data.seatId)}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            <span className="text-muted-foreground">Table</span>
            <span className="font-medium text-foreground">
              {data.tableId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};