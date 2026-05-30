export const getSeatLabel = (seatId: string) => {
  const parts = seatId.split('-');
  return `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;
}