import { useTableStore } from '@/store/useTableStore';
import { getTextureById } from './getTextureById';

export const useTableTexture = (tableId: string) => {
  const textureId = useTableStore(
    (s) => s.tables.find((table) => table.id === tableId)?.textureId,
  );

  return getTextureById(textureId ?? "white-oak");
};