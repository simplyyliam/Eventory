import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, cn } from '@app/shared';
import { Textarea } from '@app/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import { useWorkspace } from '@/store/workspace';
import type { Guest, RsvpStatus } from '@/domain/types';
import { rsvpLabel } from '@/components/status';

const COMMON_DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Nut allergy', 'Dairy-free', 'Pescatarian'];

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft('');
  };
  const suggestions = COMMON_DIETS.filter((d) => !value.includes(d));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-surface px-1.5 py-1 focus-within:ring-2 focus-within:ring-ring/30">
        {value.map((tag) => (
          <span key={tag} className="inline-flex h-5.5 items-center gap-1 rounded-[4px] bg-subtle pr-0.5 pl-1.5 text-[12px]">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((v) => v !== tag))} className="grid size-4 place-items-center rounded-[3px] text-faint hover:bg-accent hover:text-foreground">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? '' : 'Type and press Enter'}
          className="h-5.5 min-w-24 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-faint"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 6).map((d) => (
            <button type="button" key={d} onClick={() => add(d)} className="pressable h-5.5 rounded-[4px] border border-dashed border-input px-1.5 text-[11.5px] text-muted-foreground hover:border-faint hover:text-foreground">
              + {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUSES: RsvpStatus[] = ['confirmed', 'pending', 'declined'];

export function GuestDialog({ guest, open, onOpenChange }: { guest: Guest | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const addGuests = useWorkspace((s) => s.addGuests);
  const updateGuest = useWorkspace((s) => s.updateGuest);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RsvpStatus>('pending');
  const [dietary, setDietary] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [another, setAnother] = useState(false);

  // reset the form each time it opens, for whichever guest it opened with
  const formFor = open ? (guest?.id ?? 'new') : null;
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (formFor !== loadedFor) {
    setLoadedFor(formFor);
    if (formFor) {
      setName(guest?.name ?? '');
      setEmail(guest?.email ?? '');
      setStatus(guest?.status ?? 'pending');
      setDietary(guest?.dietary ?? []);
      setNotes(guest?.comments ?? '');
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name: name.trim(), email: email.trim() || null, status, dietary, comments: notes.trim() || null };
    if (guest) updateGuest(guest.id, data);
    else addGuests([data]);
    if (!guest && another) {
      setName('');
      setEmail('');
      setDietary([]);
      setNotes('');
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edit guest' : 'Add guest'}</DialogTitle>
          <DialogDescription>{guest ? 'Changes save automatically.' : 'You can seat them on the floor plan afterwards.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            Name
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-9" />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            Email <span className="sr-only">(optional)</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" className="h-9" />
          </label>
          <div className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            RSVP
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-subtle p-0.5">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn('h-7 rounded-md text-[12.5px] transition-colors', status === s ? 'bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--hairline)]' : 'hover:text-foreground')}
                >
                  {rsvpLabel[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            Dietary requirements
            <TagInput value={dietary} onChange={setDietary} />
          </div>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            Notes
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Accessibility needs, plus-ones, anything the venue should know" />
          </label>
          <div className="flex items-center justify-between gap-2">
            {!guest ? (
              <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                <input type="checkbox" checked={another} onChange={(e) => setAnother(e.target.checked)} className="size-3.5 accent-foreground" />
                Add another
              </label>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                {guest ? 'Save' : 'Add guest'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
