import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { initials, matches, usePublicEvent } from '@/lib/event';
import { Screen, StatusScreen } from '@/components/Screen';

export function EventPage() {
  const { slug } = useParams();
  const { data: event, loading, error, retry } = usePublicEvent(slug);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!event || !query.trim()) return [];
    return event.guests.filter((g) => matches(g.name, query)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 12);
  }, [event, query]);

  if (loading) return <StatusScreen loading />;
  if (error || !event)
    return <StatusScreen title="This page isn’t available" body="The event may not be published yet. Check the link, or ask your host." action={{ label: 'Try again', onClick: retry }} />;

  const meta = event.metadata ?? {};
  const tableName = new Map(event.tables.map((t) => [t.id, t.name]));
  const when = [meta.date ? format(parseISO(meta.date), 'EEE d MMM yyyy') : null, meta.startTime].filter(Boolean).join(' · ');

  return (
    <Screen>
      <motion.header
        initial={{ opacity: 0, transform: 'translateY(-8px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="grain relative overflow-hidden rounded-b-[32px] bg-accent px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-9 text-accent-ink"
      >
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase opacity-75">{when || 'You’re invited'}</p>
        <h1 className="mt-10 font-serif text-[46px] leading-[0.98] tracking-[-0.01em] text-balance">{event.name}</h1>
        {meta.venueName && <p className="mt-4 font-mono text-[11px] tracking-[0.14em] uppercase opacity-80">{meta.venueName}</p>}
      </motion.header>

      <motion.section
        initial={{ opacity: 0, transform: 'translateY(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ delay: 0.12, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-[max(env(safe-area-inset-bottom),2rem)]"
      >
        <div className="flex flex-col gap-1 px-1">
          <p className="label">Find your seat</p>
          <h2 className="font-serif text-[30px] leading-tight">What’s your name?</h2>
        </div>

        <label className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-card px-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] focus-within:border-ink/30 focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_14%,transparent)]">
          <Search className="size-5 text-ink-faint" strokeWidth={1.75} />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="First or last name"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="search"
            className="h-full flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              aria-label="Clear"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
              className="press grid size-7 place-items-center rounded-full bg-line text-ink-soft"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>

        <div className="flex flex-col">
          <AnimatePresence mode="popLayout" initial={false}>
            {!query.trim() ? (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 text-[14px] leading-6 text-ink-soft">
                Start typing and tap your name to see your table, your seat and who you’re sitting with.
              </motion.p>
            ) : results.length === 0 ? (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2 px-1 text-[14px] leading-6 text-ink-soft">
                <p>We couldn’t find “{query.trim()}”. Try just your surname, or the name on your invitation.</p>
                {meta.contactEmail && (
                  <a href={`mailto:${meta.contactEmail}`} className="text-ink underline underline-offset-4">
                    Contact the host
                  </a>
                )}
              </motion.div>
            ) : (
              results.map((g, i) => (
                <motion.div
                  key={g.id}
                  layout="position"
                  initial={{ opacity: 0, transform: 'translateY(6px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ delay: i * 0.03, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    to={`/events/${event.slug}/guests/${g.id}`}
                    className="press flex h-16 items-center gap-3.5 border-b border-line px-1 active:bg-card"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card font-mono text-[12px] text-ink-soft shadow-[inset_0_0_0_1px_var(--line)]">{initials(g.name)}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[16px]">{g.name}</span>
                      <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">
                        {g.tableId ? tableName.get(g.tableId) : 'Seat to be confirmed'}
                      </span>
                    </span>
                    <ArrowUpRight className="size-5 text-ink-faint" strokeWidth={1.5} />
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <p className="mt-auto pt-10 text-center font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">{event.guests.length} guests · Eventory</p>
      </motion.section>
    </Screen>
  );
}
