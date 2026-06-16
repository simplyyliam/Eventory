import { useRef, useCallback } from 'react';

export const GRID_SIZE = 20; // px in world-space — set to 1 to disable snapping

function snapToGrid(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

interface UseDragTableOptions {
  id: string;
  x: number;
  y: number;
  scale: number; // current viewport scale — CRITICAL for correct delta math
  onMove: (id: string, x: number, y: number) => void; // called every frame (live preview)
  onDrop: (id: string, x: number, y: number) => void; // called on pointerup (snapped commit)
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
}

/**
 * useDragTable
 *
 * Provides scale-aware, grid-snapping drag behavior for a canvas table element.
 *
 * The core fix for the "heavy at zoom-out / too fast at zoom-in" bug:
 *   Screen-space delta (pixels the mouse moved) must be divided by the viewport
 *   scale to produce the equivalent world-space delta.
 *
 *   worldDelta = screenDelta / scale
 *
 * We also use setPointerCapture so the pointer stays locked to the element even
 * when the cursor moves faster than a frame, eliminating the "lost drag" jitter.
 */
export function useDragTable({
  id,
  x,
  y,
  scale,
  onMove,
  onDrop,
  onDragStart,
  onDragEnd,
}: UseDragTableOptions) {
  // Track the last pointer position in screen space
  const lastScreen = useRef<{ x: number; y: number } | null>(null);
  // Track the running world-space position during drag (avoids stale closure issues)
  const worldPos = useRef({ x, y });

  // Keep worldPos in sync if the prop changes externally (e.g. undo/redo)
  worldPos.current = { x, y };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Only respond to primary button; let right-click / middle fall through
      if (e.button !== 0) return;

      // Stop the canvas pan handler from also firing
      e.stopPropagation();

      // Lock pointer to this element — cursor can move arbitrarily fast without losing the drag
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      lastScreen.current = { x: e.clientX, y: e.clientY };
      worldPos.current = { x, y };

      onDragStart?.(id);
    },
    [id, x, y, onDragStart],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!lastScreen.current) return;

      // Screen-space delta
      const screenDx = e.clientX - lastScreen.current.x;
      const screenDy = e.clientY - lastScreen.current.y;

      lastScreen.current = { x: e.clientX, y: e.clientY };

      // ✅ Convert to world-space by dividing by the current scale
      const worldDx = screenDx / scale;
      const worldDy = screenDy / scale;

      worldPos.current = {
        x: worldPos.current.x + worldDx,
        y: worldPos.current.y + worldDy,
      };

      // Live preview — no snapping during drag (feels smoother)
      onMove(id, worldPos.current.x, worldPos.current.y);
    },
    [id, scale, onMove],
  );

  const onPointerUp = useCallback(
    (_e: React.PointerEvent<HTMLElement>) => {
      if (!lastScreen.current) return;

      lastScreen.current = null;

      // Snap to grid on drop
      const snappedX = snapToGrid(worldPos.current.x, GRID_SIZE);
      const snappedY = snapToGrid(worldPos.current.y, GRID_SIZE);

      onDrop(id, snappedX, snappedY);
      onDragEnd?.(id);
    },
    [id, onDrop, onDragEnd],
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}