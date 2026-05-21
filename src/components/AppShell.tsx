import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export function AppShell({ children }: PropsWithChildren): React.ReactElement {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="brand-link" to="/">
            <span className="brand-icon">✈</span>
            GoNow
          </Link>
          <p className="header-subtitle">Plan your perfect trip with AI</p>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
