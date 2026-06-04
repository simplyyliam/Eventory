export const TEXTURE_LOADER = {
  WHITE_OAK: {
    id: 'white-oak',
    name: 'white Oak',
    texture: '/textures/texture-wood-white-oak.jpg',
    intensity: 1.0,
  },
  WHITE_ELM: {
    id: 'white-elm',
    name: 'white Elm',
    texture: '/textures/texture-wood-white-elm.png',
    intensity: 1.0,
  },
} as const;

export type TextureId =
  (typeof TEXTURE_LOADER)[keyof typeof TEXTURE_LOADER]['id'];
