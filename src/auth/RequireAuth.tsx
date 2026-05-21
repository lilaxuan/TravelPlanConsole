import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: PropsWithChildren): React.ReactElement {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <div className="auth-loading">Loading…</div>;
  if (status === 'signedOut') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
