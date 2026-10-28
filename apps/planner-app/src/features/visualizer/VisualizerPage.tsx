import { Suspense, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'motion/react';
import { Box, Eye, Footprints, LayoutGrid, Moon, Plane, Rotate3d, Square, Sun, Tag, Users } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { resolvedTheme, useTheme } from '@/lib/theme';
import { eventStats } from '@/domain/stats';
import { useEditor } from '@/features/floor-plan/editorStore';
import { Scene } from './scene/Scene';
import { useView, type NavMode, type ViewPreset } from './viewStore';

const island = 'rounded-xl bg-surface/90 shadow-[0_0_0_1px_var(--hairline),0_8px_28px_-10px_rgb(0_0_0/0.2)] backdrop-blur-xl';

function Seg<T extends string>({ value, items, onChange, id }: { value: T; items: { value: T; label: string; icon: React.ElementType; hint?: string }[]; onChange: (v: T) => void; id: string }) {
  return (
    <div className="flex gap-0.5">
      {items.map((it) => (
        <Tooltip key={it.value}>
          <TooltipTrigger
            render={
              <button
                aria-pressed={value === it.value}
                onClick={() => onChange(it.value)}
                className={cn('relative flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground', value === it.value && 'text-foreground')}
              />
            }
          >
            {value === it.value && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-subtle" transition={{ type: 'spring', duration: 0.3, bounce: 0 }} />}
            <it.icon className="relative size-4" strokeWidth={1.75} />
            <span className="relative">{it.label}</span>
          </TooltipTrigger>
          {it.hint && <TooltipContent side="bottom">{it.hint}</TooltipContent>}
        </Tooltip>
      ))}
    </div>
  );
}

function IconToggle({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-pressed={on}
            aria-label={label}
            onClick={onClick}
            className={cn('pressable grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground', on && 'bg-subtle text-foreground')}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

const MODES: { value: NavMode; label: string; icon: React.ElementType; hint: string }[] = [
  { value: 'orbit', label: 'Orbit', icon: Rotate3d, hint: 'Look at the room from above' },
  { value: 'walk', label: 'Walk', icon: Footprints, hint: 'Stand in the room at eye level' },
  { value: 'fly', label: 'Fly', icon: Plane, hint: 'Glide freely through the space' },
];

const HINTS: Record<NavMode, string> = {
  orbit: 'Drag to rotate · Right-drag to pan · Scroll to zoom · Click a table for details',
  walk: 'Drag to look around · Click the floor to walk there · Scroll to step forward',
  fly: 'Drag to look around · Scroll to glide · Right-drag to pan',
};

const PRESETS: { value: ViewPreset; label: string; icon: React.ElementType }[] = [
  { value: 'isometric', label: 'Corner', icon: Box },
  { value: 'top', label: 'Top', icon: Square },
  { value: 'front', label: 'Entrance', icon: Eye },
];

export default function VisualizerPage() {
  const navigate = useNavigate();
  const slug = useWorkspace((s) => s.event?.slug);
  const empty = useWorkspace((s) => s.tables.length === 0 && s.venue.elements.length === 0);
  const tables = useWorkspace((s) => s.tables);
  const guests = useWorkspace((s) => s.guests);
  const stats = useMemo(() => eventStats(tables, guests), [tables, guests]);
  const theme = useTheme((s) => s.theme);
  const dark = resolvedTheme(theme) === 'dark';
  const v = useView();

  useEffect(() => {
    useView.setState({
      openInPlan: (id) => {
        useEditor.getState().select([id]);
        navigate(`/events/${slug}/floor-plan`);
      },
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useView.getState().mode === 'orbit') useView.getState().select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      useView.setState({ selected: null, hovered: null, mode: 'orbit', locked: false });
      document.body.style.cursor = '';
    };
  }, [navigate, slug]);


  // Full native resolution; smoothness comes from rendering only when something moves.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        id="view-canvas"
        shadows
        dpr={dpr}
        frameloop="demand"
        camera={{ fov: 42, near: 0.1, far: 400, position: [12, 12, 14] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => v.select(null)}
      >
        <Suspense fallback={null}>
          <Scene dark={dark} />
        </Suspense>
      </Canvas>

      {/* top-left: navigation mode */}
      <div className={cn('absolute top-3 left-3 p-1', island)}>
        <Seg id="mode" value={v.mode} items={MODES} onChange={v.setMode} />
      </div>

      {/* top-right: summary + back to 2D */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={cn('flex h-10 items-center gap-3 px-3.5 text-[12.5px]', island)}>
          <span>
            <span className="font-medium tabular">{stats.tables}</span> <span className="text-muted-foreground">tables</span>
          </span>
          <span className="h-4 w-px bg-hairline" />
          <span>
            <span className="font-medium tabular">{stats.seated}</span>
            <span className="text-muted-foreground tabular"> / {stats.guests - stats.declined} seated</span>
          </span>
        </div>
        <Button variant="outline" className="h-10 rounded-xl" onClick={() => navigate(`/events/${slug}/floor-plan`)}>
          <LayoutGrid className="size-4" />
          Edit in 2D
        </Button>
      </div>

      {/* bottom: view presets and display toggles */}
      <div className={cn('absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 p-1', island)}>
        <Seg id="preset" value={v.mode === 'orbit' ? v.preset : ('' as ViewPreset)} items={PRESETS} onChange={v.setPreset} />
        <span className="mx-1 h-5 w-px bg-hairline" />
        <IconToggle on={v.lighting === 'day'} onClick={() => v.setLighting('day')} label="Daylight">
          <Sun className="size-4" strokeWidth={1.75} />
        </IconToggle>
        <IconToggle on={v.lighting === 'evening'} onClick={() => v.setLighting('evening')} label="Evening">
          <Moon className="size-4" strokeWidth={1.75} />
        </IconToggle>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <IconToggle on={v.labels} onClick={v.toggleLabels} label="Table labels">
          <Tag className="size-4" strokeWidth={1.75} />
        </IconToggle>
        <IconToggle on={v.people} onClick={v.togglePeople} label="Seated guests">
          <Users className="size-4" strokeWidth={1.75} />
        </IconToggle>
      </div>

      {!empty && (
        <AnimatePresence mode="wait">
          <motion.p
            key={v.mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-16 left-4 hidden items-center gap-1.5 text-[11.5px] text-muted-foreground lg:flex"
          >
            {HINTS[v.mode]}
          </motion.p>
        </AnimatePresence>
      )}

      {empty && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className={cn('pointer-events-auto flex flex-col items-center gap-3 px-6 py-5 text-center', island)}>
            <p className="text-[13.5px] font-medium">Nothing to show yet</p>
            <p className="max-w-60 text-[12.5px] text-muted-foreground">Place tables on the floor plan and they’ll appear here in 3D.</p>
            <Button size="sm" onClick={() => navigate(`/events/${slug}/floor-plan`)}>
              Open floor plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
