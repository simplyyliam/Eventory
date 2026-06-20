import { getInitials } from "@/lib/getInitials";
import { GuestCard, IconButton } from "@/shared/components";
import { useGuestStore } from "@/store/useGuestStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@app/shared/components/ui/dialog";
import { Input } from "@app/shared/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { ListFilter } from "lucide-react";
import { useState } from "react";

interface GuestListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.06,
      ease: "easeOut" as const,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      opacity: { duration: 0.2 },
      filter: { duration: 0.2 },
      y: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
      },
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(4px)",
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn" as const,
    },
  },
};

const getSurname = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? "";
};

const formatSurnameFirst = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length <= 1) return fullName;

  const surname = parts.pop();
  const firstNames = parts.join(" ");

  return `${surname}, ${firstNames}`;
};

export const GuestListDialog = ({
  open,
  onOpenChange,
}: GuestListDialogProps) => {
  const guests = useGuestStore((s) => s.guests);
  const [query, setQuery] = useState("");

  const filteredGuests = guests
    .filter((guest) => {
      const name = guest.name.toLowerCase();
      const qry = query.toLowerCase();

      return name.includes(qry);
    })
    .sort((a, b) => {
      const surnameA = getSurname(a.name).toLowerCase();
      const surnameB = getSurname(b.name).toLowerCase();

      const surnameComparison = surnameA.localeCompare(surnameB, undefined, {
        sensitivity: "base",
      });

      if (surnameComparison !== 0) {
        return surnameComparison;
      }

      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });

const exportAllGuests = () => {
  const guests = useGuestStore.getState().guests;

  console.log("TOTAL:", guests.length);

  const names = guests.map((g) => g.name);

  navigator.clipboard.writeText(JSON.stringify(names, null, 2));
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="w-full max-w-md flex flex-col max-h-[70vh] p-0 gap-0"
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-input shrink-0">
          <DialogTitle>Guest List</DialogTitle>

          <DialogDescription>
            All the guests in this event.
          </DialogDescription>

          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the guests name"
            />

            <button
              onClick={() => {}}
              className="h-9 px-2 rounded-md border border-input flex items-center gap-1 text-muted-foreground hover:bg-accent transition-colors shrink-0 opacity-50 cursor-not-allowed"
            >
              <span className="text-xs font-medium">A–Z</span>
              <ListFilter size={16} />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-3 py-3">
          {filteredGuests.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-0.5"
              >
                {filteredGuests.map((guest) => (
                  <motion.div key={guest.id} variants={itemVariants}>
                    <GuestCard
                      name={formatSurnameFirst(guest.name ?? "")}
                      initials={getInitials(guest.name ?? "")}
                      guestId={guest.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                No guests found
              </span>
            </div>
          )}
        </div>

        {guests.length > 0 && (
          <div className="px-4 py-3 border-t border-input shrink-0">
            <span className="text-xs text-muted-foreground">
              {guests.length} unseated{" "}
              {guests.length === 1 ? "guest" : "guests"}
            </span>
          </div>
        )}
        <IconButton onClick={exportAllGuests} Label="Export Guest List"/>
      </DialogContent>
    </Dialog>
  );
};