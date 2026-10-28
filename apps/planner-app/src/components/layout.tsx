import { motion } from 'motion/react';
import { cn } from '@app/shared';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn('inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-[4px] border border-hairline bg-surface px-1 font-sans text-[10.5px] font-medium text-muted-foreground shadow-[0_1px_0_var(--hairline)]', className)}>
      {children}
    </kbd>
  );
}


export function PageHeader({ title, description, actions, meta }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="flex items-baseline gap-2 text-[22px] font-semibold tracking-[-0.02em] text-foreground">
          {title}
          {meta && <span className="text-[22px] font-normal text-faint tabular">{meta}</span>}
        </h1>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Content enters with a short rise; anything that appears on every visit stays quick.
export function Page({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(6px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className={cn('mx-auto flex w-full flex-col gap-8 px-6 py-8 md:px-10 md:py-10', wide ? 'max-w-6xl' : 'max-w-4xl', className)}
    >
      {children}
    </motion.div>
  );
}

export function Section({ title, action, children, className }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-[13px] font-medium text-muted-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-surface shadow-[0_0_0_1px_var(--hairline),0_1px_2px_rgb(0_0_0/0.03)]', className)} {...props}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      {icon && (
        <div className="grid size-10 place-items-center rounded-xl bg-surface text-muted-foreground shadow-[0_0_0_1px_var(--hairline),0_2px_6px_-2px_rgb(0_0_0/0.08)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-medium">{title}</p>
        {description && <p className="max-w-xs text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
