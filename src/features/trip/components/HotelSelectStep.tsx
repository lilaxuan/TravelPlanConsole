import { hotelSearchUrls } from '@/api/bookingUrls';
import type { HotelOption, TripFormValues } from '@/types/trip';

interface Props {
  hotels: HotelOption[];
  request: TripFormValues;
  selected: HotelOption | null;
  onSelect: (hotel: HotelOption) => void;
  onBack: () => void;
}

export function HotelSelectStep({ hotels, request, selected, onSelect, onBack }: Props) {
  return (
    <section className="card">
      <h2>Step 3 — Choose your hotel</h2>
      <p className="muted">{request.destinationCity} · {request.startDate} – {request.endDate} · {request.travelers} guest{request.travelers > 1 ? 's' : ''}</p>

      <div className="stack" style={{ marginTop: 16 }}>
        {hotels.map((hotel) => {
          const isSelected = selected?.name === hotel.name;
          const urls = hotelSearchUrls({
            name: hotel.name,
            destination: request.destinationCity,
            checkIn: request.startDate,
            checkOut: request.endDate,
            guests: request.travelers,
          });
          return (
            <article key={hotel.name} className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}>
              <div>
                <strong>{hotel.name}</strong>
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">{'★'.repeat(hotel.starRating)} · {hotel.area}</p>
                <p className="muted">{hotel.highlights}</p>
                <div className="booking-links">
                  <span className="muted">Book on: </span>
                  <a href={urls.booking} rel="noreferrer" target="_blank">Booking.com</a>
                  <a href={urls.hotels} rel="noreferrer" target="_blank">Hotels.com</a>
                  <a href={urls.expedia} rel="noreferrer" target="_blank">Expedia</a>
                  <a href={urls.airbnb} rel="noreferrer" target="_blank">Airbnb</a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.1rem' }}>${hotel.estimatedNightlyPrice}/night</strong>
                  <p className="muted">~${hotel.totalEstimatedPrice} total</p>
                </div>
                <button className="primary-button" onClick={() => onSelect(hotel)}>{isSelected ? 'Selected' : 'Select'}</button>
              </div>
            </article>
          );
        })}
      </div>

      <button className="back-button" onClick={onBack} style={{ marginTop: 16 }}>← Back</button>
    </section>
  );
}
