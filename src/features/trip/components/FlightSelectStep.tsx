import { flightSearchUrls } from '@/api/bookingUrls';
import type { FlightOption, TripFormValues } from '@/types/trip';

interface Props {
  flights: FlightOption[];
  request: TripFormValues;
  selected: FlightOption | null;
  onSelect: (flight: FlightOption) => void;
  onBack: () => void;
}

export function FlightSelectStep({ flights, request, selected, onSelect, onBack }: Props) {
  return (
    <section className="card">
      <h2>Step 2 — Choose your flight</h2>
      <p className="muted">{request.departureCity} → {request.destinationCity} · {request.startDate} – {request.endDate} · {request.travelers} traveler{request.travelers > 1 ? 's' : ''}</p>

      <div className="stack" style={{ marginTop: 16 }}>
        {flights.length === 0 && (
          <article className="selectable-card">
            <div style={{ flex: 1 }}>
              <strong>No live flight offers returned</strong>
              <p className="muted">Try nearby dates, nearby airports, or a different route. No placeholder flight data is shown.</p>
            </div>
          </article>
        )}
        {flights.map((flight) => {
          const isSelected = selected?.flightNumber === flight.flightNumber && selected?.airline === flight.airline;
          const urls = flightSearchUrls({
            from: request.departureIata ?? request.departureCity,
            to: request.destinationIata ?? request.destinationCity,
            date: request.startDate,
            returnDate: request.endDate,
            travelers: request.travelers,
            airline: flight.airline,
          });
          return (
            <article
              key={`${flight.airline}-${flight.flightNumber}`}
              className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}
              onClick={() => onSelect(flight)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(flight)}
            >
              <div className="selectable-card-radio">{isSelected ? '●' : '○'}</div>
              <div style={{ flex: 1 }}>
                <strong>{flight.airline} · {flight.flightNumber}</strong>
                {flight.isLiveSearch && <span className="selected-badge">Live search</span>}
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">{flight.departure} → {flight.arrival} · {flight.duration} · {flight.stops}</p>
                {flight.recommendationReason && <p className="muted">{flight.recommendationReason}</p>}
                <div className="booking-links" onClick={(e) => e.stopPropagation()}>
                  <span className="muted">Search: </span>
                  {flight.bookingUrl && <a href={flight.bookingUrl} rel="noreferrer" target="_blank">Open live search</a>}
                  <a href={urls.google} rel="noreferrer" target="_blank">Google Flights</a>
                  <a href={urls.kayak} rel="noreferrer" target="_blank">Kayak</a>
                  <a href={urls.expedia} rel="noreferrer" target="_blank">Expedia</a>
                  <a href={urls.skyscanner} rel="noreferrer" target="_blank">Skyscanner</a>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <strong className="card-price">${flight.estimatedPrice}</strong>
                {flight.priceLabel && <p className="muted" style={{ fontSize: '0.85rem' }}>{flight.priceLabel}</p>}
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button className="back-button" onClick={onBack}>← Back</button>
        {selected && (
          <button className="cta-button" style={{ flex: 1 }} onClick={() => onSelect(selected)}>
            Continue with {selected.airline} {selected.flightNumber} →
          </button>
        )}
      </div>
    </section>
  );
}
