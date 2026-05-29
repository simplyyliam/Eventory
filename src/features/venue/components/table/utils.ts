import { useTableStore } from "@/store/useTableStore";
import { TABLE_CONFIG } from "./table.config";
import type { PopupPlacement } from "./table.types";

export const getPopupPlacement = (x: number, y: number, centerX?: number, centerY?: number): PopupPlacement => {
  const modalGap = 16;
  const cx = typeof centerX === 'number' ? centerX : TABLE_CONFIG.rectangleWidth / 2;
  const cy = typeof centerY === 'number' ? centerY : TABLE_CONFIG.rectangleHeight / 2;
  const distanceFromCenterX = x - cx;
  const distanceFromCenterY = y - cy;

  if (Math.abs(distanceFromCenterX) > Math.abs(distanceFromCenterY)) {
    return {
      top: y,
      left: x + (distanceFromCenterX > 0 ? modalGap : -modalGap),
      transform:
        distanceFromCenterX > 0 ? 'translateY(-50%)' : 'translate(-100%, -50%)',
    };
  }

  return {
    top: y + (distanceFromCenterY > 0 ? modalGap : -modalGap),
    left: x,
    transform:
      distanceFromCenterY > 0 ? 'translateX(-50%)' : 'translate(-50%, -100%)',
  };
};


export const useTableSeatCount = (tableId: string) =>
  useTableStore((s) =>
    s.tables.find(t => t.id === tableId)?.seatCount
  );