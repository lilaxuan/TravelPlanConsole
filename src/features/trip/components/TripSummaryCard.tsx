import type { CostSummary, TripFormValues } from '@/types/trip';

interface TripSummaryCardProps {
  request: TripFormValues;
  costSummary: CostSummary;
}

export function TripSummaryCard({ request, costSummary }: TripSummaryCardProps): React.ReactElement {
  return (
    <section className="card">
      <h2>Trip summary</h2>
      <div className="summary-grid">
        <div>
          <span className="summary-label">Route</span>
          <strong>
            {request.departureCity} → {request.destinationCity}
          </strong>
        </div>
        <div>
          <span className="summary-label">Dates</span>
          <strong>
            {request.startDate} to {request.endDate}
          </strong>
        </div>
        <div>
          <span className="summary-label">Travelers</span>
          <strong>{request.travelers}</strong>
        </div>
        <div>
          <span className="summary-label">Estimated total</span>
          <strong>${costSummary.total.toLocaleString()}</strong>
        </div>
      </div>
    </section>
  );
}
