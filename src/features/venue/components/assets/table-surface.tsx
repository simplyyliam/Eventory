import { TEXTURE_LOADER } from '@/config';
import type { RefObject } from 'react';

type TableProps = {
  x: number;
  y: number;
  name: string;
  shape: 'circle' | 'rectangle';
  shapeStyle: Record<'circle' | 'rectangle', string>;
  TABLE_CONFIG: {
    rectangleWidth: number;
    rectangleHeight: number;
  };
  isDraggingRef: RefObject<boolean>;
  offsetRef: RefObject<{
    x: number;
    y: number;
  }>;
  onClick: () => void;
};
export const TableSurface = ({
  x,
  y,
  name,
  shape,
  shapeStyle,
  TABLE_CONFIG,
  isDraggingRef,
  offsetRef,
  onClick,
}: TableProps) => {
  return (
    <div
      onClick={onClick}
      onPointerDown={(e) => {
        isDraggingRef.current = true;

        offsetRef.current = {
          x: e.clientX - x,
          y: e.clientY - y,
        };
      }}
      className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-input bg-muted ${shapeStyle[shape]}`}
      style={{
        width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
        height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
        background: `url('${TEXTURE_LOADER.WHITE_OAK.texture}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {name}
    </div>
  );
};
