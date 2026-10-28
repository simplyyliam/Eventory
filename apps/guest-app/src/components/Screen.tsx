import { motion } from 'motion/react';

export function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">{children}</main>;
}

export function StatusScreen({ loading, title, body, action }: { loading?: boolean; title?: string; body?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        {loading ? (
          <>
            <div className="flex gap-1.5" aria-label="Loading">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 rounded-full bg-ink-faint"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="label">Loading</p>
          </>
        ) : (
          <>
            <p className="font-serif text-[30px] leading-tight">{title}</p>
            {body && <p className="text-[14px] leading-6 text-ink-soft">{body}</p>}
            {action && (
              <button onClick={action.onClick} className="press mt-2 h-12 rounded-full bg-ink px-6 text-[15px] font-medium text-paper">
                {action.label}
              </button>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
