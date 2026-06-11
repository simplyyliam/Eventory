import axios from "axios";
import { EventResponse } from "src/types/event.types";
import { API_BASE_URL } from "../utils/api";

export const getEventBySlug = async (slug: string) => {
  const res = await axios.get<EventResponse>(
    `${API_BASE_URL}/events/${slug}`
  );
  return res.data;
};