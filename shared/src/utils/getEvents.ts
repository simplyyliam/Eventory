import { EventResponse } from "../types/event.types";
import { API_BASE_URL } from "./api";
import axios from "axios";

export const getEvents = async () => {
  const res = await axios.get<EventResponse[]>(
    `${API_BASE_URL}/events`
  );
  return res.data;
};
