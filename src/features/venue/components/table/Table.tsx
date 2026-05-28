import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatModal } from '@/features/guests';
import type { PopupPlacement } from './table.types';
import { getPopupPlacement, useTableSeatCount } from './utils';
import { useModalStore } from '@/store/useModalStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { useTableStore } from '@/store/useTableStore';
import { useState } from 'react';

interface TableProps {
  shape: 'circle' | 'rectangle';
  seatCount?: number;
  id: string;
  name: string;
  tableId: string;
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
}: TableProps) => {
  const modalId = useModalStore((s) => s.modalId);
  const modalData = useModalStore((s) => s.modalData);
  const openModal = useModalStore((s) => s.openModal);
  const updateTableSeats = useTableStore((s) => s.updateTableSeats);
  const storeSeats = useTableSeatCount(tableId);

  const [inputValue, setInputValue] = useState(String(storeSeats));

  const assignSeatModalData =
    modalId === 'AssignSeatModal' && (modalData as AssignSeatModalData)?.tableId === id
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

  return (
    <div className="relative h-96 w-96">
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

      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground ${shapeStyle[shape]}`}
            style={{
              width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
              height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
            }}
          >
            {name}
          </div>
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
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};