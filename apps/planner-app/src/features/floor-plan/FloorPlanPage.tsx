import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import { Button } from '@app/shared';
import { useWorkspace } from '@/store/workspace';
import { isTyping } from '@/features/event/useHistoryShortcuts';
import { Kbd } from '@/components/layout';
import { PlanCanvas } from './canvas/PlanCanvas';
import { ContentsPanel } from './panels/ContentsPanel';
import { Inspector } from './panels/Inspector';
import { Toolbar } from './panels/Toolbar';
import { GRID, useEditor } from './editorStore';
import { fitToContent, zoomAt } from './canvas/viewport';

function useEditorShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      const ed = useEditor.getState();
      const ws = useWorkspace.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if ((key === 'delete' || key === 'backspace') && ed.selected.length) {
        e.preventDefault();
        ws.removeItems(ed.selected);
        ed.select([]);
      } else if (mod && key === 'd' && ed.selected.length) {
        e.preventDefault();
        ed.select(ws.duplicate(ed.selected));
      } else if (mod && key === 'a') {
        e.preventDefault();
        ed.select([...ws.tables.map((t) => t.id), ...ws.venue.elements.map((el) => el.id)]);
      } else if (key === 'escape') {
        ed.select([]);
      } else if (key.startsWith('arrow') && ed.selected.length) {
        e.preventDefault();
        const step = e.shiftKey ? GRID * 4 : GRID / 2;
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
        const items = [...ws.tables, ...ws.venue.elements].filter((i) => ed.selected.includes(i.id));
        ws.moveItems(items.map((i) => ({ id: i.id, x: i.x + dx, y: i.y + dy })));
      } else if (!mod && key === 'g') {
        ed.setSnap(!ed.snap);
      } else if (e.shiftKey && (key === '1' || key === '!') && ed.stage) {
        fitToContent(ed.stage);
      } else if (!mod && (key === '=' || key === '+') && ed.stage) {
        zoomAt(ed.stage, 1.25, undefined, true);
      } else if (!mod && (key === '-' || key === '_') && ed.stage) {
        zoomAt(ed.stage, 1 / 1.25, undefined, true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export default function FloorPlanPage() {
  const slug = useWorkspace((s) => s.event?.slug);
  const empty = useWorkspace((s) => s.tables.length === 0 && s.venue.elements.length === 0);
  useEditorShortcuts();

  useEffect(() => () => useEditor.getState().select([]), []);

  return (
    <div className="relative h-full w-full select-none">
      <PlanCanvas />

      <div className="pointer-events-none absolute inset-0 flex p-3">
        <div className="pointer-events-auto flex min-h-0 flex-col">
          <ContentsPanel />
        </div>

        <div className="flex flex-1 flex-col items-center">
          <div className="pointer-events-auto">
            <Toolbar />
          </div>
          {empty && (
            <div className="pointer-events-none mt-auto mb-4 flex items-center gap-2 rounded-full bg-surface/90 px-3.5 py-2 text-[12.5px] text-muted-foreground shadow-[0_0_0_1px_var(--hairline)] backdrop-blur">
              Drag a table from the left onto the room to start
            </div>
          )}
          {!empty && (
            <div className="mt-auto mb-1 hidden items-center gap-3 text-[11.5px] text-faint lg:flex">
              <span className="flex items-center gap-1">
                <Kbd>Drag</Kbd> pan
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Scroll</Kbd> zoom
              </span>
              <span className="flex items-center gap-1">
                <Kbd>⇧</Kbd>
                <Kbd>Drag</Kbd> select area
              </span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex min-h-0 flex-col items-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link to={`/events/${slug}/view`} />} className="shadow-[0_0_0_1px_var(--hairline),0_4px_14px_-6px_rgb(0_0_0/0.15)]">
            <Box className="size-4" />
            View in 3D
          </Button>
          <div className="flex min-h-0 flex-1 flex-col">
            <Inspector />
          </div>
        </div>
      </div>
    </div>
  );
}
