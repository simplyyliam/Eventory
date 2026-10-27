import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from '@app/shared';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import { useWorkspace } from '@/store/workspace';
import { plural } from '@/lib/format';
import { detectColumns, download, rowsToGuests, type ImportedGuest } from './csv';

type Parsed = { file: string; guests: ImportedGuest[]; skipped: number; columns: string[] };

const TEMPLATE = 'Name,Email,RSVP,Dietary,Notes\nAmara Okafor,amara@example.com,Yes,Vegetarian,\nTheo Lindqvist,,,,"Needs step-free access"\n';

export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addGuests = useWorkspace((s) => s.addGuests);
  const existing = useWorkspace((s) => s.guests);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    setError(null);
  };

  const read = async (file: File) => {
    setError(null);
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return setError('Use an Excel (.xlsx, .xls) or CSV file.');
    // xlsx is large, so it's only loaded when someone actually imports
    const XLSX = await import('xlsx');
    const book = XLSX.read(await file.arrayBuffer());
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: '' });
    if (rows.length === 0) return setError('That sheet looks empty.');
    const headers = Object.keys(rows[0]);
    const cols = detectColumns(headers);
    if (!cols.name && !cols.first) return setError('Couldn’t find a Name column. Add a header row with “Name” (or “First name” and “Last name”).');
    const known = new Set(existing.map((g) => g.name.toLowerCase()));
    const all = rowsToGuests(rows, cols);
    const fresh = all.filter((g) => !known.has(g.name.toLowerCase()));
    setParsed({ file: file.name, guests: fresh, skipped: all.length - fresh.length, columns: Object.entries(cols).map(([k, v]) => `${v} → ${k}`) });
  };

  const commit = () => {
    if (!parsed) return;
    addGuests(parsed.guests);
    toast.success(`Imported ${plural(parsed.guests.length, 'guest')}`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import guests</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet with a Name column. Email, RSVP, Dietary and Notes are picked up if present.{' '}
            <button className="underline underline-offset-2 hover:text-foreground" onClick={() => download('guest-template.csv', TEMPLATE)}>
              Download a template
            </button>
          </DialogDescription>
        </DialogHeader>

        <input ref={input} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} />

        <AnimatePresence mode="popLayout" initial={false}>
          {!parsed ? (
            <motion.button
              key="drop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files[0]) read(e.dataTransfer.files[0]);
              }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
                dragging ? 'border-brand bg-brand-soft' : 'border-input hover:border-faint hover:bg-canvas',
              )}
            >
              <motion.span animate={{ y: dragging ? -3 : 0 }} className="grid size-9 place-items-center rounded-lg border border-hairline bg-surface text-muted-foreground">
                <Upload className="size-4" />
              </motion.span>
              <span className="text-[13px] font-medium">{dragging ? 'Drop to upload' : 'Click to choose a file, or drag it here'}</span>
              <span className="text-[12px] text-muted-foreground">.xlsx, .xls or .csv</span>
              {error && <span className="mt-1 text-[12px] text-bad">{error}</span>}
            </motion.button>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-hairline px-3 py-2.5">
                <FileSpreadsheet className="size-4 text-ok" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium">{parsed.file}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {plural(parsed.guests.length, 'new guest')}
                    {parsed.skipped > 0 && ` · ${parsed.skipped} already on the list`}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-hairline">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-hairline bg-canvas px-3 py-1.5 text-[11.5px] text-muted-foreground">
                  <span>Name</span>
                  <span>RSVP</span>
                  <span>Dietary</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {parsed.guests.slice(0, 50).map((g, i) => (
                    <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-hairline px-3 py-1.5 text-[12.5px] last:border-b-0">
                      <span className="truncate">{g.name}</span>
                      <span className="text-muted-foreground">{g.status === 'confirmed' ? 'Attending' : g.status === 'declined' ? 'Declined' : 'Awaiting'}</span>
                      <span className="truncate text-muted-foreground">{g.dietary.join(', ') || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11.5px] text-faint">Matched columns: {parsed.columns.join(', ')}</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={commit} disabled={parsed.guests.length === 0}>
                  Import {plural(parsed.guests.length, 'guest')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
