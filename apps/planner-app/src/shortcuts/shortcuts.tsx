export const createShortcuts = (ctx: {
    undo: () => void
    redo: () => void
}) => [
    {
        match: (e: KeyboardEvent) => 
            e.ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey,
        action: ctx.undo
    },
    {
        match: (e: KeyboardEvent) => 
            e.ctrlKey && e.key.toLowerCase() === 'y' && !e.shiftKey,
        action: ctx.redo
    },
]