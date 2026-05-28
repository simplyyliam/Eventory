import { TABLE_CONFIG } from "./table.config";
import type { PopupPlacement } from "./table.types";

export const getPopupPlacement = (x: number, y: number): PopupPlacement => {
  const modalGap = 16;
  const distanceFromCenterX = x - TABLE_CONFIG.center;
  const distanceFromCenterY = y - TABLE_CONFIG.center;

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