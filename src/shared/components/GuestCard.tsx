
interface GuestCardProps {
    key: string,
    onClick: () => void,
    initials: string,
    name: string,
    table?: string,
    seat?: string,
}

export const GuestCard = ({key, onClick, initials, name, table, seat}:GuestCardProps) => {
  return (
    <div
      key={key}
      onClick={onClick}
      className="flex gap-2 items-center p-2.5 hover:bg-muted transition-all ease-linear rounded-md"
    >
      <div className="flex items-center justify-center w-7 h-7 border border-input rounded-md">
        {initials}
      </div>
      <div className="flex flex-col">
        <span>{name}</span>
        {table && seat && (
          <span className="text-xs text-muted-foreground">{table} - Seat {seat}</span>
        )}
      </div>
    </div>
  );
};

