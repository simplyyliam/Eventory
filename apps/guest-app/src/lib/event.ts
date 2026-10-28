import { useQuery } from './useQuery';
import { getPublicEventBySlug } from '@app/shared/utils/publicEvent';

// What the public endpoint returns, narrowed to what the guest page uses.
export type PublicTable = {
  id: string;
  name: string;
  tableNumber: number;
  shape: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  seatCount: number;
  textureId: string | null;
  hiddenSeats: string[] | null;
};

export type PublicGuest = { id: string; name: string; seat: string | null; tableId: string | null };

export type VenueElement = { id: string; kind: string; label: string; x: number; y: number; width: number; height: number; rotation: number };

export type PublicEvent = {
  id: string;
  name: string;
  slug: string;
  tables: PublicTable[];
  guests: PublicGuest[];
  metadata: {
    date?: string | null;
    startTime?: string | null;
    venueName?: string;
    address?: string;
    welcomeMessage?: string;
    contactEmail?: string;
    venue?: { room: { width: number; depth: number }; elements: VenueElement[] };
  } | null;
};

export const usePublicEvent = (slug: string | undefined) =>
  useQuery(slug ? `event:${slug}` : null, () => getPublicEventBySlug(slug!) as unknown as Promise<PublicEvent>);

export const seatNumber = (seat: string | null) => (seat ? Number(seat.split('-').pop()) : null);

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

// Matches each word of the query against the start of any word in the name,
// so "ama ok" finds "Amara Okafor".
export function matches(name: string, query: string) {
  const words = name.toLowerCase().split(/\s+/);
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .every((q) => words.some((w) => w.startsWith(q)));
}
