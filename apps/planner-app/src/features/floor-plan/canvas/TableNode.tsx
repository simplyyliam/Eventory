import { memo, useEffect, useRef } from 'react';
import { Circle, Group, Image, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import { CHAIR_SIZE, seatPoses } from '@/domain/geometry';
import type { Guest, PlanTable } from '@/domain/types';
import { getInitials } from '@/lib/format';
import type { Palette } from './palette';
import { CHAIR_PAD, SHADOW_PAD, chairSprite, tableSprite } from './sprites';

export type ItemHandlers = {
  onSelect: (id: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onSeatHover: (seat: { id: string; guest: Guest | null } | null) => void;
  onSeatClick: (tableId: string, seatId: string) => void;
};

// ease-out with a gentle overshoot, in Konva's tween signature
const easeOutBack = (t: number, b: number, c: number, d: number) => {
  const s = 1.4;
  t = t / d - 1;
  return c * (t * t * ((s + 1) * t + s) + 1) + b;
};

const CHAIR_W = CHAIR_SIZE * 0.92;
const CHAIR_D = CHAIR_SIZE * 0.82;

const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
  const stage = e.target.getStage();
  if (stage) stage.container().style.cursor = cursor;
};

type SeatProps = {
  pose: ReturnType<typeof seatPoses>[number];
  guest: Guest | null;
  hidden: boolean;
  showHidden: boolean;
  highlight: boolean;
  tableRotation: number;
  p: Palette;
  dark: boolean;
  tableId: string;
  handlers: ItemHandlers;
};

const Seat = memo(function Seat({ pose, guest, hidden, showHidden, highlight, tableRotation, p, dark, tableId, handlers }: SeatProps) {
  const ref = useRef<Konva.Group>(null);
  const prevGuest = useRef(guest?.id);

  // A small pop when someone sits down.
  useEffect(() => {
    const node = ref.current;
    if (node && guest && prevGuest.current !== guest.id) {
      node.scale({ x: 0.75, y: 0.75 });
      node.to({ scaleX: 1, scaleY: 1, duration: 0.35, easing: easeOutBack });
    }
    prevGuest.current = guest?.id;
  }, [guest]);

  if (hidden && !showHidden) return null;

  return (
    <Group
      ref={ref}
      x={pose.x}
      y={pose.y}
      rotation={pose.angle}
      name="seat"
      seatId={pose.id}
      tableId={tableId}
      onMouseEnter={(e) => {
        setCursor(e, 'pointer');
        handlers.onSeatHover({ id: pose.id, guest });
      }}
      onMouseLeave={(e) => {
        setCursor(e, '');
        handlers.onSeatHover(null);
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        handlers.onSeatClick(tableId, pose.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        handlers.onSeatClick(tableId, pose.id);
      }}
    >
      {hidden ? (
        <Rect
          x={-CHAIR_W / 2}
          y={-CHAIR_D / 2}
          width={CHAIR_W}
          height={CHAIR_D}
          cornerRadius={CHAIR_D * 0.28}
          stroke={p.chairStroke}
          strokeWidth={2}
          dash={[8, 6]}
          fill="rgba(0,0,0,0.001)"
          perfectDrawEnabled={false}
        />
      ) : (
        <Image
          image={chairSprite(CHAIR_W, CHAIR_D, guest ? 'taken' : 'empty', dark)}
          x={-CHAIR_W / 2 - CHAIR_PAD}
          y={-CHAIR_D / 2 - CHAIR_PAD}
          width={CHAIR_W + CHAIR_PAD * 2}
          height={CHAIR_D + CHAIR_PAD * 2}
        />
      )}
      {highlight && (
        <Rect
          x={-CHAIR_W / 2 - 6}
          y={-CHAIR_D / 2 - 6}
          width={CHAIR_W + 12}
          height={CHAIR_D + 12}
          cornerRadius={CHAIR_D * 0.35}
          stroke={p.dropTarget}
          strokeWidth={5}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
      {guest && (
        <Text
          text={getInitials(guest.name)}
          width={CHAIR_W}
          height={CHAIR_D}
          offsetX={CHAIR_W / 2}
          offsetY={CHAIR_D / 2}
          rotation={-(pose.angle + tableRotation)}
          align="center"
          verticalAlign="middle"
          fontSize={28}
          fontStyle="600"
          fontFamily="Inter Variable, sans-serif"
          fill={p.text}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
});

type Props = {
  table: PlanTable;
  guests: Guest[];
  selected: boolean;
  dropSeat: string | null;
  labelSize: number;
  cacheRatio: number;
  p: Palette;
  dark: boolean;
  handlers: ItemHandlers;
};

export const TableNode = memo(function TableNode({ table, guests, selected, dropSeat, labelSize, cacheRatio, p, dark, handlers }: Props) {
  const groupRef = useRef<Konva.Group>(null);

  // Unselected tables are drawn from a bitmap, which keeps panning cheap no
  // matter how many seats and labels there are. The delay lets the seat pop
  // finish before it's frozen into the cache.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.clearCache();
    if (selected || dropSeat) return;
    const t = setTimeout(() => g.cache({ pixelRatio: cacheRatio }), 420);
    return () => clearTimeout(t);
  }, [table, guests, selected, dropSeat, labelSize, cacheRatio, dark]);
  const poses = seatPoses(table);
  const bySeat = new Map(guests.map((g) => [g.seat, g]));
  const visible = poses.filter((s) => !table.hiddenSeats.includes(s.id)).length;
  const isRow = table.shape === 'row';
  const round = table.shape === 'circle';
  // never let the label outgrow the table top
  const label = Math.min(labelSize, table.width * 0.2);
  const darkTop = table.finish === 'walnut';

  // lift on drag: scale only, so nothing has to re-render a shadow
  const lift = (up: boolean) => groupRef.current?.to({ scaleX: up ? 1.025 : 1, scaleY: up ? 1.025 : 1, duration: up ? 0.14 : 0.22 });

  return (
    <Group
      ref={groupRef}
      id={table.id}
      name="item"
      x={table.x}
      y={table.y}
      rotation={table.rotation}
      draggable
      onMouseDown={(e) => handlers.onSelect(table.id, e)}
      onTap={(e) => handlers.onSelect(table.id, e)}
      onDragStart={(e) => {
        lift(true);
        handlers.onDragStart(table.id, e);
      }}
      onDragMove={(e) => handlers.onDragMove(table.id, e)}
      onDragEnd={(e) => {
        lift(false);
        handlers.onDragEnd(table.id, e);
      }}
      onMouseEnter={(e) => {
        if (!e.target.findAncestor('.seat', true)) setCursor(e, 'move');
      }}
      onMouseLeave={(e) => setCursor(e, '')}
    >
      {isRow ? (
        <Rect
          x={-table.width / 2 - 12}
          y={-table.height / 2 - 12}
          width={table.width + 24}
          height={table.height + 24}
          cornerRadius={14}
          fill="rgba(0,0,0,0.001)"
          perfectDrawEnabled={false}
        />
      ) : (
        <Image
          image={tableSprite(round, table.width, table.height, table.finish, dark)}
          x={-table.width / 2 - SHADOW_PAD}
          y={-table.height / 2 - SHADOW_PAD}
          width={table.width + SHADOW_PAD * 2}
          height={table.height + SHADOW_PAD * 2}
        />
      )}

      {selected &&
        (round ? (
          <Circle radius={table.width / 2 + 8} stroke={p.select} strokeWidth={2} strokeScaleEnabled={false} listening={false} perfectDrawEnabled={false} />
        ) : (
          <Rect
            x={-table.width / 2 - (isRow ? 16 : 8)}
            y={-table.height / 2 - (isRow ? 16 : 8)}
            width={table.width + (isRow ? 32 : 16)}
            height={table.height + (isRow ? 32 : 16)}
            cornerRadius={14}
            stroke={p.select}
            strokeWidth={2}
            strokeScaleEnabled={false}
            listening={false}
            perfectDrawEnabled={false}
          />
        ))}

      {poses.map((pose) => (
        <Seat
          key={pose.id}
          pose={pose}
          guest={bySeat.get(pose.id) ?? null}
          hidden={table.hiddenSeats.includes(pose.id)}
          showHidden={selected}
          highlight={dropSeat === pose.id}
          tableRotation={table.rotation}
          p={p}
          dark={dark}
          tableId={table.id}
          handlers={handlers}
        />
      ))}

      {!isRow && (
        <Group rotation={-table.rotation} listening={false}>
          <Text
            text={table.name}
            width={table.width * 0.9}
            offsetX={table.width * 0.45}
            offsetY={label * 0.95}
            align="center"
            fontSize={label}
            fontStyle="600"
            fontFamily="Inter Variable, sans-serif"
            fill={darkTop ? '#fbf7f1' : p.text}
            ellipsis
            wrap="none"
            perfectDrawEnabled={false}
          />
          <Text
            text={`${guests.length}/${visible}`}
            width={400}
            offsetX={200}
            y={label * 0.15}
            align="center"
            fontSize={label * 0.8}
            fontFamily="Inter Variable, sans-serif"
            fill={darkTop ? '#e8dccd' : p.textMuted}
            perfectDrawEnabled={false}
          />
        </Group>
      )}
    </Group>
  );
});
