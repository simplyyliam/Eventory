import { IconButton } from "@/shared/components"
import { useEditorStore } from "@/store/useEditor"


export const SnapToGrid = () => {
    const snap = useEditorStore((s) => s.snapToGrid) 
    const toggleSnap = useEditorStore((s) => s.toggleSnapToGrid) 

    return (
        <IconButton onClick={toggleSnap} Label={snap ? "Snap On" : "Snap Off"}/>
    )
}