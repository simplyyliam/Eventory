import { IconButton } from "@/shared/components"
import { useEventStore } from "@/store/useEventStore"
import { Input, Label } from "@app/shared"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@app/shared/components/ui/dialog"
import { Field, FieldGroup } from "@app/shared/components/ui/field"
import { useEffect, useState } from "react"

interface EventDeletionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    eventName: string
    eventSlug: string
    eventId: string
}

export const EventDeletionDialog = ({open, onOpenChange, eventName, eventSlug, eventId}:EventDeletionDialogProps) => {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const deleteEvent = useEventStore((s) => s.deleteEvent)

    const hasError = name.length > 0 && name.trim() !== eventSlug;
    const canDelete = name.trim() === eventSlug;

    const handleDeleteEvent = async () => {
        if (!canDelete) return;

        setLoading(true);

        try {
            await deleteEvent(eventId, eventSlug);
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) {
            setName("");
        }
    }, [open]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
             <DialogHeader>
                <DialogTitle>{`Delete ${eventName}`}</DialogTitle>
                <DialogDescription>
                    {`This will permanently delete ${eventName} and its related resources like Guests, Tables, and Seatings.`}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup>
            <Field data-invalid={hasError}>
              <Label htmlFor="delete-event">Delete</Label>
              <DialogDescription>{`To confirm, type ${eventSlug}`}</DialogDescription>
            <Input id="delete-event" name="delete" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Delete ${eventSlug}`} disabled={loading} aria-invalid={hasError} className={`py-5 px-2.75 ${hasError ? "placeholder-red-600" : ""}`}/>
            </Field>
          </FieldGroup>
            <DialogFooter>
                <IconButton stretch loading={loading} disabled={!canDelete || loading} Label={loading ? `Deleting ${eventName}` : `Delete ${eventName}`} className="py-5" onClick={handleDeleteEvent}/>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}