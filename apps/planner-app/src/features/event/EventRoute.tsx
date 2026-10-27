import { useEffect } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { Button } from '@app/shared';
import { Skeleton } from '@app/shared/components/ui/skeleton';
import { useEventQuery } from '@/lib/queries';
import { useWorkspace } from '@/store/workspace';
import { useAutosave } from '@/store/autosave';
import { useHistoryShortcuts } from './useHistoryShortcuts';

function Autosave() {
  useAutosave();
  useHistoryShortcuts();
  return null;
}

export function EventRoute() {
  const { slug = '' } = useParams();
  const loadedSlug = useWorkspace((s) => s.event?.slug);
  const ready = loadedSlug === slug;
  const query = useEventQuery(slug);

  useEffect(() => {
    if (!query.data) return;
    const current = useWorkspace.getState().event;
    if (current?.id !== query.data.id) useWorkspace.getState().hydrate(query.data);
  }, [query.data]);

  if (query.isError && !ready) {
    return (
      <div className="grid h-full place-items-center p-6">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <p className="text-[15px] font-semibold">Event not found</p>
          <p className="text-[13px] text-muted-foreground">It may have been renamed or deleted.</p>
          <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
            Back to events
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-10 py-10">
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <Autosave />
      <Outlet />
    </>
  );
}
