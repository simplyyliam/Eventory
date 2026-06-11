import { GuestDetailsCard } from "./GuestDetailsCard"

interface TicketCardProps {
    eventName: string
    guestName: string
    seatNumber: string
    tableNumber: number
}

export const TicketCard = ({eventName, guestName, seatNumber, tableNumber}: TicketCardProps) => {
    return (
        <GuestDetailsCard className="Dotted">
            <div className="flex items-center gap-2.5 w-full h-56.25">
                <div className="w-full h-full p-2.5">
                    <span className="text-[32px] font-medium">{`${eventName}`}</span>
                </div>
                <div className="w-full h-full rounded-3xl overflow-hidden">
                    <img src="/rose.jpg" alt="event-banner" className="h-full w-full"/>
                </div>
            </div>
            <div className="flex flex-col gap-2.5 p-2.5 w-full h-full">
                <div className="flex flex-col">
                    <span className="text-[25px] font-medium text-muted-foreground">Guest</span>
                    <span className="text-[35px] font-semibold">{guestName}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[25px] font-medium text-muted-foreground">Seat</span>
                    <span className="text-[35px] font-semibold">{seatNumber}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[25px] font-medium text-muted-foreground">Table</span>
                    <span className="text-[35px] font-semibold">{tableNumber}</span>
                </div>
            </div>
        </GuestDetailsCard>
    )
}