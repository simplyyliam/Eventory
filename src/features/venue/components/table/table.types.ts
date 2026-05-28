export type SeatPosition = {
  x: number;
  y: number;
};

export type TableLayoutConfig = {
  center: number;
  circleRadius: number;
  rectangleWidth: number;
  rectangleHeight: number;
  seatGap: number;
  maxRectangleSeats: number;
  maxRectangleSideSeats: number;
};
