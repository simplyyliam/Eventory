import { Link, useParams } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { initials, seatNumber, usePublicEvent } from '@/lib/event';
import { MiniMap } from '@/components/MiniMap';
import { Screen, StatusScreen } from '@/components/Screen';

const list: Variants = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, transform: 'translateY(12px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section variants={item} className={`rounded-[24px] border border-line bg-card p-5 ${className}`}>
      {children}
    </motion.section>
  );
}

export function GuestPage() {
  const { slug, guestId } = useParams();
  const { data: event, loading, error, retry } = usePublicEvent(slug);

  if (loading) return <StatusScreen loading />;
  if (error || !event) return <StatusScreen title="This page isn’t available" body="Check the link, or ask your host." action={{ label: 'Try again', onClick: retry }} />;

  const guest = event.guests.find((g) => g.id === guestId);
  if (!guest) return <StatusScreen title="We couldn’t find you" body="Go back and search for your name again." />;

  const table = event.tables.find((t) => t.id === guest.tableId);
  const seat = seatNumber(guest.seat);
  const mates = event.guests
    .filter((g) => g.tableId && g.tableId === guest.tableId && g.id !== guest.id)
    .sort((a, b) => (seatNumber(a.seat) ?? 0) - (seatNumber(b.seat) ?? 0));
  const meta = event.metadata ?? {};
  const when = [meta.date ? format(parseISO(meta.date), 'EEEE d MMMM') : null, meta.startTime].filter(Boolean).join(' · ');
  const first = guest.name.split(' ')[0];

  return (
    <Screen>
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-2">
        <Link to={`/events/${event.slug}`} aria-label="Back to search" className="press grid size-10 place-items-center rounded-full border border-line bg-card">
          <ArrowLeft className="size-4.5" strokeWidth={1.75} />
        </Link>
        <p className="label truncate">{event.name}</p>
      </div>

      <motion.div variants={list} initial="hidden" animate="show" className="flex flex-col gap-3 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),2rem)]">
        {/* the ticket */}
        <motion.section variants={item} className="grain relative overflow-hidden rounded-[28px] bg-accent text-accent-ink">
          <div className="px-6 pt-6 pb-7">
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase opacity-75">Welcome</p>
            <h1 className="mt-2 font-serif text-[42px] leading-none text-balance">{guest.name}</h1>
          </div>
          {/* perforation with notches, like a torn-off stub */}
          <div className="relative h-0 border-t border-dashed border-accent-ink/35">
            <span className="absolute -top-3 -left-3 size-6 rounded-full bg-paper" />
            <span className="absolute -top-3 -right-3 size-6 rounded-full bg-paper" />
          </div>
          {table ? (
            <div className="grid grid-cols-[1fr_auto] items-end gap-4 px-6 pt-6 pb-6">
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase opacity-75">Table</p>
                <p className="mt-1 truncate font-serif text-[56px] leading-none">{table.name.replace(/^Table\s+/i, '') || table.name}</p>
                {!/^Table\s+\d+$/i.test(table.name) && <p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase opacity-75">Table {table.tableNumber}</p>}
              </div>
              {seat && (
                <div className="text-right">
                  <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase opacity-75">Seat</p>
                  <p className="mt-1 font-serif text-[56px] leading-none tabular">{seat}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="px-6 pt-6 pb-7 text-[15px] leading-6 opacity-90">Your seat is still being finalised. A host will show you to your table when you arrive.</p>
          )}
        </motion.section>

        {table && (
          <Card className="p-4">
            <p className="label px-1 pb-3">Where to find it</p>
            <MiniMap event={event} tableId={table.id} seat={guest.seat} />
            {seat && <p className="px-1 pt-3 text-[13px] text-ink-soft">Your seat is marked in black.</p>}
          </Card>
        )}

        {mates.length > 0 && (
          <Card>
            <p className="label pb-3">Sitting with you</p>
            <ul className="flex flex-col">
              {mates.map((m) => (
                <li key={m.id} className="flex h-12 items-center gap-3 border-b border-line last:border-b-0">
                  <span className="grid size-8 place-items-center rounded-full bg-paper font-mono text-[11px] text-ink-soft">{initials(m.name)}</span>
                  <span className="flex-1 truncate text-[15px]">{m.name}</span>
                  {m.seat && <span className="font-mono text-[11px] text-ink-faint">Seat {seatNumber(m.seat)}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {meta.welcomeMessage && (
          <Card>
            <p className="label pb-3">A note from your hosts</p>
            <p className="font-serif text-[22px] leading-[1.3] italic">Dear {first},</p>
            <p className="mt-2 font-serif text-[22px] leading-[1.3] italic whitespace-pre-line">{meta.welcomeMessage}</p>
          </Card>
        )}

        {(when || meta.venueName) && (
          <Card className="flex flex-col gap-3">
            {when && (
              <div>
                <p className="label">When</p>
                <p className="mt-1 text-[15px]">{when}</p>
              </div>
            )}
            {meta.venueName && (
              <div>
                <p className="label">Where</p>
                <p className="mt-1 text-[15px]">{meta.venueName}</p>
                {meta.address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(meta.address)}`} className="text-[14px] text-ink-soft underline underline-offset-4">
                    {meta.address}
                  </a>
                )}
              </div>
            )}
          </Card>
        )}
      </motion.div>
    </Screen>
  );
}
