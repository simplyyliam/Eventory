import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@app/shared';

const base =
  'h-8 w-full rounded-lg border border-input bg-surface px-2.5 text-[13px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-ring/50 focus:ring-2 focus:ring-ring/20';

// Commits on blur or Enter so each keystroke doesn't trigger a save.
export function CommitInput({
  value,
  onCommit,
  className,
  multiline,
  ...props
}: { value: string; onCommit: (v: string) => void; multiline?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>) {
  const [draft, setDraft] = useState(value);
  // pick up outside changes (undo, another tab) without an effect
  const [source, setSource] = useState(value);
  if (value !== source) {
    setSource(value);
    setDraft(value);
  }
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  if (multiline) {
    return (
      <textarea
        value={draft}
        placeholder={props.placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        rows={4}
        className={cn(base, 'h-auto resize-none py-2 leading-5', className)}
      />
    );
  }
  return (
    <input
      {...props}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setDraft(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn(base, className)}
    />
  );
}

export function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-hairline px-5 py-4 last:border-b-0 md:grid-cols-[1fr_1.3fr] md:items-start md:gap-8">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium">{label}</span>
        {hint && <span className="text-[12.5px] text-muted-foreground">{hint}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-5 w-8.5 shrink-0 rounded-full p-0.5 transition-colors duration-200', checked ? 'bg-ok' : 'bg-input')}
    >
      <motion.span
        className="block size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)]"
        animate={{ x: checked ? 14 : 0 }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0.15 }}
      />
    </button>
  );
}
