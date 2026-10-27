import { useStore } from 'zustand';
import { Grid2x2Check, Grid2x2X, Maximize, Minus, Plus, Redo2, Undo2 } from 'lucide-react';
import { cn } from '@app/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { redo, undo, useWorkspace } from '@/store/workspace';
import { Kbd, MOD } from '@/components/layout';
import { useEditor } from '../editorStore';
import { fitToContent, zoomAt } from '../canvas/viewport';

function ToolButton({ label, shortcut, onClick, disabled, active, children }: { label: string; shortcut?: string[]; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
            disabled={disabled}
            className={cn(
              'pressable grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35',
              active && 'bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand',
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        {label}
        {shortcut && (
          <span className="flex gap-0.5">
            {shortcut.map((k) => (
              <Kbd key={k} className="border-white/15 bg-white/10 text-background/80 shadow-none">
                {k}
              </Kbd>
            ))}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-hairline" />;

export function Toolbar() {
  const canUndo = useStore(useWorkspace.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useWorkspace.temporal, (s) => s.futureStates.length > 0);
  const scale = useEditor((s) => s.scale);
  const snap = useEditor((s) => s.snap);
  const setSnap = useEditor((s) => s.setSnap);
  const stage = useEditor((s) => s.stage);

  return (
    <div className="flex h-11 items-center gap-0.5 rounded-2xl bg-surface/95 px-1.5 shadow-[0_0_0_1px_var(--hairline),0_8px_30px_-8px_rgb(0_0_0/0.12)] backdrop-blur-xl">
      <ToolButton label="Undo" shortcut={[MOD, 'Z']} onClick={undo} disabled={!canUndo}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Redo" shortcut={[MOD, '⇧', 'Z']} onClick={redo} disabled={!canRedo}>
        <Redo2 className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Zoom out" shortcut={['−']} onClick={() => stage && zoomAt(stage, 1 / 1.25, undefined, true)}>
        <Minus className="size-4" />
      </ToolButton>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              onClick={() => stage && fitToContent(stage)}
              className="pressable h-8 w-14 rounded-lg text-[12.5px] font-medium text-muted-foreground tabular hover:bg-accent hover:text-foreground"
            />
          }
        >
          {Math.round(scale * 400)}%
        </TooltipTrigger>
        <TooltipContent side="bottom">Fit to room</TooltipContent>
      </Tooltip>
      <ToolButton label="Zoom in" shortcut={['+']} onClick={() => stage && zoomAt(stage, 1.25, undefined, true)}>
        <Plus className="size-4" />
      </ToolButton>
      <ToolButton label="Fit to room" shortcut={['⇧', '1']} onClick={() => stage && fitToContent(stage)}>
        <Maximize className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label={snap ? 'Snapping on' : 'Snapping off'} shortcut={['G']} onClick={() => setSnap(!snap)} active={snap}>
        {snap ? <Grid2x2Check className="size-4" /> : <Grid2x2X className="size-4" />}
      </ToolButton>
    </div>
  );
}
