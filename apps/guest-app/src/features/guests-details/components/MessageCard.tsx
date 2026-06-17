import { motion } from "motion/react";
import { GuestDetailsCard } from "./GuestDetailsCard";

interface MessageCardProps {
    guestName: string;
}

export const MessageCard = ({ guestName }: MessageCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 32,
                mass: 0.7,
                opacity: { duration: 0.15, ease: "easeOut" },
            }}
            className="w-[320px] z-20"
        >
            <GuestDetailsCard className="flex flex-col gap-3 p-6 rounded-[25px] shadow-xl backdrop-blur-sm">
                <span className="text-center text-lg font-medium tracking-wide text-slate-700">
                    Dear {guestName},
                </span>
                <p className="text-center text-sm leading-7 text-slate-600">
                    Having you here to share in our{" "}
                    <span className="font-semibold text-slate-800">
                        60th Birthday Celebration
                    </span>{" "}
                    means the world to both of us.
                    <br />
                    <br />
                    Thank you for your warm wishes, your generous presence,
                    and for being such a wonderful part of our lives.
                </p>
                <span className="mt-2 text-center text-sm italic text-slate-500">
                    With love and gratitude
                </span>
            </GuestDetailsCard>
        </motion.div>
    );
};