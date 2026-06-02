import { TEXTURE_LOADER, type TextureId } from '@/config/textureLoader';

export const getTextureById = (textureId: TextureId) => {
  return (
    Object.values(TEXTURE_LOADER).find((texture) => texture.id === textureId) ??
    TEXTURE_LOADER.WHITE_OAK
  );
};

