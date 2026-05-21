import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { displayNameFor } from '@/auth/displayName';

const IMMERSIVE_ROUTES = new Set(['/', '/login', '/signup', '/confirm']);

export function AppShell({ children }: PropsWithChildren): React.ReactElement {
  const { status, user } = useAuth();
  const { pathname } = useLocation();
  const immersive = IMMERSIVE_ROUTES.has(pathname);
  const displayName = displayNameFor(user?.email);

  return (
    <div className={`app-shell ${immersive ? 'app-shell--immersive' : ''}`}>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="header-left">
            <Link className="brand-link" to="/">
              <span className="brand-icon">✈</span>
              GoNow
            </Link>
            {!immersive && <p className="header-subtitle">Plan your perfect trip with AI</p>}
          </div>
          <nav className="header-nav">
            {status === 'signedIn' && user ? (
              <>
                <span className="header-user">Hi, {displayName}</span>
                <Link to="/account">Account</Link>
              </>
            ) : status === 'signedOut' ? (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/signup">Sign up</Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
