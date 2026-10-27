// Plan coordinates are in "units": 200 units = 1 metre. The scale was picked so
// tables saved by the old editor keep a sensible real-world size.
export const UNITS_PER_METRE = 200;

export type TableShape = 'circle' | 'rectangle' | 'square' | 'row';

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
  | 'plant';

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

export type EventMetadata = Partial<EventDetails> & {
  venue?: Venue;
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
