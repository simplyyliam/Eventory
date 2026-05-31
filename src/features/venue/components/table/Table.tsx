import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatDialog, GuestInfoModal } from '@/features/guests';
import {
  shapeStyle,
  type GuestInfoModalData,
  type TableProps,
} from './table.types';
import { getPopupPlacement, useTableSeatCount } from './utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { useTableStore } from '@/store/useTableStore';
import { useEffect, useRef, useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { Chair, TableSurface } from '../assets';
import { getInitials } from '@/lib/getInitials';
import { TableSheet } from './TableSheet';

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
  // modal store is used elsewhere; GuestInfo will be shown on hover instead
  const updateTableSeats = useTableStore((s) => s.updateTableSeats);
  const updateTablePosition = useTableStore((s) => s.updateTablePosition);
  const updateTableRotation = useTableStore((s) => s.updateTableRotation);
  const removeTable = useTableStore((s) => s.removeTable);
  const storeSeats = useTableSeatCount(tableId);
  const seatedGuests = useGuestStore((s) => s.seatedGuests);
  const guests = useGuestStore((s) => s.guests);
  const [inputValue, setInputValue] = useState(String(storeSeats));
  const [isRotating, setIsRotating] = useState(false);
  const DidDragRef = useRef(false)
  const [assignSeatOpen, setAssignSeatOpen] = useState(false);
  const [activeSeat, setActiveSeat] = useState<{
    tableId: string;
    seatId: string;
  } | null>(null);

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

  const [hoverGuest, setHoverGuest] = useState<GuestInfoModalData | null>(null);
  const [open, setOpen] = useState(false)
  
  const visibleSeatCount =
    shape === 'rectangle'
      ? Math.min(seatCount, TABLE_CONFIG.maxRectangleSeats)
      : seatCount;

  const handleAssignSeat = (index: number) => {
    const seat = seatedGuests.find(
      (s) => s.seatId === `${id}-seat-${index + 1}`,
    );

    if (!seat) {
      setActiveSeat({
        tableId: id,
        seatId: `${id}-seat-${index + 1}`,
      });

      setAssignSeatOpen(true);
      return;
    }
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
      DidDragRef.current = true
      updateTablePosition(
        tableId,
        e.clientX - offset.current.x,
        e.clientY - offset.current.y,
      );
    };

    const handleUp = () => {
      isDragging.current = false;
      setTimeout(() => {
        DidDragRef.current = false
      }, 0);
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
  }, [tableId, updateTableRotation, isRotating]);

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

          const dx = centerX - x;
          const dy = centerY - y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90;

          const seatId = `${id}-seat-${idx + 1}`;
          const seat = seatedGuests.find((s) => s.seatId === seatId);
          const guest = guests.find((g) => g.id === seat?.guestId);

          return (
            <div
              key={idx}
              className="absolute"
              onClick={() => handleAssignSeat(idx)}
              onMouseEnter={() => {
                if (!seat?.guestId || !guest) return;

                setHoverGuest({
                  tableId: id,
                  seatId,
                  guestId: guest.id,
                  guestName: guest.Name,
                  placement: getPopupPlacement(x, y, centerX, centerY),
                });
              }}
              onMouseLeave={() => setHoverGuest(null)}
              style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                width: 50,
                height: 50,
              }}
            >
              <Chair idx={idx} />

              {seat?.guestId && (
                <div className="absolute top-1.75 inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="flex items-center justify-center text-xs font-medium bg-background/80 w-7 h-7 rounded-md border border-input"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {getInitials(guest?.Name ?? '')}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <AssignSeatDialog
          open={assignSeatOpen && activeSeat?.tableId === id}
          onOpenChange={setAssignSeatOpen}
          tableId={activeSeat?.tableId ?? ''}
          seatId={activeSeat?.seatId ?? ''}
        />

        {hoverGuest && hoverGuest.tableId === id && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute z-20"
            style={{
              top: hoverGuest.placement.top,
              left: hoverGuest.placement.left,
              transform: hoverGuest.placement.transform,
            }}
          >
            <GuestInfoModal data={hoverGuest} />
          </div>
        )}
        <ContextMenu>
          <ContextMenuTrigger onPointerDown={(e) => e.stopPropagation()}>
            {/* Table Shape */}
            <TableSurface
              x={x}
              y={y}
              name={name}
              shape={shape}
              shapeStyle={shapeStyle}
              TABLE_CONFIG={TABLE_CONFIG}
              isDraggingRef={isDragging}
              offsetRef={offset}
              onClick={() => setOpen(true)}
            />
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
      <TableSheet open={open} onOpenChange={setOpen} tableId={id} tableName={name} seatCount={seatCount}/>
    </div>
  );
};
