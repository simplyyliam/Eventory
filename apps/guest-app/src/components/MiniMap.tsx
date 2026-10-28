import { motion } from 'motion/react';
import { resolveSeatCount, seatPoses, tableSize, type TableShape } from '@app/shared/domain/geometry';
import type { PublicEvent } from '@/lib/event';

const SHAPES: TableShape[] = ['circle', 'rectangle', 'square', 'row'];

// Same sizing rules as the planner, so the map matches what was laid out.
function geometry(t: PublicEvent['tables'][number]) {
  const shape = SHAPES.includes(t.shape as TableShape) ? (t.shape as TableShape) : 'circle';
  const seatCount = resolveSeatCount(shape, t.seatCount ?? 8, t.textureId, t.height);
  const { width, height } = tableSize(shape, seatCount);
  const hidden = t.hiddenSeats ?? [];
  const seats = seatPoses({ id: t.id, shape, seatCount, width, height }).filter((s) => !hidden.includes(s.id));
  return { shape, w: width, h: height, seats };
}

const ELEMENT_FILL: Record<string, string> = {
  stage: 'var(--ink)',
  'dance-floor': 'var(--line)',
  bar: 'color-mix(in oklch, var(--ink-faint) 60%, var(--card))',
  buffet: 'var(--line)',
  dj: 'var(--ink-soft)',
  entrance: 'transparent',
  pillar: 'var(--line)',
  plant: 'color-mix(in oklch, #6f8f5c 45%, var(--card))',
};

// A simplified floor plan drawn from the same positions the planner saved,
// with the guest's table picked out.
export function MiniMap({ event, tableId, seat }: { event: PublicEvent; tableId: string; seat: string | null }) {
  const tables = event.tables;
  const room = event.metadata?.venue?.room;
  const elements = event.metadata?.venue?.elements ?? [];

  const size = (t: PublicEvent['tables'][number]) => geometry(t);
  let minX: number, maxX: number, minY: number, maxY: number;
  if (room) {
    minX = -room.width / 2;
    maxX = room.width / 2;
    minY = -room.depth / 2;
    maxY = room.depth / 2;
  } else {
    const xs = tables.flatMap((t) => [t.x - size(t).w, t.x + size(t).w]);
    const ys = tables.flatMap((t) => [t.y - size(t).h, t.y + size(t).h]);
    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minY = Math.min(...ys);
    maxY = Math.max(...ys);
  }
  const pad = 140;
  const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  const mine = tables.find((t) => t.id === tableId);

  return (
    <svg viewBox={vb} className="h-auto w-full" role="img" aria-label={mine ? `Floor plan with ${mine.name} highlighted` : 'Floor plan'}>
      {room && <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} rx={30} fill="var(--card)" stroke="var(--line)" strokeWidth={8} />}
      {elements.map((el) => (
        <g key={el.id} transform={`translate(${el.x} ${el.y}) rotate(${el.rotation})`}>
          {el.kind === 'pillar' || el.kind === 'plant' ? (
            <circle r={Math.min(el.width, el.height) / 2} fill={ELEMENT_FILL[el.kind]} />
          ) : (
            <rect
              x={-el.width / 2}
              y={-el.height / 2}
              width={el.width}
              height={el.height}
              rx={16}
              fill={ELEMENT_FILL[el.kind] ?? 'var(--line)'}
              stroke={el.kind === 'entrance' ? 'var(--ink-faint)' : 'none'}
              strokeWidth={10}
              strokeDasharray={el.kind === 'entrance' ? '20 16' : undefined}
            />
          )}
          {(el.kind === 'stage' || el.kind === 'dance-floor' || el.kind === 'bar' || el.kind === 'entrance') && (
            <text
              transform={`rotate(${-el.rotation})`}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.min(90, el.height * 0.55, el.width * 0.18)}
              fontFamily="var(--font-mono)"
              letterSpacing="0.1em"
              fill={el.kind === 'stage' ? 'var(--paper)' : 'var(--ink-faint)'}
            >
              {el.label.toUpperCase()}
            </text>
          )}
        </g>
      ))}
      {tables.map((t) => {
        const g = geometry(t);
        const on = t.id === tableId;
        const fill = on ? 'var(--accent)' : 'color-mix(in oklch, var(--ink-faint) 35%, var(--card))';
        return (
          <g key={t.id} transform={`translate(${t.x} ${t.y}) rotate(${t.rotation})`}>
            {on && (
              <motion.circle
                r={Math.max(g.w, g.h) / 2 + 110}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={12}
                initial={{ opacity: 0.55, scale: 0.85 }}
                animate={{ opacity: 0, scale: 1.35 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            {g.seats.map((s) => {
              const mine = s.id === seat;
              return (
                <circle
                  key={s.id}
                  cx={s.x}
                  cy={s.y}
                  r={mine ? 46 : 32}
                  fill={mine ? 'var(--ink)' : on ? 'color-mix(in oklch, var(--accent) 35%, var(--card))' : 'var(--line)'}
                  stroke={mine ? 'var(--card)' : 'none'}
                  strokeWidth={14}
                />
              );
            })}
            {g.shape !== 'row' &&
              (g.shape === 'circle' ? <circle r={g.w / 2} fill={fill} /> : <rect x={-g.w / 2} y={-g.h / 2} width={g.w} height={g.h} rx={18} fill={fill} />)}
            {g.shape !== 'row' && (
              <text
                transform={`rotate(${-t.rotation})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(g.w, g.h) * 0.36}
                fontFamily="var(--font-mono)"
                fontWeight={on ? 600 : 400}
                fill={on ? 'var(--accent-ink)' : 'var(--ink-soft)'}
              >
                {t.tableNumber}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
