import {
  motion,
  useMotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";

interface PostCardProps {
  name: string;
  seat: string;
  table: number;
}

export const PostCard = ({ name, seat, table }: PostCardProps) => {
  const rotateY = useMotionValue(0);

  const mode = useRef<"idle" | "dragging">("idle");

  const lastX = useRef(0);
  const velocity = useRef(0);

  const raf = useRef<number | null>(null);

  const IDLE_SPEED = 0.01;
  const SENSITIVITY = 0.4;

const animate = () => {
  if (mode.current === "dragging") {
    // no auto motion while dragging
  } else {
    // smooth decay
    velocity.current *= 0.96;

    // gentle continuous idle energy injection
    velocity.current += IDLE_SPEED;

    rotateY.set(rotateY.get() + velocity.current);
  }

  raf.current = requestAnimationFrame(animate);
};

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

const onPointerDown = (e: React.PointerEvent) => {
  mode.current = "dragging";

  lastX.current = e.clientX;

  // stop any existing spin while user grabs it
  velocity.current = 0;

  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onPointerMove = (e: React.PointerEvent) => {
  if (mode.current !== "dragging") return;

  const x = e.clientX;
  const dx = x - lastX.current;

  // 🎯 direct control while dragging
  rotateY.set(rotateY.get() + dx * 0.4);

  // 🎯 velocity capture (for flick)
  velocity.current = dx * 0.8;

  lastX.current = x;
};

const onPointerUp = () => {
  mode.current = "idle";

  // if tiny movement → just idle spin
  if (Math.abs(velocity.current) < 0.5) {
    velocity.current = IDLE_SPEED ;
  }
};

  return (
    <div
      className="relative flex items-center justify-center w-82.5 h-123"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          rotateY,
          transformStyle: "preserve-3d",
          touchAction: "none"
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          width="330"
          height="504"
          viewBox="0 0 360 504"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0"
        >
          <defs>
            <clipPath id="postcard-clip">
              <path d="M15 7.5L0 0L7.5 14.49L0 28.98L7.5 43.52L0 58.01L7.5 72.5L0 86.99L7.5 101.48L0 115.97L7.5 130.46L0 144.95L7.5 159.44L0 173.93L7.5 188.43L0 202.92L7.5 217.41L0 231.9L7.5 246.39L0 260.88L7.5 275.37L0 289.86L7.5 304.35L0 318.84L7.5 333.33L0 347.82L7.5 362.31L0 376.8L7.5 391.3L0 405.79L7.5 420.28L0 434.77L7.5 449.26L0 464L15 456.96L30 464L45 456.96L60 464L75 456.96L90 464L105 456.96L120 464L135 456.96L150 464L165 456.96L180 464L195 456.96L210 464L225 456.96L240 464L255 456.96L270 464L285 456.96L300 464L315 456.96L330 464L345 456.96L360 464L352.5 449.26L360 434.77L352.5 420.28L360 405.79L352.5 391.3L360 376.8L352.5 362.31L360 347.82L352.5 333.33L360 318.84L352.5 304.35L360 289.86L352.5 275.37L360 260.88L352.5 246.39L360 231.9L352.5 217.41L360 202.92L352.5 188.43L360 173.93L352.5 159.44L360 144.95L352.5 130.46L360 115.97L352.5 101.48L360 86.99L352.5 72.5L360 58.01L352.5 43.52L360 28.98L352.5 14.49L360 0L345 7.5L330 0L315 7.5L300 0L285 7.5L270 0L255 7.5L240 0L225 7.5L210 0L195 7.5L180 0L165 7.5L150 0L135 7.5L120 0L105 7.5L90 0L75 7.5L60 0L45 7.5L30 0L15 7.5Z" />
            </clipPath>
          </defs>

          <rect
            width="360"
            height="464"
            fill="#f5f0e8"
            clipPath="url(#postcard-clip)"
          />

          <mask id="postcard-mask" fill="white">
            <path d="M15 7.5L0 0L7.5 14.49L0 28.98L7.5 43.52L0 58.01L7.5 72.5L0 86.99L7.5 101.48L0 115.97L7.5 130.46L0 144.95L7.5 159.44L0 173.93L7.5 188.43L0 202.92L7.5 217.41L0 231.9L7.5 246.39L0 260.88L7.5 275.37L0 289.86L7.5 304.35L0 318.84L7.5 333.33L0 347.82L7.5 362.31L0 376.8L7.5 391.3L0 405.79L7.5 420.28L0 434.77L7.5 449.26L0 464L15 456.96L30 464L45 456.96L60 464L75 456.96L90 464L105 456.96L120 464L135 456.96L150 464L165 456.96L180 464L195 456.96L210 464L225 456.96L240 464L255 456.96L270 464L285 456.96L300 464L315 456.96L330 464L345 456.96L360 464L352.5 449.26L360 434.77L352.5 420.28L360 405.79L352.5 391.3L360 376.8L352.5 362.31L360 347.82L352.5 333.33L360 318.84L352.5 304.35L360 289.86L352.5 275.37L360 260.88L352.5 246.39L360 231.9L352.5 217.41L360 202.92L352.5 188.43L360 173.93L352.5 159.44L360 144.95L352.5 130.46L360 115.97L352.5 101.48L360 86.99L352.5 72.5L360 58.01L352.5 43.52L360 28.98L352.5 14.49L360 0L345 7.5L330 0L315 7.5L300 0L285 7.5L270 0L255 7.5L240 0L225 7.5L210 0L195 7.5L180 0L165 7.5L150 0L135 7.5L120 0L105 7.5L90 0L75 7.5L60 0L45 7.5L30 0L15 7.5Z" />
          </mask>

          <path
            d="M15 7.5L0 0L7.5 14.49L0 28.98L7.5 43.52L0 58.01L7.5 72.5L0 86.99L7.5 101.48L0 115.97L7.5 130.46L0 144.95L7.5 159.44L0 173.93L7.5 188.43L0 202.92L7.5 217.41L0 231.9L7.5 246.39L0 260.88L7.5 275.37L0 289.86L7.5 304.35L0 318.84L7.5 333.33L0 347.82L7.5 362.31L0 376.8L7.5 391.3L0 405.79L7.5 420.28L0 434.77L7.5 449.26L0 464L15 456.96L30 464L45 456.96L60 464L75 456.96L90 464L105 456.96L120 464L135 456.96L150 464L165 456.96L180 464L195 456.96L210 464L225 456.96L240 464L255 456.96L270 464L285 456.96L300 464L315 456.96L330 464L345 456.96L360 464L352.5 449.26L360 434.77L352.5 420.28L360 405.79L352.5 391.3L360 376.8L352.5 362.31L360 347.82L352.5 333.33L360 318.84L352.5 304.35L360 289.86L352.5 275.37L360 260.88L352.5 246.39L360 231.9L352.5 217.41L360 202.92L352.5 188.43L360 173.93L352.5 159.44L360 144.95L352.5 130.46L360 115.97L352.5 101.48L360 86.99L352.5 72.5L360 58.01L352.5 43.52L360 28.98L352.5 14.49L360 0L345 7.5L330 0L315 7.5L300 0L285 7.5L270 0L255 7.5L240 0L225 7.5L210 0L195 7.5L180 0L165 7.5L150 0L135 7.5L120 0L105 7.5L90 0L75 7.5L60 0L45 7.5L30 0L15 7.5Z"
            fill="white"
            mask="url(#postcard-mask)"
          />

                <foreignObject x="20" y="15" width="320" height="434">
                    <div className="flex flex-col gap-10 p-4 w-full h-full">
                        <div className="flex gap-2.5 items-center h-full">
                            <div className="flex w-3/2 h-full text-[40px] font-italianno border border-white">From Richard & Jill</div>
                            <div className="flex items-center justify-center w-full h-full bg-[url('/rose.jpg')] bg-cover bg-center"></div>
                        </div>
                        <div className="flex flex-col gap-10 items-center justify-between h-full">
                            <div className="flex w-full h-full items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground font-semibold">Guest</span>
                                    <span className="font-semibold">{name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground font-semibold">Seat</span>
                                    <span className="font-semibold">{seat}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">Table</span>
                                    <span className="font-semibold">{table}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 w-full h-full justify-between ">
                                <span className="text-[14px] font-medium">Dear Guest</span>
                                <span className="text-[14px] ">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. </span>
                            </div>
                        </div>
                    </div>
                </foreignObject>
        </svg>
      </motion.div>
    </div>
  );
};