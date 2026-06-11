import { type EventResponse } from '../types/event.types';
import axios from "axios";
import { API_BASE_URL } from "./api";

export const getEventBySlug = async (slug: string) => {
  const res = await axios.get<EventResponse>(
    `${API_BASE_URL}/events/${slug}`
  );
  return res.data;
};