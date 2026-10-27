import { motion } from 'motion/react';
import { cn } from '@app/shared';

export function ProgressRing({ value, size = 16, stroke = 2, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn('-rotate-90 shrink-0', className)} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - v) }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0 }}
      />
    </svg>
  );
}

export function ProgressBar({ value, className, tone = 'bg-foreground' }: { value: number; className?: string; tone?: string }) {
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-subtle', className)}>
      <motion.div
        className={cn('h-full origin-left rounded-full', tone)}
        initial={false}
        animate={{ transform: `scaleX(${v})` }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0 }}
      />
    </div>
  );
}
