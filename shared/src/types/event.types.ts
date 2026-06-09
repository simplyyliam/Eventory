export type Guest = {
  id: string;
  name: string;
  email: string | null;
  dietary: string[];
  comments: string | null;
  status: string;
  seat: string | null;
  tableId: string | null;
  eventId: string;
  table?: {
    id: string
    name: string,
    tableNumber: number
  } | null
}

export type SeatedGuest = {
  guestId: string;
  tableId: string;
  seatId: string;
};

export type Table = {
  id: string;
  name: string;
  tableNumber: number;
  seatCount: number;
  shape: "circle" | "rectangle";
  textureId: string;
};

export type EventMeta = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type EventResponse = {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: EventMeta;
  // seatedGuests: SeatedGuest[];
  tables: Table[];
  guests: Guest[];
}