import { useTableTexture } from '@/lib/useTableTexture';
import { EditableName, type EditableNameHandle } from '@app/shared/components/custom/EditableName';
import { type RefObject } from 'react';

type DragState = {
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
};

type TableProps = {
  x: number;
  y: number;
  name: string;
  shape: 'circle' | 'rectangle';
  shapeStyle: Record<'circle' | 'rectangle', string>;
  TABLE_CONFIG: {
    rectangleWidth: number;
    rectangleHeight: number;
  };
  isDraggingRef: RefObject<boolean>;
  dragStateRef: RefObject<DragState>;  // replaces offsetRef
  onClick: () => void;
  tableId: string;
  editableNameRef: RefObject<EditableNameHandle | null>;
  onSaveName: (name: string) => void;
  rotation?: number
};

export const TableSurface = ({
  x,
  y,
  name,
  shape,
  shapeStyle,
  TABLE_CONFIG,
  isDraggingRef,
  dragStateRef,
  onClick,
  tableId,
  editableNameRef,
  onSaveName,
  rotation = 0
}: TableProps) => {
  const texture = useTableTexture(tableId);

  return (
    <div
      onClick={onClick}
      onPointerDown={(e) => {
        // Capture the pointer so pointermove keeps firing even if the cursor
        // moves outside this element or faster than a paint frame.
        e.currentTarget.setPointerCapture(e.pointerId);

        isDraggingRef.current = true;

        // Store world-space anchor (where the table is right now) and the
        // screen-space starting point so handleMove can compute deltas.
        dragStateRef.current = {
          worldX:  x,
          worldY:  y,
          screenX: e.clientX,
          screenY: e.clientY,
        };
      }}
      className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-input bg-muted ${shapeStyle[shape]}`}
      style={{
        width: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleWidth,
        height: shape === 'circle' ? 200 : TABLE_CONFIG.rectangleHeight,
        background: `url('${texture.texture}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        cursor: 'grab',
      }}
    >
      <div className="flex items-center justify-center bg-accent max-w-33 text-wrap px-3 py-1.5 rounded-lg"
      style={{ transform: `rotate(${-rotation}deg)`}}
      >
        <EditableName
          ref={editableNameRef}
          name={name}
          onSave={onSaveName}
        />
      </div>
    </div>
  );
};