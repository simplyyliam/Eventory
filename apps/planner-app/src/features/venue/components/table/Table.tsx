import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatDialog, GuestInfoModal } from '@/features/guests';
import {
  shapeStyle,
  type GuestInfoModalData,
  type TableProps,
} from './table.types';
import { getPopupPlacement } from './utils';
import { useTableStore } from '@/store/useTableStore';
import { useEffect, useRef, useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { Chair, TableSurface } from '../assets';
import { getInitials } from '@/lib/getInitials';
import { TableSheet } from './table-sheet/TableSheet';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@app/shared/components/ui/context-menu';
import { useHistoryStore } from '@/store/useHistorySnapshot';

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
  const updateTablePosition = useTableStore((s) => s.updateTablePosition);
  const updateTableRotation = useTableStore((s) => s.updateTableRotation);
  const removeTable = useTableStore((s) => s.removeTable);
  const guests = useGuestStore((s) => s.guests);
  const [isRotating, setIsRotating] = useState(false);
  const DidDragRef = useRef(false);
  const [assignSeatOpen, setAssignSeatOpen] = useState(false);
  const [activeSeat, setActiveSeat] = useState<{
    tableId: string;
    seatId: string;
  } | null>(null);

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

  const centerX = wrapperWidth / 2;
  const centerY = wrapperHeight / 2;
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rotateStart = useRef({ angle: 0, rotation: 0 });
  const rotatePointerId = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const WORLD_SIZE = 10000;
  const WORLD_HALF = WORLD_SIZE / 2;

  const [hoverGuest, setHoverGuest] = useState<GuestInfoModalData | null>(null);
  const [open, setOpen] = useState(false);

  const visibleSeatCount =
    shape === 'rectangle'
      ? Math.min(seatCount, TABLE_CONFIG.maxRectangleSeats)
      : seatCount;

  const handleAssignSeat = (index: number) => {
    const seatId = `${id}-seat-${index + 1}`
    const alreadySeated = guests.find((g) => g.seat === seatId)

    if (!alreadySeated) {
      setActiveSeat({ tableId: id, seatId })
      setAssignSeatOpen(true)
    }
  }

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      DidDragRef.current = true;
      updateTablePosition(
        tableId,
        e.clientX - offset.current.x,
        e.clientY - offset.current.y,
      );
    };

    const handleUp = () => {
      isDragging.current = false;

      if(DidDragRef.current) {
        useHistoryStore.getState().save();
      }
      
      setTimeout(() => {
        DidDragRef.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [updateTablePosition, tableId]);

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

        useHistoryStore.getState().save();

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

          const seatId = `${id}-seat-${idx + 1}`
          const guest = guests.find((g) => g.seat === seatId)

          return (
            <div
              key={idx}
              className="absolute"
              onClick={() => handleAssignSeat(idx)}
              onMouseEnter={() => {
                if (!guest) return;
                setHoverGuest({
                  tableId: id,
                  seatId,
                  guestId: guest.id,
                  guestName: guest.name,
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

              {guest && (
                <div className="absolute top-1.75 inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="flex items-center justify-center text-xs font-medium bg-background/80 w-7 h-7 rounded-md border border-input"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {getInitials(guest.name ?? '')}
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
            <TableSurface
              x={x}
              y={y}
              name={name}
              shape={shape}
              shapeStyle={shapeStyle}
              TABLE_CONFIG={TABLE_CONFIG}
              isDraggingRef={isDragging}
              offsetRef={offset}
              onClick={() => {
                if (DidDragRef.current) return;
                setOpen(true);
              }}
              tableId={tableId}
            />
            {shape === 'rectangle' && (hovered || isRotating) && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
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
          <ContextMenuContent>
            <ContextMenuItem onClick={() => removeTable(tableId)}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      <TableSheet
        open={open}
        onOpenChange={setOpen}
        tableId={id}
        tableName={name}
        seatCount={seatCount}
        shape={shape}
        rotation={rotation}
      />
    </div>
  );
};