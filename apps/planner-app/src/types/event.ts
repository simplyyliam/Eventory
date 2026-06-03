

export type EventStatus = "draft" | "published" | "archived";

export type EventMetadata = {
  contactEmail: string;
  comment: string;
  dietary: string[];
};

export type Event = {
  id: string;
  name: string;
  slug: string;

  status: EventStatus;

  createdAt: string;
  updatedAt: string;

  metadata?: EventMetadata;
};
