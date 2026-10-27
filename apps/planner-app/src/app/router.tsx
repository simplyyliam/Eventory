import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AppShell } from './AppShell';
import { RouteError } from './RouteError';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EventRoute } from '@/features/event/EventRoute';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { GuestsPage } from '@/features/guests/GuestsPage';
import { SharePage } from '@/features/share/SharePage';
import { SettingsPage } from '@/features/settings/SettingsPage';

// The two canvas-heavy screens are split out so the dashboard loads light.
const lazyPage = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

function LegacyVenueRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/events/${slug}/floor-plan`} replace />;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'events/:slug',
        element: <EventRoute />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'floor-plan', lazy: lazyPage(() => import('@/features/floor-plan/FloorPlanPage')) },
          { path: 'guests', element: <GuestsPage /> },
          { path: 'view', lazy: lazyPage(() => import('@/features/visualizer/VisualizerPage')) },
          { path: 'share', element: <SharePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: 'venue/:slug', element: <LegacyVenueRedirect /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
