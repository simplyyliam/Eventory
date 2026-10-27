import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { create } from 'zustand';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { useWorkspace } from '@/store/workspace';
import { freeSeats } from '@/domain/seating';
import { seatNumber } from '@/domain/geometry';
import type { ElementKind, Guest, TableShape } from '@/domain/types';
import { DND_GUEST, DND_ITEM, GRID, useEditor } from '../editorStore';
import { usePalette } from './palette';
import { TableNode, type ItemHandlers } from './TableNode';
import { ElementNode } from './ElementNode';
import { halfExtents, snapToNeighbours, type Box, type Guide } from './snapping';
import { fitToContent, publishScale, syncBackground, zoomAt } from './viewport';

const useGuides = create<{ guides: Guide[]; set: (g: Guide[]) => void }>((set) => ({ guides: [], set: (guides) => set({ guides }) }));

export type DropPayload = { type: 'table'; shape: TableShape; seats: number } | { type: 'element'; kind: ElementKind };

function Guides({ color }: { color: string }) {
  const guides = useGuides((s) => s.guides);
  const scale = useEditor((s) => s.scale);
  return (
    <>
      {guides.map((g, i) => (
        <Line
          key={i}
          points={g.axis === 'x' ? [g.at, g.from - 60, g.at, g.to + 60] : [g.from - 60, g.at, g.to + 60, g.at]}
          stroke={color}
          strokeWidth={1.25 / scale}
          dash={[4 / scale, 4 / scale]}
          listening={false}
        />
      ))}
    </>
  );
}

const NO_GUESTS: Guest[] = [];

Konva.dragDistance = 3;

// Labels stay readable at any zoom. Stepped so zooming only re-renders the
// plan when the size actually changes.
// Bitmap resolution for cached tables, stepped to the zoom level.
const cacheRatioFor = (scale: number) => {
  const want = scale * (window.devicePixelRatio || 1);
  return want > 1.1 ? 2 : want > 0.55 ? 1 : want > 0.28 ? 0.5 : 0.3;
};

const labelFor = (scale: number) => Math.min(220, Math.max(22, Math.round(13 / scale / 8) * 8));

