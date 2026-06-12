import { EventDeletionDialog } from "@/features/events/components"
import { useEventStore } from "@/store/useEventStore"
import { EditableName, DropdownMenu, DropdownMenuTrigger, Button, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from "@app/shared"
import type { EditableNameHandle } from "@app/shared/components/custom/EditableName"
import type { EventResponse } from "@app/shared/types/event.types"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export const EventLink = ({ event }: { event: EventResponse }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const nameRef = useRef<EditableNameHandle>(null)
  const renameEvent = useEventStore((s) => s.renameEvent)

  return (
    <>
    <div
      onClick={() => navigate('/loading', { state: { destination: `/venue/${event.slug}`, eventName: event.name } })}
      className="flex items-center justify-between rounded-md border bg-background px-4 py-3 text-sm transition-colors hover:bg-accent cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <EditableName
          ref={nameRef}
          name={event.name}
          onSave={(newName) => renameEvent(event.id, event.slug, newName)}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{event.status}</span>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="link"><HugeiconsIcon icon={MoreHorizontalIcon}/></Button>}/>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => nameRef.current?.startEditing()}>
                  Rename Event
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
      <EventDeletionDialog open={open} onOpenChange={setOpen} eventName={event.name} eventSlug={event.slug} eventId={event.id}/>
    </>
  )
}