export type SeatPosition = {
  x: number;
  y: number;
};

export type TableLayoutConfig = {
  circleRadius: number;
  rectangleWidth: number;
  rectangleHeight: number;
  seatGap: number;
  maxRectangleSeats: number;
  maxRectangleSideSeats: number;
};


export type PopupPlacement = {
  top: number;
  left: number;
  transform: string;
};