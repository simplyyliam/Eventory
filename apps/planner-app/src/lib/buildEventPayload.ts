// data normalization layer

import { useEventStore } from '@/store/useEventStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { createSlug } from '@app/shared';

export function buildEventPayload() {
  const { guests, seatedGuests } = useGuestStore.getState();
  const { tables } = useTableStore.getState();
  const { activeEvent } = useEventStore.getState();

  const eventName = activeEvent?.name ?? "";

  const slug = createSlug(eventName);

  return {
    slug,

    event: {
      id: activeEvent?.id,
      name: eventName,
      slug,
      status: activeEvent?.status ?? "draft",
      createdAt: activeEvent?.createdAt,
      updatedAt: activeEvent?.updatedAt
    },

    guests,
    seatedGuests,
    metadata: activeEvent?.metadata,

    tables: tables.map((table) => ({
      id: table.id,
      name: table.name,
      tableNumber: table.tableNumber,
      seatCount: table.seatCount,
      shape: table.shape,
      textureId: table.textureId,
    })),
  };
}
