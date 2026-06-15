import { getSeatPosition } from './layout';
import { TABLE_CONFIG } from './table.config';
import { AssignSeatDialog, GuestInfoModal } from '@/features/guests';
import {
  shapeStyle,
  type GuestInfoModalData,
  type TableProps,
} from './table.types';
import { getPopupPlacement } from './utils';
import { useTableStore } from '@/store/useTableStore';
import { useEffect, useRef, useState } from 'react';
import { useGuestStore } from '@/store/useGuestStore';
import { Chair, TableSurface } from '../assets';
import { getInitials } from '@/lib/getInitials';
import { TableSheet } from './table-sheet/TableSheet';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@app/shared/components/ui/context-menu';
import { useHistoryStore } from '@/store/useHistorySnapshot';
import type { EditableNameHandle } from '@app/shared/components/custom/EditableName';

// ─── Snap config ────────────────────────────────────────────────────────────
// How close (in canvas px) two table edges need to be to snap together
const SNAP_THRESHOLD = 40;

interface PremiumTableProps extends TableProps {
  height?: number;
  hiddenSeats?: string[];
  linkedTableId?: string;
}

export const Table = ({
  shape,
  seatCount = 10,
  id,
  name,
  tableId,
  x,
  y,
  rotation,
  height: initialHeight,
  hiddenSeats = [],
  linkedTableId,
}: PremiumTableProps) => {
  // ─── Store ───────────────────────────────────────────────────────────────
  const updateTablePosition   = useTableStore((s) => s.updateTablePosition);
  const updateTableRotation   = useTableStore((s) => s.updateTableRotation);
  const updateTableName       = useTableStore((s) => s.updateTableName);
  const updateTableHeight     = useTableStore((s) => s.updateTableHeight);
  const toggleSeatVisibility  = useTableStore((s) => s.toggleSeatVisibility);
  const linkTables            = useTableStore((s) => s.linkTables);
  const unlinkTable           = useTableStore((s) => s.unlinkTable);
  const removeTable           = useTableStore((s) => s.removeTable);
  const allTables             = useTableStore((s) => s.tables);

  const guests = useGuestStore((s) => s.guests);

  // ─── UI State ────────────────────────────────────────────────────────────
  const [isRotating, setIsRotating]           = useState(false);
  const [isResizing, setIsResizing]           = useState<'top' | 'bottom' | null>(null);
  const [assignSeatOpen, setAssignSeatOpen]   = useState(false);
  const [activeSeat, setActiveSeat]           = useState<{ tableId: string; seatId: string } | null>(null);
  const [hovered, setHovered]                 = useState(false);
  const [hoverGuest, setHoverGuest]           = useState<GuestInfoModalData | null>(null);
  const [open, setOpen]                       = useState(false);
  const [snapCandidate, setSnapCandidate]     = useState<string | null>(null); // tableId of nearby table

  // ─── Refs ────────────────────────────────────────────────────────────────
  const isDragging        = useRef(false);
  const DidDragRef        = useRef(false);
  const offset            = useRef({ x: 0, y: 0 });
  const wrapperRef        = useRef<HTMLDivElement | null>(null);
  const rotateStart       = useRef({ angle: 0, rotation: 0 });
  const rotatePointerId   = useRef<number | null>(null);
  const resizeStart       = useRef({ y: 0, initialHeight: 0, initialY: 0 });
  const editableNameRef   = useRef<EditableNameHandle>(null);

  // ─── Layout ──────────────────────────────────────────────────────────────
  const tableWidth    = shape === 'circle' ? TABLE_CONFIG.circleRadius * 2 : TABLE_CONFIG.rectangleWidth;
  const currentHeight = shape === 'circle' ? TABLE_CONFIG.circleRadius * 2 : (initialHeight || TABLE_CONFIG.rectangleHeight);

  const wrapperPadding = TABLE_CONFIG.seatGap + 32;
  const wrapperWidth   = tableWidth + wrapperPadding * 2;
  const wrapperHeight  = currentHeight + wrapperPadding * 2;
  const centerX        = wrapperWidth / 2;
  const centerY        = wrapperHeight / 2;

  const WORLD_SIZE = 10000;
  const WORLD_HALF = WORLD_SIZE / 2;

  // Auto-calculate seat count from height for rectangles
  const calculatedSeatCount =
    shape === 'rectangle'
      ? 2 + Math.floor(currentHeight / 75) * 2
      : seatCount;

  // ─── Drag ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      DidDragRef.current = true;

      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      updateTablePosition(tableId, newX, newY);

      // ── Snap detection ──────────────────────────────────────────────────
      if (shape === 'rectangle') {
        const candidate = findSnapCandidate(newX, newY, tableId, allTables, currentHeight, tableWidth);
        setSnapCandidate(candidate);
      }
    };

    const handleUp = (_e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (DidDragRef.current) {
        // Commit snap if we have a candidate
        if (snapCandidate) {
          const partner = allTables.find((t) => t.id === snapCandidate);
          if (partner && !linkedTableId) {
            // Align positions: snap current table foot-to-head with partner
            const snappedPos = calcSnapPosition(partner, currentHeight, tableWidth);
            updateTablePosition(tableId, snappedPos.x, snappedPos.y);
            linkTables(tableId, snapCandidate);
          }
        }
        setSnapCandidate(null);
        useHistoryStore.getState().save();
      }
      setTimeout(() => { DidDragRef.current = false; }, 0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [updateTablePosition, tableId, allTables, shape, currentHeight, tableWidth, snapCandidate, linkedTableId, linkTables]);

  // ─── Rotation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isRotating || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top + rect.height / 2;
      const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
      const delta = angle - rotateStart.current.angle;
      const newRotation = rotateStart.current.rotation + delta;
      updateTableRotation(tableId, e.shiftKey ? Math.round(newRotation / 15) * 15 : newRotation);
    };
    const handleUp = () => {
      if (isRotating) {
        setIsRotating(false);
        useHistoryStore.getState().save();
        rotatePointerId.current = null;
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [tableId, updateTableRotation, isRotating]);

  // ─── Resize ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isResizing) return;
      const deltaY = e.clientY - resizeStart.current.y;
      const rad    = (rotation * Math.PI) / 180;
      const transformedDelta = deltaY * Math.cos(rad);

      if (isResizing === 'bottom') {
        const nextHeight = Math.max(120, resizeStart.current.initialHeight + transformedDelta);
        updateTableHeight(tableId, nextHeight);
      } else {
        const nextHeight = Math.max(120, resizeStart.current.initialHeight - transformedDelta);
        updateTableHeight(tableId, nextHeight);
        updateTablePosition(tableId, x, resizeStart.current.initialY + transformedDelta / 2);
      }
    };
    const handleUp = () => {
      if (isResizing) {
        setIsResizing(null);
        useHistoryStore.getState().save();
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isResizing, rotation, tableId, updateTableHeight, updateTablePosition, x, y]);

  const handleAssignSeatOpenChange = (open: boolean) => {
    setAssignSeatOpen(open);
    if (!open) setTimeout(() => setActiveSeat(null), 300);
  };

  const isLinked = !!linkedTableId;

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setHoverGuest(null); }}
      className="absolute select-none"
      style={{
        left: 0,
        top: 0,
        width: wrapperWidth,
        height: wrapperHeight,
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: `translate(${x + WORLD_HALF}px, ${y + WORLD_HALF}px) ${shape === 'rectangle' ? `rotate(${rotation}deg)` : ''}`,
      }}
    >
      {/* Snap proximity highlight */}
      {snapCandidate && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: '0 0 0 2px #3b82f6, 0 0 20px 4px rgba(59,130,246,0.25)',
            transition: 'box-shadow 150ms ease',
          }}
        />
      )}

      <div style={{ position: 'relative', width: wrapperWidth, height: wrapperHeight }}>

        {/* ── CHAIR LAYER ─────────────────────────────────────────────────── */}
        {Array.from({ length: calculatedSeatCount }).map((_, idx) => {
          const seatId = `${id}-seat-${idx + 1}`;
          if (hiddenSeats.includes(seatId)) return null;

          const { x: sx, y: sy } = getSeatPosition(
            shape,
            idx,
            calculatedSeatCount,
            { ...TABLE_CONFIG, rectangleHeight: currentHeight },
            centerX,
            centerY,
          );

          const dx    = centerX - sx;
          const dy    = centerY - sy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
          const guest = guests.find((g) => g.seat === seatId);

          // Determine seat type for context menu label
          const isHeadSeat = idx === 0 || idx === 1; // top / bottom head
          const seatLabel  = isHeadSeat ? 'Remove Head Seat' : 'Remove Chair';

          return (
            <ContextMenu key={idx}>
              <ContextMenuTrigger>
                <div
                  className="absolute cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95"
                  onClick={() => {
                    if (guests.find((g) => g.seat === seatId)) return;
                    console.log({ id, tableId, seatId })
                    setActiveSeat({ tableId: id, seatId });
                    setAssignSeatOpen(true);
                  }}
                  onMouseEnter={() => {
                    if (!guest) return;
                    setHoverGuest({
                      tableId: id,
                      seatId,
                      guestId: guest.id,
                      guestName: guest.name,
                      placement: getPopupPlacement(sx, sy, centerX, centerY),
                    });
                  }}
                  onMouseLeave={() => setHoverGuest(null)}
                  style={{
                    left: sx,
                    top: sy,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    width: 46,
                    height: 46,
                  }}
                >
                  <Chair idx={idx} />
                  {guest && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span
                        className="flex items-center justify-center text-[10px] font-bold bg-background w-6 h-6 rounded-full border shadow-sm"
                        style={{ transform: `rotate(${-angle}deg)` }}
                      >
                        {getInitials(guest.name ?? '')}
                      </span>
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    toggleSeatVisibility(tableId, seatId)
                    console.log('hiddenSeats after:', useTableStore.getState().tables.find(t => t.id === tableId)?.hiddenSeats);
                  }}
                >
                  {seatLabel}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}

        <AssignSeatDialog
          open={assignSeatOpen && activeSeat?.tableId === id}
          onOpenChange={handleAssignSeatOpenChange}
          tableId={activeSeat?.tableId ?? ''}
          seatId={activeSeat?.seatId ?? ''}
        />

        {hoverGuest && hoverGuest.tableId === id && (
          <div
            className="absolute z-20"
            style={{
              top: hoverGuest.placement.top,
              left: hoverGuest.placement.left,
              transform: hoverGuest.placement.transform,
            }}
          >
            <GuestInfoModal data={hoverGuest} />
          </div>
        )}

        {/* ── TABLE SURFACE + BOUNDING CONTROLS ───────────────────────────── */}
        <ContextMenu>
          <ContextMenuTrigger onPointerDown={(e) => e.stopPropagation()}>
            <TableSurface
              x={x}
              y={y}
              name={name}
              shape={shape}
              shapeStyle={shapeStyle}
              TABLE_CONFIG={{ ...TABLE_CONFIG, rectangleHeight: currentHeight }}
              isDraggingRef={isDragging}
              offsetRef={offset}
              onClick={() => {
                if (DidDragRef.current) return;
                setOpen(true);
              }}
              tableId={tableId}
              editableNameRef={editableNameRef}
              onSaveName={(newName) => updateTableName(tableId, newName)}
            />

            {/* Selection + resize handles — rectangle only */}
            {shape === 'rectangle' && (hovered || isRotating || isResizing) && (
              <div
                className="absolute border-2 border-blue-500 pointer-events-none rounded-[3px] transition-all"
                style={{
                  left:   centerX - tableWidth / 2 - 2,
                  top:    centerY - currentHeight / 2 - 2,
                  width:  tableWidth + 4,
                  height: currentHeight + 4,
                }}
              >
                {/* Rotate handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const node = wrapperRef.current;
                    if (!node) return;
                    rotatePointerId.current = e.pointerId;
                    try { node.setPointerCapture(e.pointerId); } catch {}
                    const rect = node.getBoundingClientRect();
                    const cx   = rect.left + rect.width / 2;
                    const cy   = rect.top + rect.height / 2;
                    rotateStart.current.angle    = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
                    rotateStart.current.rotation = rotation;
                    setIsRotating(true);
                  }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border border-slate-400 shadow-md rounded-full pointer-events-auto flex items-center justify-center cursor-alias hover:scale-110 active:scale-95 transition-transform"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </div>

                {/* Top resize handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    resizeStart.current = { y: e.clientY, initialHeight: currentHeight, initialY: y };
                    setIsResizing('top');
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-ns-resize hover:scale-y-125 transition-transform shadow-sm"
                />

                {/* Bottom resize handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    resizeStart.current = { y: e.clientY, initialHeight: currentHeight, initialY: y };
                    setIsResizing('bottom');
                  }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-2 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-ns-resize hover:scale-y-125 transition-transform shadow-sm"
                />
              </div>
            )}
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onClick={() => removeTable(tableId)}>
              Delete Table
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => setTimeout(() => editableNameRef.current?.startEditing(), 50)}
            >
              Rename
            </ContextMenuItem>
            {isLinked && (
              <ContextMenuItem onClick={() => unlinkTable(tableId)}>
                Separate Tables
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <TableSheet
        open={open}
        onOpenChange={setOpen}
        tableId={id}
        tableName={name}
        seatCount={calculatedSeatCount}
        shape={shape}
        rotation={rotation}
        hiddenSeats={hiddenSeats}
        onToggleSeat={(seatId) => toggleSeatVisibility(tableId, seatId)}
        isLinked={isLinked}
        linkedTableId={linkedTableId}
        onUnlink={() => unlinkTable(tableId)}
      />
    </div>
  );
};

// ─── Snap helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the ID of a nearby rectangle table that this table's foot
 * edge is close enough to snap onto, or null if none.
 */
function findSnapCandidate(
  x: number,
  y: number,
  selfId: string,
  allTables: import('@/store/useTableStore').SeatingTable[],
  selfHeight: number,
  selfWidth: number,
): string | null {
  for (const t of allTables) {
    if (t.id === selfId || t.shape !== 'rectangle' || t.linkedTableId) continue;

    // Foot edge of self (bottom centre in local space)
    const selfFootY = y + selfHeight / 2;
    // Head edge of candidate (top centre)
    const candidateHeadY = t.y - (t.height ?? 300) / 2;

    const xDiff = Math.abs(x - t.x);
    const yDiff = Math.abs(selfFootY - candidateHeadY);

    if (xDiff < selfWidth / 2 && yDiff < SNAP_THRESHOLD) {
      return t.id;
    }
  }
  return null;
}

/**
 * Returns the x/y this table should jump to when snapping foot-to-head
 * with a partner table.
 */
function calcSnapPosition(
  partner: import('@/store/useTableStore').SeatingTable,
  selfHeight: number,
  _selfWidth: number,
): { x: number; y: number } {
  const partnerHeight = partner.height ?? 300;
  // Align x centres, place foot of self flush with head of partner
  return {
    x: partner.x,
    y: partner.y - partnerHeight / 2 - selfHeight / 2,
  };
}