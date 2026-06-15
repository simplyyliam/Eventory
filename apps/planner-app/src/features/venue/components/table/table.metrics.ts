export const getRectangleSeatCount = (height: number) => {
  return 2 + Math.floor(height / 75) * 2;
};

export const getTableSeatCount = (table: {
  shape: string;
  height?: number;
  seatCount?: number;
}) => {
  if (table.shape === 'rectangle') {
    return getRectangleSeatCount(table.height ?? 300);
  }

  return table.seatCount ?? 0;
};