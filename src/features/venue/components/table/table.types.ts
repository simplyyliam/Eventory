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


export interface TableProps {
  shape: 'circle' | 'rectangle';
  seatCount?: number;
  id: string;
  name: string;
  tableId: string;
  x: number;
  y: number;
  rotation: number;
}

export type AssignSeatModalData = {
  tableId: string;
  seatId: string;
  seatIndex: number;
  placement: PopupPlacement;
};

export type GuestInfoModalData = {
  tableId: string;
  seatId: string;
  guestName: string;
  guestId: string;
  placement: PopupPlacement;
};

export const shapeStyle: Record<'circle' | 'rectangle', string> = {
  circle: 'rounded-full',
  rectangle: 'rounded-[2px]',
};