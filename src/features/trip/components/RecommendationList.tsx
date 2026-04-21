import type { ReactNode } from 'react';

interface RecommendationListProps {
  title: string;
  children: ReactNode;
}

export function RecommendationList({ title, children }: RecommendationListProps): React.ReactElement {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="stack">{children}</div>
    </section>
  );
}
