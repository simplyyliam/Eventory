import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@app/shared';

// Digits roll up when the value grows and down when it shrinks, so a changing
// count reads as movement rather than a flicker.
export function RollingNumber({ value, className, format }: { value: number; className?: string; format?: (n: number) => string }) {
  const reduce = useReducedMotion();
  // remember the last value to know which way to roll (adjusting state during render is fine here)
  const [last, setLast] = useState({ value, direction: 1 });
  if (last.value !== value) setLast({ value, direction: value >= last.value ? 1 : -1 });
  const direction = last.value !== value ? (value >= last.value ? 1 : -1) : last.direction;
  const text = format ? format(value) : value.toLocaleString();

  return (
    <span className={cn('tabular relative inline-flex overflow-hidden', className)} aria-label={text}>
      {text.split('').map((char, i) => (
        <span key={`${text.length - i}`} className="relative inline-block" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              key={char}
              className="inline-block"
              custom={direction}
              initial={reduce ? { opacity: 0 } : { y: `${70 * direction}%`, opacity: 0, filter: 'blur(2px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { y: `${-70 * direction}%`, opacity: 0, filter: 'blur(2px)' }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
