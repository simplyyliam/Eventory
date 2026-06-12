import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import type { EventResponse, Guest } from "../types/event.types";

// Fetch a published event by slug
export const getPublicEventBySlug = async (slug: string) => {
  const res = await axios.get<EventResponse>(
    `${API_BASE_URL}/public/events/${slug}`
  );
  return res.data;
};

// Fetch a published guest (via event + guestId)
export const getPublicGuest = async (slug: string, guestId: string) => {
  const res = await axios.get<Guest>(
    `${API_BASE_URL}/public/events/${slug}/guests/${guestId}`
  );
  return res.data;
};