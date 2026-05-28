import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatModal } from '@/features/guests';
import type { PopupPlacement } from './table.types';
import { getPopupPlacement } from './utils';
import { useModalStore } from '@/store/useModalStore';

interface TableProps {
  shape: 'circle' | 'rectangle';
  seatCount?: number;
  id: string;
  name: string;
}

const shapeStyle: Record<TableProps['shape'], string> = {
  circle: 'rounded-full',
  rectangle: 'rounded-[2px]',
};

type AssignSeatModalData = {
  tableId: string;
  seatId: string;
  seatIndex: number;
  placement: PopupPlacement;
};

export const Table = ({ shape, seatCount = 12, id, name }: TableProps) => {
  const modalId = useModalStore((s) => s.modalId);
  const modalData = useModalStore((s) => s.modalData);
  const openModal = useModalStore((s) => s.openModal);

  const assignSeatModalData =
    modalId === 'AssignSeatModal'
      ? (modalData as AssignSeatModalData | null)
      : null;

  const visibleSeatCount =
    shape === 'rectangle'
      ? Math.min(seatCount, TABLE_CONFIG.maxRectangleSeats)
      : seatCount;

  const handleAssignSeat = (index: number, x: number, y: number) => {
    openModal('AssignSeatModal', {
      tableId: id,
      seatId: `${id}-seat-${index + 1}`,
      seatIndex: index,
      placement: getPopupPlacement(x, y),
    } satisfies AssignSeatModalData);
  };

  return (
    <div className="relative h-96 w-96">
      {/* Seats */}
      {Array.from({ length: visibleSeatCount }).map((_, idx) => {
        const { x, y } = getSeatPosition(
          shape,
          idx,
          visibleSeatCount,
          TABLE_CONFIG,
        );

        return (
          <div
            key={idx}
            className="absolute w-6 h-6 bg-red-600"
            onClick={() => handleAssignSeat(idx, x, y)}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {assignSeatModalData && (
        <div
          className="absolute z-20"
          style={{
            top: assignSeatModalData.placement.top,
            left: assignSeatModalData.placement.left,
            transform: assignSeatModalData.placement.transform,
          }}
        >
          <AssignSeatModal />
        </div>
      )}

      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground ${shapeStyle[shape]}`}
        style={{
          width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
          height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
        }}
      >
        {name}
      </div>
    </div>
  );
};
