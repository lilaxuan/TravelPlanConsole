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
            <article key={`${flight.airline}-${flight.flightNumber}`} className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}>
              <div>
                <strong>{flight.airline} · {flight.flightNumber}</strong>
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">{flight.departure} → {flight.arrival} · {flight.duration} · {flight.stops}</p>
                <div className="booking-links">
                  <span className="muted">Search: </span>
                  <a href={urls.google} rel="noreferrer" target="_blank">Google Flights</a>
                  <a href={urls.kayak} rel="noreferrer" target="_blank">Kayak</a>
                  <a href={urls.expedia} rel="noreferrer" target="_blank">Expedia</a>
                  <a href={urls.skyscanner} rel="noreferrer" target="_blank">Skyscanner</a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <strong style={{ fontSize: '1.1rem' }}>${flight.estimatedPrice}</strong>
                <button className="primary-button" onClick={() => onSelect(flight)}>{isSelected ? 'Selected' : 'Select'}</button>
              </div>
            </article>
          );
        })}
      </div>

      <button className="back-button" onClick={onBack} style={{ marginTop: 16 }}>← Back</button>
    </section>
  );
}
