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
  } = config;

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
    // Standard professional convention: 
    // Seat 0 = Top End Head, Seat 1 = Bottom End Foot
    // Remaining seats alternate evenly between Left and Right long edges
    if (index === 0) {
      // Top Head Seat
      x = cx;
      y = cy - rectangleHeight / 2 - seatGap;
    } else if (index === 1) {
      // Bottom Foot Seat
      x = cx;
      y = cy + rectangleHeight / 2 + seatGap;
    } else {
      // Side seats calculation
      const sideIndex = index - 2;
      const isLeft = sideIndex % 2 === 0;
      
      // Determine how many total side slots exist per side based on dynamic height
      const totalSidePairs = Math.max(1, Math.floor((seatCount - 2) / 2));
      const pairIndex = Math.floor(sideIndex / 2);

      // Space chairs perfectly proportional to the changing height
      const distributionHeight = rectangleHeight;
      const spacing = distributionHeight / (totalSidePairs + 1);

      x = isLeft 
        ? cx - rectangleWidth / 2 - seatGap 
        : cx + rectangleWidth / 2 + seatGap;
        
      y = (cy - rectangleHeight / 2) + (spacing * (pairIndex + 1));
    }
  }

  return { x, y };
}