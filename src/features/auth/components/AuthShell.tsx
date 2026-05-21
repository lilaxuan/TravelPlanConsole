import type { PropsWithChildren } from 'react';
import { heroPhotos } from '@/styles/images';

interface AuthShellProps {
  tag?: string;
  title: string;
}

export function AuthShell({ tag, title, children }: PropsWithChildren<AuthShellProps>): React.ReactElement {
  return (
    <section className="auth-overlay">
      <div className="auth-overlay-photo" style={{ backgroundImage: `url(${heroPhotos.santorini})` }} />
      <div className="auth-overlay-veil" />
      <div className="auth-glass">
        {tag && <p className="auth-tag">{tag}</p>}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
