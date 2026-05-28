import {
  useRef,
  useState,
  type HTMLAttributes,
  isValidElement,
  Children,
} from 'react';

type Position = {
  x: number;
  y: number;
};

export const DragArea: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
}) => {
  return (
    <>
      {Children.map(children, (child, idx) => {
        if (!isValidElement(child)) return null;

        return (
          <Draggable key={idx}>
            {child}
          </Draggable>
        )
      })}
    </>
  );
};

export const Draggable: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;

    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`${className}`}
      {...props}
      style={{
        position: 'absolute',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        cursor: 'grab',
      }}
    >
      {children}
    </div>
  );
};
