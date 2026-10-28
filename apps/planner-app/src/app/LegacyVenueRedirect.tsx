import { Navigate, useParams } from 'react-router-dom';

// Old links pointed at /venue/:slug.
export function LegacyVenueRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/events/${slug}/floor-plan`} replace />;
}
