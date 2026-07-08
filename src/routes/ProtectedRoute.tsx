import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();

  // Don't redirect while we're still verifying a stored token on refresh —
  // that would cause a flash to /login before we even know if it's valid.
  if (status === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
