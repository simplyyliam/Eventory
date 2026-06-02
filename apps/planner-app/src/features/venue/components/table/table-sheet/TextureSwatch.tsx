import { TEXTURE_LOADER } from "@/config";

interface TextureSwatchProps {
  onClick: () => void;
  textureSwatch: keyof typeof TEXTURE_LOADER;
}

export const TextureSwatch = ({ onClick, textureSwatch }: TextureSwatchProps) => {
  return (
    <button
      onClick={onClick}
      className="w-20 h-20 rounded-full bg-accent flex items-center justify-center"
      style={{
         backgroundImage: `url('${TEXTURE_LOADER[textureSwatch].texture}')`,
      }}
    />
  );
};