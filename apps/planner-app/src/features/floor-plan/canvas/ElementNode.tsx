import { memo } from 'react';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { VenueElement } from '@/domain/types';
import { ELEMENT_STYLE, type Palette } from './palette';
import type { ItemHandlers } from './TableNode';

type Props = {
  element: VenueElement;
  selected: boolean;
  labelSize: number;
  p: Palette;
  dark: boolean;
  handlers: Pick<ItemHandlers, 'onSelect' | 'onDragStart' | 'onDragMove' | 'onDragEnd'>;
};

// Faint parquet lines so the dance floor reads as a surface, not a box.
function DanceFloorLines({ w, h, color }: { w: number; h: number; color: string }) {
  const step = 100;
  const lines = [];
  for (let x = step; x < w; x += step) lines.push(<Line key={`x${x}`} points={[x - w / 2, -h / 2, x - w / 2, h / 2]} stroke={color} strokeWidth={2} perfectDrawEnabled={false} />);
  for (let y = step; y < h; y += step) lines.push(<Line key={`y${y}`} points={[-w / 2, y - h / 2, w / 2, y - h / 2]} stroke={color} strokeWidth={2} perfectDrawEnabled={false} />);
  return <Group listening={false} opacity={0.5}>{lines}</Group>;
}

export const ElementNode = memo(function ElementNode({ element, selected, labelSize: rawLabel, p, dark, handlers }: Props) {
  const style = ELEMENT_STYLE[element.kind];
  const { width: w, height: h } = element;
  const round = element.kind === 'pillar' || element.kind === 'plant' || element.kind === 'cake';
  const labelSize = Math.min(rawLabel, Math.min(w, h) * 0.35);

  return (
    <Group
      id={element.id}
      name="item"
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable
      onMouseDown={(e) => handlers.onSelect(element.id, e)}
      onTap={(e) => handlers.onSelect(element.id, e)}
      onDragStart={(e) => handlers.onDragStart(element.id, e)}
      onDragMove={(e) => handlers.onDragMove(element.id, e)}
      onDragEnd={(e) => handlers.onDragEnd(element.id, e)}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'move';
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = '';
      }}
    >
      {round ? (
        <Circle
          radius={Math.min(w, h) / 2}
          fill={dark ? style.darkFill : style.fill}
          stroke={selected ? p.select : style.stroke}
          strokeWidth={selected ? 2 : 1}
          strokeScaleEnabled={false}
          perfectDrawEnabled={false}
        />
      ) : (
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          cornerRadius={Math.min(16, Math.min(w, h) / 4)}
          fill={dark ? style.darkFill : style.fill}
          stroke={selected ? p.select : style.stroke}
          strokeWidth={selected ? 2 : 1}
          strokeScaleEnabled={false}
          perfectDrawEnabled={false}
        />
      )}
      {element.kind === 'dance-floor' && <DanceFloorLines w={w} h={h} color={style.stroke} />}
      {!round && (
        <Group rotation={-element.rotation} listening={false}>
          <Text
            text={element.label.toUpperCase()}
            width={Math.max(w, h)}
            offsetX={Math.max(w, h) / 2}
            offsetY={labelSize * 0.45}
            align="center"
            fontSize={labelSize * 0.78}
            letterSpacing={labelSize * 0.08}
            fontStyle="600"
            fontFamily="Inter Variable, sans-serif"
            fill={dark && element.kind !== 'stage' && element.kind !== 'dj' ? p.textMuted : style.text}
            wrap="none"
            ellipsis
          />
        </Group>
      )}
    </Group>
  );
});
