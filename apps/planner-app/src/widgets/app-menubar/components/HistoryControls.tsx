import { IconButton } from "@/shared/components"
import { useHistoryStore } from "@/store/useHistorySnapshot"
import { ButtonGroup } from "@app/shared"
import { Redo02Icon, Undo02Icon } from "@hugeicons/core-free-icons"


export const HistoryControls = () => {
    const undo = useHistoryStore((s) => s.undo)
    const redo = useHistoryStore((s) => s.redo)
    return (
        <ButtonGroup>
            <IconButton Icon={Undo02Icon} onClick={() => undo()}/>
            <IconButton Icon={Redo02Icon} onClick={() => redo()}/>
        </ButtonGroup>
    )
}