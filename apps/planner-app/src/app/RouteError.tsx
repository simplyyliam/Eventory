import { Link, useRouteError } from 'react-router-dom';
import { Button } from '@app/shared';

export function RouteError() {
  const error = useRouteError() as Error | undefined;
  return (
    <div className="grid h-svh place-items-center bg-canvas p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="text-[15px] font-semibold">Something went wrong</p>
        <p className="text-[13px] text-muted-foreground">{error?.message ?? 'This page failed to load.'}</p>
        <Button nativeButton={false} render={<Link to="/" />}>Back to events</Button>
      </div>
    </div>
  );
}
