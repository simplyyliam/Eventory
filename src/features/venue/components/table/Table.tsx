import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatModal } from '@/features/guests';
import type { PopupPlacement } from './table.types';
import { getPopupPlacement, useTableSeatCount } from './utils';
import { useModalStore } from '@/store/useModalStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { useTableStore } from '@/store/useTableStore';
import { useEffect, useRef, useState } from 'react';

interface TableProps {
  shape: 'circle' | 'rectangle';
  seatCount?: number;
  id: string;
  name: string;
  tableId: string;
  x: number;
  y: number;
  rotation: number;
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

export const Table = ({
  shape,
  seatCount = 12,
  id,
  name,
  tableId,
  x,
  y,
  rotation,
}: TableProps) => {
  const modalId = useModalStore((s) => s.modalId);
  const modalData = useModalStore((s) => s.modalData);
  const openModal = useModalStore((s) => s.openModal);
  const updateTableSeats = useTableStore((s) => s.updateTableSeats);
  const updateTablePosition = useTableStore((s) => s.updateTablePosition);
  const updateTableRotation = useTableStore((s) => s.updateTableRotation);
  const removeTable = useTableStore((s) => s.removeTable);
  const storeSeats = useTableSeatCount(tableId);

  const [inputValue, setInputValue] = useState(String(storeSeats));
  const [isRotating, setIsRotating] = useState(false);

  // Use TABLE_CONFIG values so seats/layout match the config
  const tableWidth =
    shape === 'circle'
      ? TABLE_CONFIG.circleRadius * 2
      : TABLE_CONFIG.rectangleWidth;
  const tableHeight =
    shape === 'circle'
      ? TABLE_CONFIG.circleRadius * 2
      : TABLE_CONFIG.rectangleHeight;

  // wrapper size includes padding for seats
  const wrapperPadding = TABLE_CONFIG.seatGap + 24; // extra room for seat hit area
  const wrapperWidth = tableWidth + wrapperPadding * 2;
  const wrapperHeight = tableHeight + wrapperPadding * 2;

  const centerX = wrapperWidth / 2;
  const centerY = wrapperHeight / 2;
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // const isRotating = useRef(false);
  const rotateStart = useRef({ angle: 0, rotation: 0 });
  const rotatePointerId = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const WORLD_SIZE = 10000;
  const WORLD_HALF = WORLD_SIZE / 2;

  const assignSeatModalData =
    modalId === 'AssignSeatModal' &&
    (modalData as AssignSeatModalData)?.tableId === id
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
      placement: getPopupPlacement(x, y, centerX, centerY),
    } satisfies AssignSeatModalData);
  };

  const handleSeatInputBlur = () => {
    const newSeats = parseInt(inputValue, 10) || 0;
    updateTableSeats(tableId, newSeats);
  };

  const handleAdjustSeats = (amount: number) => {
    const current = parseInt(inputValue, 10) || 0;
    const computed = current + amount;
    const finalSeats = computed < 0 ? 0 : computed;
    setInputValue(String(finalSeats));
    updateTableSeats(tableId, finalSeats);
  };

  // Pointer moving logic
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      updateTablePosition(
        tableId,
        e.clientX - offset.current.x,
        e.clientY - offset.current.y,
      );
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [updateTablePosition, tableId]);

  // Rotation handlers (rectangle tables only)
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isRotating || !wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle =
        (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
      const delta = angle - rotateStart.current.angle;
      const newRotation = rotateStart.current.rotation + delta;

      // If Shift is held, snap to 15° increments
      if (e.shiftKey) {
        const snapped = Math.round(newRotation / 15) * 15;
        updateTableRotation(tableId, snapped);
      } else {
        updateTableRotation(tableId, newRotation);
      }
    };

    const handleUp = () => {
      if (isRotating) {
        setIsRotating(false);
        if (rotatePointerId.current != null && wrapperRef.current) {
          try {
            wrapperRef.current.releasePointerCapture(rotatePointerId.current);
          } catch (err) {
            console.error(err);
          }
        }
        rotatePointerId.current = null;
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [tableId, updateTableRotation]);

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: wrapperWidth,
        height: wrapperHeight,
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: `translate(${x + WORLD_HALF}px, ${y + WORLD_HALF}px) ${shape === 'rectangle' ? `rotate(${rotation}deg)` : ''}`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: wrapperWidth,
          height: wrapperHeight,
        }}
      >
        {Array.from({ length: visibleSeatCount }).map((_, idx) => {
          const { x, y } = getSeatPosition(
            shape,
            idx,
            visibleSeatCount,
            TABLE_CONFIG,
            centerX,
            centerY,
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
            onPointerDown={(e) => e.stopPropagation()}
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
        <ContextMenu>
          <ContextMenuTrigger onPointerDown={(e) => e.stopPropagation()}>
            {/* Table Shape */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                isDragging.current = true;
                offset.current = {
                  x: e.clientX - x,
                  y: e.clientY - y,
                };
              }}
              className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground ${shapeStyle[shape]}`}
              style={{
                width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
                height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
              }}
            >
              {name}
            </div>
            {/* Rotate handle for rectangles */}
            {shape === 'rectangle' && (hovered || isRotating) && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  // start rotating
                  const node = wrapperRef.current;
                  if (!node) return;
                  rotatePointerId.current = e.pointerId;
                  try {
                    node.setPointerCapture(e.pointerId);
                  } catch (err) {
                    console.error(err);
                  }

                  const rect = node.getBoundingClientRect();
                  const cx = rect.left + rect.width / 2;
                  const cy = rect.top + rect.height / 2;
                  const angle =
                    (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) /
                    Math.PI;
                  rotateStart.current.angle = angle;
                  rotateStart.current.rotation = rotation;
                  setIsRotating(true);
                }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-grab"
              />
            )}
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-44 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-2 py-1">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Table seats
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Adjust capacity
                </span>
              </div>

              <div
                key={storeSeats}
                className="flex items-center gap-1"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="h-6 w-6 rounded-md bg-muted text-xs hover:bg-muted/80 active:scale-95"
                  onClick={() => handleAdjustSeats(-1)}
                >
                  −
                </button>

                <Input
                  type="text"
                  inputMode="numeric"
                  className="h-7 w-10 rounded-md border border-input bg-background text-center text-xs"
                  defaultValue={String(storeSeats)}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={handleSeatInputBlur}
                />

                <button
                  type="button"
                  className="h-6 w-6 rounded-md bg-muted text-xs hover:bg-muted/80 active:scale-95"
                  onClick={() => handleAdjustSeats(1)}
                >
                  +
                </button>
              </div>
            </div>
            <ContextMenuItem onClick={() => removeTable(tableId)}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};
