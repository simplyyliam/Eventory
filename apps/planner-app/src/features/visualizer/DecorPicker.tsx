import { Check, ChevronDown, Palette } from 'lucide-react';
import { cn } from '@app/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { useWorkspace } from '@/store/workspace';
import type { DecorTheme } from '@/domain/types';
import { ACCENTS, THEMES, decorOf } from '@/domain/decor';

export function AccentSwatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {ACCENTS.map((c) => (
        <button
          key={c}
          aria-label={`Accent ${c}`}
          onClick={() => onChange(c)}
          className={cn('pressable size-5.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]', value === c && 'shadow-[0_0_0_2px_var(--popover),0_0_0_3.5px_var(--foreground)]')}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

// Decor style is saved with the event, so the 3D view always opens dressed
// the way the planner left it.
export function DecorPicker() {
  const decor = decorOf(useWorkspace((s) => s.details.decor));
  const update = useWorkspace((s) => s.updateDetails);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="pressable flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-subtle aria-expanded:text-foreground" />}
      >
        <span className="size-3 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]" style={{ background: decor.accent }} />
        {THEMES[decor.theme].label}
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5">
            <Palette className="size-3.5" /> Decor style
          </DropdownMenuLabel>
          {(Object.keys(THEMES) as DecorTheme[]).map((t) => (
            <DropdownMenuItem key={t} onClick={() => update({ decor: { ...decor, theme: t } })}>
              <span className="flex-1">{THEMES[t].label}</span>
              {decor.theme === t && <Check className="size-3.5 text-muted-foreground" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 px-2 py-1.5">
          <span className="text-[12px] text-muted-foreground">Accent colour</span>
          <AccentSwatches value={decor.accent} onChange={(accent) => update({ decor: { ...decor, accent } })} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
