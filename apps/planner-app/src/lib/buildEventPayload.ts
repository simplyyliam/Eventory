// data normalization layer

import { useFormStore } from '@/store/useFormStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { createSlug } from './createSlug';

export function buildEventPayload() {
  const { guests, seatedGuests } = useGuestStore.getState();
  const { tables } = useTableStore.getState();

  const { name, email, comment, dietary } = useFormStore.getState();

  const slug = createSlug(name);

  return {
    slug,

    events: {
      name,
      contactEmail: email,
      comment,
      dietary,
    },

    guests,
    seatedGuests,

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
