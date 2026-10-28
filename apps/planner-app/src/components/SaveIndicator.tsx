import { AnimatePresence, motion } from 'motion/react';
import { Check, CloudOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSaveStatus, flushSave } from '@/store/autosave';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';

function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function SaveIndicator() {
  const { status, savedAt, pending } = useSaveStatus();
  const now = useNow(15_000);
  const state = status === 'error' ? 'error' : status === 'saving' || pending ? 'saving' : savedAt ? 'saved' : 'idle';
  const label =
    state === 'error' ? 'Not saved' : state === 'saving' ? 'Saving' : state === 'saved' ? 'Saved' : 'Up to date';
  const tip =
    state === 'error'
      ? 'Couldn’t reach the server. Click to retry.'
      : savedAt
        ? `Last saved ${formatDistanceToNowStrict(savedAt, { addSuffix: true })}`
        : 'Changes save automatically';
  void now;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={() => {
              useSaveStatus.setState({ pending: true });
              void flushSave();
            }}
            className="pressable flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
          />
        }
      >
        <span className="relative grid size-3.5 place-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {state === 'saving' ? (
              <motion.span
                key="dot"
                className="size-1.5 rounded-full bg-warn"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.35, 1], opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ scale: { repeat: Infinity, duration: 1.2 }, opacity: { duration: 0.15 } }}
              />
            ) : state === 'error' ? (
              <motion.span key="err" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                <CloudOff className="size-3.5 text-bad" />
              </motion.span>
            ) : (
              <motion.span key="ok" initial={{ scale: 0.6, opacity: 0, filter: 'blur(2px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }}>
                <Check className="size-3.5 text-ok" strokeWidth={2.25} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="tabular">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tip}</TooltipContent>
    </Tooltip>
  );
}
