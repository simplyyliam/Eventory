import {
  motion,
  useMotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import { FrontFace } from "./FrontFace";
import { BackFace } from "./BackFace";

interface PostCardProps {
  name: string;
  seat: string;
  table: number;
}

export const PostCard = ({ name, seat, table }: PostCardProps) => {

  const rotateY = useMotionValue(0);

const mode = useRef<"idle" | "dragging">("idle");

const lastX = useRef(0);
const startX = useRef(0);

const moved = useRef(false);

const velocity = useRef(0);

const snapping = useRef(false);
const cancelSnap = useRef(false);

const resumeTimeout = useRef<number | null>(null);
const raf = useRef<number | null>(null);

const IDLE_SPEED = 0.5;
const SENSITIVITY = 0.4;
const FRICTION = 0.96;

const getNearestFaceRotation = (rotation: number) => {
  const front = Math.round(rotation / 360) * 360;

  const back =
    rotation >= front
      ? front + 180
      : front - 180;

  return Math.abs(rotation - front) <
    Math.abs(rotation - back)
    ? front
    : back;
};

const animate = () => {
  if (mode.current === "dragging" || snapping.current) {
    raf.current = requestAnimationFrame(animate);
    return;
  }

  velocity.current *= FRICTION;

  rotateY.set(
    rotateY.get() + IDLE_SPEED + velocity.current
  );

  raf.current = requestAnimationFrame(animate);
};

useEffect(() => {
  raf.current = requestAnimationFrame(animate);

  return () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
    }

    if (resumeTimeout.current) {
      clearTimeout(resumeTimeout.current);
    }
  };
}, []);

const onPointerDown = (e: React.PointerEvent) => {
  // User interaction always wins

  cancelSnap.current = true;
  snapping.current = false;

  if (resumeTimeout.current) {
    clearTimeout(resumeTimeout.current);
    resumeTimeout.current = null;
  }

  mode.current = "dragging";

  startX.current = e.clientX;
  lastX.current = e.clientX;

  moved.current = false;

  velocity.current = 0;

  (e.currentTarget as HTMLElement).setPointerCapture(
    e.pointerId
  );
};

const onPointerMove = (e: React.PointerEvent) => {
  if (mode.current !== "dragging") return;

  const x = e.clientX;
  const dx = x - lastX.current;

  if (Math.abs(x - startX.current) > 4) {
    moved.current = true;
  }

  rotateY.set(
    rotateY.get() + dx * SENSITIVITY
  );

  velocity.current = dx * 1.2;

  lastX.current = x;
};

const onPointerUp = () => {
  mode.current = "idle";

  // Tap → snap to nearest face
  if (!moved.current) {
    snapping.current = true;
    cancelSnap.current = false;

    velocity.current = 0;

    const startRotation = rotateY.get();
    const targetRotation =
      getNearestFaceRotation(startRotation);

    const duration = 450;
    const startTime = performance.now();

    const animateSnap = () => {
      if (cancelSnap.current) {
        snapping.current = false;
        return;
      }

      const elapsed =
        performance.now() - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      // easeOutCubic
      const eased =
        1 - Math.pow(1 - progress, 3);

      rotateY.set(
        startRotation +
          (targetRotation - startRotation) *
            eased
      );

      if (progress < 1) {
        requestAnimationFrame(animateSnap);
      } else {
        resumeTimeout.current =
          window.setTimeout(() => {
            snapping.current = false;
          }, 1500);
      }
    };

    requestAnimationFrame(animateSnap);

    return;
  }

  if (Math.abs(velocity.current) < 0.3) {
    velocity.current = 0;
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
    touchAction: "none",
  }}
  onPointerDown={onPointerDown}
  onPointerMove={onPointerMove}
  onPointerUp={onPointerUp}
  onPointerCancel={onPointerUp}
>
  {/* Front */}
  <FrontFace name={name} seat={seat} table={table}/>

  {/* Back */}
<BackFace/>
</motion.div>
    </div>
  );
};