import type { HTMLAttributes } from 'react';

type Viewport = {
  x: number;
  y: number;
  scale: number;
};

type WorldProps = HTMLAttributes<HTMLDivElement> & {
  viewport: Viewport;
};

export const World: React.FC<WorldProps> = ({
  children,
  className,
  viewport,
  ...props
}) => {
  return (
    <div
      id='venue'
      className={`absolute inset-0 ${className}`}
      {...props}
      style={{
        // Large world, centered at the viewport center. With this approach
        // translate(-50%,-50%) centers the world in the screen so
        // viewport.x/viewport.y becomes an offset from the center.
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
  );
};