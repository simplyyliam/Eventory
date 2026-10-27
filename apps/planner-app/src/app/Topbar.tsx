import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { MoreHorizontal, PanelLeft } from 'lucide-react';
import { cn } from '@app/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/shared/components/ui/tooltip';
import { useWorkspace } from '@/store/workspace';
import { SaveIndicator } from '@/components/SaveIndicator';
import { useShell } from './shellStore';

const PAGE_LABELS: Record<string, string> = {
  'floor-plan': 'Floor plan',
  guests: 'Guests',
  view: '3D view',
  share: 'Share',
  settings: 'Settings',
};

type Crumb = { label: string; to?: string };

function useCrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const inEvent = useMatch('/events/:slug/*');
  const event = useWorkspace((s) => s.event);
  if (!inEvent) return [{ label: 'Events' }];
  const page = pathname.split('/')[3];
  const name = event?.name ?? '…';
  const base = `/events/${inEvent.params.slug}`;
  return page && PAGE_LABELS[page]
    ? [{ label: 'Events', to: '/' }, { label: name, to: base }, { label: PAGE_LABELS[page] }]
    : [{ label: 'Events', to: '/' }, { label: name }];
}

export function Topbar() {
  const crumbs = useCrumbs();
  const { collapsed, toggleCollapsed, setMobileOpen, setActionsEl } = useShell();
  const inEvent = useMatch('/events/:slug/*');
  const slug = inEvent?.params.slug;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-hairline px-3">
      <button
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="pressable grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent md:hidden"
      >
        <PanelLeft className="size-4" strokeWidth={1.75} />
      </button>
      {collapsed && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                aria-label="Show sidebar"
                onClick={toggleCollapsed}
                className="pressable hidden size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:grid"
              />
            }
          >
            <PanelLeft className="size-4" strokeWidth={1.75} />
          </TooltipTrigger>
          <TooltipContent side="bottom">Show sidebar</TooltipContent>
        </Tooltip>
      )}

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px]">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={i}>
              {i > 0 && <span className="text-faint">/</span>}
              {last ? (
                <span className="flex min-w-0 items-center gap-0.5 rounded-md bg-subtle py-0.5 pr-0.5 pl-2 font-medium">
                  <span className="truncate">{c.label}</span>
                  {slug ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<button aria-label="Page actions" className="grid size-5 place-items-center rounded text-faint hover:bg-accent hover:text-foreground" />}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuItem render={<Link to={`/events/${slug}/settings`} />}>Event settings</DropdownMenuItem>
                        <DropdownMenuItem render={<Link to={`/events/${slug}/share`} />}>Share & QR code</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy page link</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="w-1.5" />
                  )}
                </span>
              ) : (
                <Link to={c.to!} className={cn('truncate rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground', i === 1 && 'max-w-56')}>
                  {c.label}
                </Link>
              )}
            </Fragment>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        {slug && <SaveIndicator />}
        <div ref={setActionsEl} className="flex items-center gap-1.5" />
      </div>
    </header>
  );
}

// Lets a page put its primary actions in the top bar.
export function TopbarActions({ children }: { children: React.ReactNode }) {
  const el = useShell((s) => s.actionsEl);
  return el ? createPortal(children, el) : null;
}
