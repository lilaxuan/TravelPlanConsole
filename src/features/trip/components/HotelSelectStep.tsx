import { hotelSearchUrls } from '@/api/bookingUrls';
import type { HotelOption, TripFormValues } from '@/types/trip';

interface Props {
  hotels: HotelOption[];
  request: TripFormValues;
  selected: HotelOption | null;
  onSelect: (hotel: HotelOption | null) => void;
  onBack: () => void;
}

export function HotelSelectStep({ hotels, request, selected, onSelect, onBack }: Props) {
  return (
    <section className="card">
      <h2>Step 3 — Choose your hotel</h2>
      <p className="muted">{request.destinationCity} · {request.startDate} – {request.endDate} · {request.travelers} guest{request.travelers > 1 ? 's' : ''}</p>

      <div className="stack" style={{ marginTop: 16 }}>
        {hotels.length === 0 && (
          <article className="selectable-card">
            <div style={{ flex: 1 }}>
              <strong>No live hotel offers returned</strong>
              <p className="muted">Try nearby dates, another destination spelling, or a wider budget. No placeholder hotel data is shown.</p>
            </div>
          </article>
        )}
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
            <article
              key={hotel.name}
              className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}
              onClick={() => onSelect(hotel)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(hotel)}
            >
              <div className="selectable-card-radio">{isSelected ? '●' : '○'}</div>
              <div style={{ flex: 1 }}>
                <strong>{hotel.name}</strong>
                {hotel.isLiveSearch && <span className="selected-badge">Live search</span>}
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">{hotel.starRating > 0 ? `${'★'.repeat(hotel.starRating)} · ` : ''}{hotel.area}</p>
                <p className="muted">{hotel.highlights}</p>
                <div className="booking-links" onClick={(e) => e.stopPropagation()}>
                  <span className="muted">Book on: </span>
                  {hotel.bookingUrl && <a href={hotel.bookingUrl} rel="noreferrer" target="_blank">Open live search</a>}
                  <a href={urls.booking} rel="noreferrer" target="_blank">Booking.com</a>
                  <a href={urls.hotels} rel="noreferrer" target="_blank">Hotels.com</a>
                  <a href={urls.expedia} rel="noreferrer" target="_blank">Expedia</a>
                  <a href={urls.airbnb} rel="noreferrer" target="_blank">Airbnb</a>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <strong className="card-price">${hotel.estimatedNightlyPrice}/night</strong>
                <p className="muted" style={{ fontSize: '0.85rem' }}>~${hotel.totalEstimatedPrice} total</p>
                {hotel.priceLabel && <p className="muted" style={{ fontSize: '0.85rem' }}>{hotel.priceLabel}</p>}
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button className="back-button" onClick={onBack}>← Back</button>
        {selected && (
          <button className="cta-button" style={{ flex: 1 }} onClick={() => onSelect(selected)}>
            Continue with {selected.name} →
          </button>
        )}
        <button className="back-button" onClick={() => onSelect(null)}>Skip hotel →</button>
      </div>
    </section>
  );
}
