import { AnimatePresence, motion } from "motion/react";
import { GuestDetailsCard } from "./GuestDetailsCard";
import { MessageCard } from "./MessageCard";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface GuestInfo {
    eventName: string;
    guestName: string;
    seatNumber?: string;
    tableNumber?: number;
    tableName?: string;
}

export const GuestInfo = ({
    eventName,
    guestName,
    tableName,
}: GuestInfo) => {
    const [showMessage, setShowMessage] = useState(false);

    return (
        <GuestDetailsCard>
            <span className="text-center capitalize">
                {eventName}
            </span>

            <div className="relative flex items-end p-2.5 w-full h-full bg-[url('/jill-richard-event.jpg')] rounded-[35px] bg-cover bg-center overflow-hidden">

                <AnimatePresence>
                    {!showMessage && (
                        <motion.button
                            key="message-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: [1, 1.06, 1, 1.02, 1, 1, 1, 1, 1, 1, 1],
                                y: [0, -10, 0, -4, 0, 0, 0, 0, 0, 0, 0],
                                rotate: [0, 0, 0, 0, 0, -3, 3, -2, 1, 0, 0],
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                                opacity: { duration: 0.15 },
                                scale: {
                                    times: [0, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: "easeInOut",
                                },
                                y: {
                                    times: [0, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: "easeInOut",
                                },
                                rotate: {
                                    times: [0, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: "easeInOut",
                                },
                            }}
                            whileTap={{ scale: 0.92, rotate: 0 }}
                            onClick={() => setShowMessage(true)}
                            className="
                                absolute
                                bottom-4
                                right-4
                                z-20
                                flex
                                items-center
                                justify-center
                                size-14
                                rounded-[18px]
                                bg-white/95
                                shadow-lg
                                backdrop-blur-sm
                            "
                        >
                            <MessageCircle size={22} />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showMessage && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[2px]"
                                onClick={() => setShowMessage(false)}
                            />
                            <MessageCard guestName={guestName} />
                        </>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col h-fit gap-2.5 p-2.5 w-full">
                <div className="flex flex-col">
                    <span className="text-[20px] text-muted-foreground font-medium">
                        Welcome
                    </span>
                    <span className="text-[40px] font-instrumentSerif">
                        {guestName}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[20px] text-muted-foreground font-medium">
                        Table
                    </span>
                    <span className="text-[40px] font-instrumentSerif">
                        {tableName}
                    </span>
                </div>
            </div>
        </GuestDetailsCard>
    );
};