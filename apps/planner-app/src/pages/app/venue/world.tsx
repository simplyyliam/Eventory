import { createContext, useContext, type HTMLAttributes } from 'react';

// ─── Viewport Context ─────────────────────────────────────────────────────────
// Exposes the current scale to any descendant without prop drilling.
// Table reads this to do scale-aware drag math.

const ViewportContext = createContext<number>(1);

export function useViewportScale(): number {
  return useContext(ViewportContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Viewport = {
  x: number;
  y: number;
  scale: number;
};

type WorldProps = HTMLAttributes<HTMLDivElement> & {
  viewport: Viewport;
};

// ─── World ────────────────────────────────────────────────────────────────────

/**
 * World
 *
 * Identical to your original World — only adds ViewportContext.Provider
 * around the existing div so Table (and any other child) can read `scale`
 * without needing it threaded down as a prop.
 *
 * Transform breakdown (center-origin):
 *   translate(-50%,-50%)           — centers the 10 000×10 000 world on screen
 *   translate(viewport.x, viewport.y) — pan offset
 *   scale(viewport.scale)          — zoom, around the world center
 */
export const World: React.FC<WorldProps> = ({
  children,
  className,
  viewport,
  ...props
}) => {
  return (
    <ViewportContext.Provider value={viewport.scale}>
      <div
        id="venue"
        className={`absolute inset-0 ${className ?? ''}`}
        {...props}
        style={{
          width: '10000px',
          height: '10000px',
          left: '50%',
          top: '50%',
          transform: `translate(-50%,-50%) translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '50% 50%',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </ViewportContext.Provider>
  );
};