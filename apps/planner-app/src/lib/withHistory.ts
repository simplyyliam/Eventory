import { useHistoryStore } from "@/store/useHistorySnapshot";

export const withHistory = (fn: () => void) => {
  fn();
  useHistoryStore.getState().save();
};