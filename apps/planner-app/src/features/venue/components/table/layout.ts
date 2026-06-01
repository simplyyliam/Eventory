import type { SeatPosition, TableLayoutConfig } from "./table.types";


export function getSeatPosition(
  shape: 'circle' | 'rectangle',
  index: number,
  seatCount: number,
  config: TableLayoutConfig,
  centerX?: number,
  centerY?: number
): SeatPosition {
  const {
    circleRadius,
    rectangleWidth,
    rectangleHeight,
    seatGap,
    maxRectangleSeats,
    maxRectangleSideSeats,
  } = config;

  // compute reasonable defaults when center isn't provided
  const defaultCx = shape === 'circle' ? circleRadius : rectangleWidth / 2;
  const defaultCy = shape === 'circle' ? circleRadius : rectangleHeight / 2;

  const cx = typeof centerX === 'number' ? centerX : defaultCx;
  const cy = typeof centerY === 'number' ? centerY : defaultCy;

  let x = cx;
  let y = cy;

  if (shape === 'circle') {
    const angle = (index / seatCount) * Math.PI * 2;

    x = cx + circleRadius * Math.cos(angle);
    y = cy + circleRadius * Math.sin(angle);
  }

  if (shape === 'rectangle') {
    const visibleSeatCount = Math.min(seatCount, maxRectangleSeats);

    const sideSeatCount = Math.min(
      visibleSeatCount,
      maxRectangleSideSeats * 2,
    );

    const leftSideCount = Math.ceil(sideSeatCount / 2);
    const rightSideCount = sideSeatCount - leftSideCount;

    const left = cx - rectangleWidth / 2 - seatGap;
    const right = cx + rectangleWidth / 2 + seatGap;
    const top = cy - rectangleHeight / 2 - seatGap;
    const tableTop = cy - rectangleHeight / 2;

    if (index < leftSideCount) {
      const spacing = rectangleHeight / (leftSideCount + 1);

      x = left;
      y = tableTop + spacing * (index + 1);
    } else if (index < sideSeatCount) {
      const rightIndex = index - leftSideCount;
      const spacing = rectangleHeight / (rightSideCount + 1);

      x = right;
      y = tableTop + spacing * (rightIndex + 1);
    } else {
      const endIndex = index - sideSeatCount;

      x = cx;
      y = endIndex === 0 ? top : cy + rectangleHeight / 2 + seatGap;
    }
  }

  return { x, y };
}