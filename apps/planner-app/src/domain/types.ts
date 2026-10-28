// 200 units = 1 metre, picked so tables saved by the old editor keep a
// sensible real-world size. Defined in shared so the guest app agrees.
export { UNITS_PER_METRE, type TableShape } from '@app/shared/domain/geometry';
import type { TableShape } from '@app/shared/domain/geometry';

export type TableFinish = 'linen' | 'ivory' | 'sage' | 'oak' | 'walnut';

export type PlanTable = {
  id: string;
  name: string;
  tableNumber: number;
  shape: TableShape;
  seatCount: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  finish: TableFinish;
  hiddenSeats: string[];
};

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';

export type Guest = {
  id: string;
  name: string;
  email: string | null;
  dietary: string[];
  comments: string | null;
  status: RsvpStatus;
  tableId: string | null;
  seat: string | null;
};

export type ElementKind =
  | 'stage'
  | 'dance-floor'
  | 'bar'
  | 'buffet'
  | 'dj'
  | 'entrance'
  | 'pillar'
  | 'plant'
  | 'cake'
  | 'gifts'
  | 'sign'
  | 'photo-booth'
  | 'lounge';

export type VenueElement = {
  id: string;
  kind: ElementKind;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type Room = {
  width: number;
  depth: number;
};

export type Venue = {
  room: Room;
  elements: VenueElement[];
};

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
};

export type EventStatus = 'draft' | 'published' | 'archived';

export type EventDetails = {
  date: string | null;
  startTime: string | null;
  venueName: string;
  address: string;
  welcomeMessage: string;
  rsvpDeadline: string | null;
  contactEmail: string;
};

export type DecorTheme = 'wedding' | 'birthday' | 'party' | 'corporate' | 'minimal';

export type Decor = { theme: DecorTheme; accent: string };

export type EventMetadata = Partial<EventDetails> & {
  venue?: Venue;
  decor?: Decor;
  checklist?: ChecklistItem[];
  // legacy fields from the first version
  comment?: string;
  dietary?: string[];
};

export type EventSummary = {
  id: string;
  name: string;
  slug: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  metadata: EventMetadata | null;
  tables: unknown[];
  guests: unknown[];
};
