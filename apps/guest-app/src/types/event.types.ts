export type Guest = {
  id: string;
  Name: string;
  Email: string;
  Dietary: string[];
  Comments: string;
};

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
  slug: string;

  event: EventMeta;

  guests: Guest[];

  seatedGuests: SeatedGuest[];

  tables: Table[];
};