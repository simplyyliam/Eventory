export const isModal = <T>(id: string | null, target: string, data: unknown): T | null =>
  id === target ? (data as T) : null;
