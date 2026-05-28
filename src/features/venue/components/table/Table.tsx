import { useModalStore } from '@/store/useModalStore';
import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { useRef } from 'react';

interface TableProps {
  shape: 'circle' | 'rectangle';
  seatCount?: number;
}

const shapeStyle: Record<TableProps['shape'], string> = {
  circle: 'rounded-full',
  rectangle: 'rounded-[2px]',
};

export const Table = ({ shape, seatCount = 12 }: TableProps) => {
  const openModal = useModalStore((s) => s.openModal);
  const seatRef = useRef<HTMLDivElement>(null)
  
  const visibleSeatCount =
    shape === 'rectangle'
      ? Math.min(seatCount, TABLE_CONFIG.maxRectangleSeats)
      : seatCount;

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
          <>
            <div
              key={idx}
              ref={seatRef}
              className="absolute w-6 h-6 bg-red-600"
              onClick={() => openModal('AssignSeat')}
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </>
        );
      })}

      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground ${shapeStyle[shape]}`}
        style={{
          width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
          height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
        }}
      >
        {shape}
      </div>
    </div>
  );
};
