import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/login') {
      const timer = setTimeout(() => setShouldRedirect(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}