export function PlanCanvas({ onReady }: { onReady?: (stage: Konva.Stage) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const itemsRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const marqueeRef = useRef<Konva.Rect>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dropSeat, setDropSeat] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string; sub: string } | null>(null);
  const { p, dark } = usePalette();

  const tables = useWorkspace((s) => s.tables);
  const guests = useWorkspace((s) => s.guests);
  const venue = useWorkspace((s) => s.venue);
  const selected = useEditor((s) => s.selected);
  const labelSize = useEditor((s) => labelFor(s.scale));
  const cacheRatio = useEditor((s) => cacheRatioFor(s.scale));

  const guestsByTable = useMemo(() => {
    const map = new Map<string, Guest[]>();
    for (const g of guests) if (g.tableId) map.set(g.tableId, [...(map.get(g.tableId) ?? []), g]);
    return map;
  }, [guests]);


  // --- sizing and first fit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitted = useRef(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !size.width) return;
    if (!fitted.current) {
      fitted.current = true;
      fitToContent(stage, false);
      useEditor.getState().setStage(stage);
      onReady?.(stage);
    }
    syncBackground(stage);
  }, [size, onReady]);

  useEffect(() => () => useEditor.getState().setStage(null), []);

  // --- transformer follows the selection
  useEffect(() => {
    const stage = stageRef.current;
    const tr = trRef.current;
    if (!stage || !tr) return;
    const nodes = selected.map((id) => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    const single = nodes.length === 1 ? venue.elements.find((e) => e.id === selected[0]) : undefined;
    tr.enabledAnchors(single ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center'] : []);
    tr.getLayer()?.batchDraw();
  }, [selected, tables, venue.elements]);

  // --- dragging items
  const dragStart = useRef<{ id: string; origin: Map<string, { x: number; y: number }> } | null>(null);

  const boxesExcept = useCallback((ids: string[]): Box[] => {
    const { tables, venue } = useWorkspace.getState();
    return [...tables, ...venue.elements]
      .filter((i) => !ids.includes(i.id))
      .map((i) => ({ id: i.id, x: i.x, y: i.y, ...halfExtents(i.width, i.height, i.rotation) }));
  }, []);

  const handlers: ItemHandlers = useMemo(
    () => ({
      onSelect: (id, e) => {
        const shift = 'shiftKey' in e.evt && (e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey);
        const { selected, select, toggle } = useEditor.getState();
        if (shift) toggle(id);
        else if (!selected.includes(id)) select([id]);
      },
      onDragStart: (id) => {
        const stage = stageRef.current!;
        const { selected, select } = useEditor.getState();
        const ids = selected.includes(id) ? selected : [id];
        if (!selected.includes(id)) select([id]);
        const origin = new Map(ids.map((i) => [i, stage.findOne(`#${i}`)!.position()]));
        dragStart.current = { id, origin };
      },
      onDragMove: (id, e) => {
        const start = dragStart.current;
        if (!start || start.id !== id) return;
        const node = e.target;
        const stage = stageRef.current!;
        const { tables, venue } = useWorkspace.getState();
        const item = [...tables, ...venue.elements].find((i) => i.id === id);
        if (!item) return;
        let { x, y } = node.position();

        if (useEditor.getState().snap) {
          const others = boxesExcept([...start.origin.keys()]);
          const snapped = snapToNeighbours({ id, x, y, ...halfExtents(item.width, item.height, item.rotation) }, others, 8 / stage.scaleX());
          const gx = snapped.guides.some((g) => g.axis === 'x');
          const gy = snapped.guides.some((g) => g.axis === 'y');
          x = gx ? snapped.x : Math.round(x / GRID) * GRID;
          y = gy ? snapped.y : Math.round(y / GRID) * GRID;
          useGuides.getState().set(snapped.guides);
          node.position({ x, y });
        }

        const o = start.origin.get(id)!;
        const dx = x - o.x;
        const dy = y - o.y;
        for (const [other, pos] of start.origin) {
          if (other === id) continue;
          stage.findOne(`#${other}`)?.position({ x: pos.x + dx, y: pos.y + dy });
        }
      },
      onDragEnd: (id) => {
        const start = dragStart.current;
        dragStart.current = null;
        useGuides.getState().set([]);
        if (!start || start.id !== id) return;
        const stage = stageRef.current!;
        const moves = [...start.origin.keys()].map((i) => ({ id: i, ...stage.findOne(`#${i}`)!.position() }));
        const moved = moves.some((m) => {
          const o = start.origin.get(m.id)!;
          return Math.abs(m.x - o.x) > 0.5 || Math.abs(m.y - o.y) > 0.5;
        });
        if (moved) useWorkspace.getState().moveItems(moves);
      },
      onSeatHover: (seat) => {
        const stage = stageRef.current;
        const pos = stage?.getPointerPosition();
        if (!seat || !pos) return setTip(null);
        setTip({
          x: pos.x,
          y: pos.y,
          text: seat.guest ? seat.guest.name : 'Empty seat',
          sub: seat.guest ? `Seat ${seatNumber(seat.id)}${seat.guest.dietary.length ? ` · ${seat.guest.dietary.join(', ')}` : ''}` : `Seat ${seatNumber(seat.id)} · click to assign`,
        });
      },
      onSeatClick: (tableId, seatId) => {
        useEditor.getState().select([tableId]);
        useEditor.getState().setFocusSeat(seatId);
      },
    }),
    [boxesExcept],
  );

  // --- pan, zoom, marquee
  const marquee = useRef<{ x: number; y: number } | null>(null);
  const panned = useRef(false);

  // Hit-testing is redrawn with the scene; skipping it while the view moves
  // roughly halves the work per frame.
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pauseHits = () => {
    const layer = itemsRef.current;
    if (layer?.listening()) layer.listening(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => itemsRef.current?.listening(true), 140);
  };

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    pauseHits();
    const stage = stageRef.current!;
    const { deltaX, deltaY, ctrlKey } = e.evt;
    const trackpadPan = !ctrlKey && (Math.abs(deltaX) > 0 || !Number.isInteger(deltaY));
    if (trackpadPan) {
      stage.position({ x: stage.x() - deltaX, y: stage.y() - deltaY });
      syncBackground(stage);
      return;
    }
    const factor = Math.exp(-deltaY * (ctrlKey ? 0.01 : 0.0015));
    zoomAt(stage, factor, stage.getPointerPosition() ?? undefined);
  };

  const isEmpty = (t: Konva.Node) => t === stageRef.current || t.hasName('room');

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    panned.current = false;
    const stage = stageRef.current!;
    if (!isEmpty(e.target)) return;
    const shift = 'shiftKey' in e.evt && e.evt.shiftKey;
    if (shift) {
      stage.draggable(false);
      const pos = stage.getRelativePointerPosition()!;
      marquee.current = pos;
      marqueeRef.current?.setAttrs({ x: pos.x, y: pos.y, width: 0, height: 0, visible: true });
    } else {
      stage.draggable(true);
      stage.container().style.cursor = 'grabbing';
    }
  };

  const onMouseMove = () => {
    if (!marquee.current) return;
    const pos = stageRef.current!.getRelativePointerPosition()!;
    const m = marquee.current;
    marqueeRef.current?.setAttrs({ x: Math.min(m.x, pos.x), y: Math.min(m.y, pos.y), width: Math.abs(pos.x - m.x), height: Math.abs(pos.y - m.y) });
  };

  const onMouseUp = () => {
    const stage = stageRef.current!;
    stage.container().style.cursor = '';
    if (marquee.current && marqueeRef.current) {
      const box = marqueeRef.current.getClientRect();
      marqueeRef.current.visible(false);
      marquee.current = null;
      const hits = stage.find('.item').filter((n) => Konva.Util.haveIntersection(box, n.getClientRect())).map((n) => n.id());
      useEditor.getState().select(hits);
    }
    stage.draggable(true);
  };

  const onStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (panned.current) return;
    if (isEmpty(e.target)) useEditor.getState().select([]);
  };

  // --- drops from the panels
  const seatUnderPointer = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    let node: Konva.Node | null = stage.getIntersection(pos);
    while (node && node !== stage) {
      if (node.hasName('seat')) return { seatId: node.getAttr('seatId') as string, tableId: node.getAttr('tableId') as string };
      if (node.hasName('item')) return { seatId: null, tableId: node.id() };
      node = node.getParent();
    }
    return null;
  };

  const onDragOver = (e: React.DragEvent) => {
    const types = e.dataTransfer.types;
    if (!types.includes(DND_ITEM) && !types.includes(DND_GUEST)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = types.includes(DND_GUEST) ? 'link' : 'copy';
    if (types.includes(DND_GUEST)) {
      const stage = stageRef.current!;
      stage.setPointersPositions(e.nativeEvent);
      const hit = seatUnderPointer(stage);
      const next = hit?.seatId ?? null;
      if (next !== dropSeat) setDropSeat(next);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropSeat(null);
    const stage = stageRef.current!;
    stage.setPointersPositions(e.nativeEvent);
    const ws = useWorkspace.getState();

    const guestId = e.dataTransfer.getData(DND_GUEST);
    if (guestId) {
      const hit = seatUnderPointer(stage);
      const table = hit && ws.tables.find((t) => t.id === hit.tableId);
      if (!hit || !table) return toast('Drop the guest onto a seat or table');
      if (hit.seatId && table.hiddenSeats.includes(hit.seatId)) return toast('That seat is hidden');
      const seat = hit.seatId ?? freeSeats(table, ws.guests)[0]?.id;
      if (!seat) return toast(`${table.name} is full`);
      ws.assignSeat(guestId, table.id, seat);
      return;
    }

    const raw = e.dataTransfer.getData(DND_ITEM);
    if (!raw) return;
    const payload = JSON.parse(raw) as DropPayload;
    const pos = stage.getRelativePointerPosition()!;
    const at = useEditor.getState().snap ? { x: Math.round(pos.x / GRID) * GRID, y: Math.round(pos.y / GRID) * GRID } : pos;
    const id = payload.type === 'table' ? ws.addTable(payload.shape, at.x, at.y, payload.seats) : ws.addElement(payload.kind, at.x, at.y);
    useEditor.getState().select([id]);
  };

  const { width: rw, depth: rd } = venue.room;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: p.outside, backgroundImage: `radial-gradient(circle, ${p.dot} 1.2px, transparent 1.3px)` }}
      onDragOver={onDragOver}
      onDragLeave={() => setDropSeat(null)}
      onDrop={onDrop}
    >
      {size.width > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          draggable
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchEnd={onMouseUp}
          onClick={onStageClick}
          onTap={onStageClick}
          onDragMove={(e) => {
            if (e.target !== stageRef.current) return;
            panned.current = true;
            pauseHits();
            syncBackground(e.target as Konva.Stage);
          }}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) publishScale(stageRef.current);
          }}
        >
          <Layer>
            <Rect x={-rw / 2 - 2} y={-rd / 2 + 6} width={rw + 4} height={rd + 4} cornerRadius={14} fill={p.roomShadow} listening={false} perfectDrawEnabled={false} />
            <Rect
              name="room"
              x={-rw / 2}
              y={-rd / 2}
              width={rw}
              height={rd}
              fill={p.room}
              stroke={p.roomStroke}
              strokeWidth={1}
              strokeScaleEnabled={false}
              cornerRadius={12}
              perfectDrawEnabled={false}
            />
            <Text
              x={-rw / 2}
              y={-rd / 2 - labelSize * 1.4}
              text={`Room · ${(rw / 200).toFixed(1).replace(/\.0$/, '')} × ${(rd / 200).toFixed(1).replace(/\.0$/, '')} m`}
              fontSize={labelSize * 0.8}
              fontFamily="Inter Variable, sans-serif"
              fill={p.textMuted}
              listening={false}
            />
          </Layer>
          <Layer ref={itemsRef}>
            {venue.elements.map((el) => (
              <ElementNode key={el.id} element={el} selected={selected.includes(el.id)} labelSize={labelSize} p={p} dark={dark} handlers={handlers} />
            ))}
            {tables.map((t) => (
              <TableNode
                key={t.id}
                table={t}
                guests={guestsByTable.get(t.id) ?? NO_GUESTS}
                selected={selected.includes(t.id)}
                dropSeat={dropSeat?.startsWith(t.id) ? dropSeat : null}
                labelSize={labelSize}
                cacheRatio={cacheRatio}
                p={p}
                dark={dark}
                handlers={handlers}
              />
            ))}
          </Layer>
          <Layer>
            <Guides color={p.guide} />
            <Rect ref={marqueeRef} visible={false} fill="rgba(59,108,240,0.08)" stroke={p.select} strokeWidth={1} strokeScaleEnabled={false} listening={false} />
            <Transformer
              ref={trRef}
              rotateEnabled
              flipEnabled={false}
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
              rotationSnapTolerance={6}
              rotateAnchorOffset={28}
              anchorSize={9}
              anchorCornerRadius={3}
              anchorStroke={p.select}
              anchorFill="#ffffff"
              borderStroke={p.select}
              borderStrokeWidth={1.25}
              padding={10}
              ignoreStroke
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
              onTransformEnd={() => {
                const tr = trRef.current!;
                const patches = tr.nodes().map((n) => {
                  const sx = n.scaleX();
                  const sy = n.scaleY();
                  n.scale({ x: 1, y: 1 });
                  const el = useWorkspace.getState().venue.elements.find((e) => e.id === n.id());
                  return {
                    id: n.id(),
                    x: n.x(),
                    y: n.y(),
                    rotation: Math.round(n.rotation() * 10) / 10,
                    ...(el ? { width: Math.round(el.width * sx), height: Math.round(el.height * sy) } : {}),
                  };
                });
                useWorkspace.getState().patchItems(patches);
              }}
            />
          </Layer>
        </Stage>
      )}

      <AnimatePresence>
        {tip && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, transform: 'translateY(4px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-none absolute z-20 flex flex-col rounded-lg bg-foreground px-2.5 py-1.5 text-background shadow-lg"
            style={{ left: tip.x + 14, top: tip.y + 14 }}
          >
            <span className="text-[12.5px] font-medium">{tip.text}</span>
            <span className="text-[11.5px] opacity-70">{tip.sub}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
