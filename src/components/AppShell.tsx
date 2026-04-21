import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export function AppShell({ children }: PropsWithChildren): React.ReactElement {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <Link className="brand-link" to="/">
            GoNow Console
          </Link>
          <p className="header-subtitle">Single-destination trip planning console</p>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
