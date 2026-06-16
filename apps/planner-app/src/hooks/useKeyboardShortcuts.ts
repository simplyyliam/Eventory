import { createShortcuts } from "@/shortcuts/shortcuts"
import { useHistoryStore } from "@/store/useHistorySnapshot"
import { useEffect } from "react"

export const useKeyboardShortcuts = () => {
    const undo = useHistoryStore((s) => s.undo)
    const redo = useHistoryStore((s) => s.redo)

    useEffect(() => {
        const shortcuts = createShortcuts({undo, redo})

        const handleKeydown = (e: KeyboardEvent) => {
            for  (const shortcut of shortcuts) {
                if(shortcut.match(e)) {
                    e.preventDefault()
                    shortcut.action()
                    return
                }
            }
        }

        window.addEventListener('keydown', handleKeydown)

        return () => 
            window.removeEventListener('keydown', handleKeydown)

    }, [])
}