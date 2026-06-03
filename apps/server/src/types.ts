export type Event = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published";

  createdAt: string;
  updatedAt: string;

  guests: any[];
  seatedGuests: any[];
  tables: any[];
  metadata?: any;
};
