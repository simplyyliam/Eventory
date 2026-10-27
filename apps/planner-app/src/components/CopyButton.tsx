import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@app/shared';

export function CopyButton({ value, label = 'Copy link', variant = 'outline' }: { value: string; label?: string; variant?: 'outline' | 'default' | 'ghost' }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(3px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.5, opacity: 0, filter: 'blur(3px)' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            {copied ? <Check className="size-4 text-ok" strokeWidth={2.25} /> : <Copy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      {copied ? 'Copied' : label}
    </Button>
  );
}
