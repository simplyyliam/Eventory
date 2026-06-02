import { Chair } from '../assets';
import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { shapeStyle } from './table.types';
import { IconButton } from '@/shared/components';
import { Table02Icon } from '@hugeicons/core-free-icons';
import { useTableTexture } from '@/lib/useTableTexture';

type TablePreviewProps = {
  shape: 'circle' | 'rectangle';
  seatCount: number;
  rotation?: number;
  name?: string;
  tableId: string;
};

export const TablePreview = ({
  shape,
  seatCount,
  rotation = 0,
  tableId,
  // name,
}: TablePreviewProps) => {
  const texture = useTableTexture(tableId);

  const tableWidth =
    shape === 'circle'
      ? TABLE_CONFIG.circleRadius * 2
      : TABLE_CONFIG.rectangleWidth;

  const tableHeight =
    shape === 'circle'
      ? TABLE_CONFIG.circleRadius * 2
      : TABLE_CONFIG.rectangleHeight;

  const wrapperPadding = TABLE_CONFIG.seatGap + 24;
  const wrapperWidth = tableWidth + wrapperPadding * 2;
  const wrapperHeight = tableHeight + wrapperPadding * 2;

  const cx = wrapperWidth / 2;
  const cy = wrapperHeight / 2;

  const visibleSeatCount =
    shape === 'rectangle'
      ? Math.min(seatCount, TABLE_CONFIG.maxRectangleSeats)
      : seatCount;

  return (
    <div
      className="relative"
      style={{
        width: wrapperWidth,
        height: wrapperHeight,
        transform: shape === 'rectangle' ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      {Array.from({ length: visibleSeatCount }).map((_, idx) => {
        const position = getSeatPosition(
          shape,
          idx,
          visibleSeatCount,
          TABLE_CONFIG,
          cx,
          cy,
        );

        const dx = cx - position.x;
        const dy = cy - position.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90;

        return (
          <div
            className="absolute"
            key={idx}
            style={{
              left: position.x,
              top: position.y,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              width: 50,
              height: 50,
            }}
          >
            <Chair idx={idx} />
          </div>
        );
      })}

      <div
        className={`absolute  left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 justify-center items-center border border-input bg-muted ${shapeStyle[shape]}`}
        style={{
          width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
          height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
          backgroundImage: `url('${texture.texture}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      ></div>
    </div>
  );
};
