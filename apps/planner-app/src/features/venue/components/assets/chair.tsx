interface ChairProps {
  idx: number;
}

export const Chair = ({ idx }: ChairProps) => {
  return (
    <img
      src="/textures/chair-1.3.png"
      alt={`Seat ${idx + 1}`}
      className="w-full h-full object-contain pointer-events-none select-none"
      loading="eager" // Ensures chairs don't flicker when the seat count changes dynamically
    />
  );
};
