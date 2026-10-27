import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ListChecks, Plus, X } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { useWorkspace } from '@/store/workspace';
import { ProgressRing } from '@/components/ProgressRing';
import { Card, EmptyState } from '@/components/layout';
import type { ChecklistItem } from '@/domain/types';

// The usual run-up for a seated event, roughly in the order it happens.
const SUGGESTED = [
  'Confirm the venue booking and room layout',
  'Send invitations',
  'Chase outstanding RSVPs',
  'Collect dietary requirements',
  'Give the caterer final numbers',
  'Finalise the seating plan',
  'Print table numbers and place cards',
  'Share the guest QR code',
  'Walk the venue team through the layout',
];

const NONE: ChecklistItem[] = [];

const item = (title: string): ChecklistItem => ({ id: crypto.randomUUID(), title, done: false });

function Row({ task, onToggle, onRemove }: { task: ChecklistItem; onToggle: () => void; onRemove: () => void }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="group overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <button
          role="checkbox"
          aria-checked={task.done}
          aria-label={task.title}
          onClick={onToggle}
          className={cn(
            'pressable grid size-4.5 shrink-0 place-items-center rounded-[5px] border transition-colors',
            task.done ? 'border-ok bg-ok text-white' : 'border-input bg-surface hover:border-faint',
          )}
        >
          <AnimatePresence initial={false}>
            {task.done && (
              <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.35 }}>
                <Check className="size-3" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <span className="flex-1">
        <span className={cn('relative text-[13px] transition-colors duration-300', task.done && 'text-faint')}>
          {task.title}
          <motion.span
            aria-hidden
            className="absolute top-1/2 left-0 h-px w-full origin-left bg-faint"
            initial={false}
            animate={{ transform: `scaleX(${task.done ? 1 : 0})` }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          />
        </span>
        </span>
        <button
          aria-label="Remove task"
          onClick={onRemove}
          className="grid size-6 place-items-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </motion.li>
  );
}

export function Checklist() {
  const items = useWorkspace((s) => s.details.checklist ?? NONE);
  const setChecklist = useWorkspace((s) => s.setChecklist);
  const [draft, setDraft] = useState('');
  const done = items.filter((i) => i.done).length;

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ListChecks className="size-4.5" />}
          title="No checklist yet"
          description="Start from a list of the usual steps before a seated event, then edit it."
          action={
            <Button variant="outline" onClick={() => setChecklist(SUGGESTED.map(item))}>
              Use suggested checklist
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-2.5">
        <ProgressRing value={done / items.length} className={done === items.length ? 'text-ok' : 'text-foreground'} />
        <span className="text-[13px] tabular text-muted-foreground">
          {done} of {items.length} done
        </span>
      </div>
      <ul className="py-1">
        <AnimatePresence initial={false}>
          {items.map((task) => (
            <Row
              key={task.id}
              task={task}
              onToggle={() => setChecklist(items.map((i) => (i.id === task.id ? { ...i, done: !i.done } : i)))}
              onRemove={() => setChecklist(items.filter((i) => i.id !== task.id))}
            />
          ))}
        </AnimatePresence>
      </ul>
      <form
        className="flex items-center gap-3 border-t border-hairline px-4 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setChecklist([...items, item(draft.trim())]);
          setDraft('');
        }}
      >
        <Plus className="size-4 shrink-0 text-faint" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task"
          className="h-8 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
        />
      </form>
    </Card>
  );
}
