import type { SeatPosition, TableLayoutConfig } from "./table.types";


export function getSeatPosition(
  shape: 'circle' | 'rectangle',
  index: number,
  seatCount: number,
  config: TableLayoutConfig,
): SeatPosition {
  const {
    center,
    circleRadius,
    rectangleWidth,
    rectangleHeight,
    seatGap,
    maxRectangleSeats,
    maxRectangleSideSeats,
  } = config;

  let x = center;
  let y = center;

  if (shape === 'circle') {
    const angle = (index / seatCount) * Math.PI * 2;

    x = center + circleRadius * Math.cos(angle);
    y = center + circleRadius * Math.sin(angle);
  }

  if (shape === 'rectangle') {
    const visibleSeatCount = Math.min(seatCount, maxRectangleSeats);

    const sideSeatCount = Math.min(
      visibleSeatCount,
      maxRectangleSideSeats * 2,
    );

    const leftSideCount = Math.ceil(sideSeatCount / 2);
    const rightSideCount = sideSeatCount - leftSideCount;

    const left = center - rectangleWidth / 2 - seatGap;
    const right = center + rectangleWidth / 2 + seatGap;
    const top = center - rectangleHeight / 2 - seatGap;
    const tableTop = center - rectangleHeight / 2;

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

      x = center;
      y = endIndex === 0 ? top : center + rectangleHeight / 2 + seatGap;
    }
  }

  return { x, y };
}