// export type EventPayload = {

// }


export type EventStatus = "draft" | "published" | "archived";

export type Event = {
  id: string;
  name: string;
  slug: string;

  status: EventStatus;

  createdAt: string;
  updatedAt: string;
};