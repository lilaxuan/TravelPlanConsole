import { useState } from 'react';
import { flightSearchUrls, hotelSearchUrls } from '@/api/bookingUrls';
import { ItineraryMap } from '@/features/trip/components/ItineraryMap';
import { RecommendationList } from '@/features/trip/components/RecommendationList';
import { TripSummaryCard } from '@/features/trip/components/TripSummaryCard';
import type { FlightOption, HotelOption, CarRentalOption, TripResult } from '@/types/trip';

interface Props {
  trip: TripResult;
  selectedFlight: FlightOption | null;
  selectedHotel: HotelOption | null;
  selectedCarRental: CarRentalOption | null;
  onBack: () => void;
  onContinueToFlights?: () => void;
}

export function ItinerarySummaryStep({ trip, selectedFlight, selectedHotel, selectedCarRental, onBack, onContinueToFlights }: Props) {
  const [bookFlight, setBookFlight] = useState(selectedFlight !== null);
  const [bookHotel, setBookHotel] = useState(selectedHotel !== null);
  const [bookCar, setBookCar] = useState(selectedCarRental !== null);
  const [showModal, setShowModal] = useState(false);
  const { request } = trip;

  function handleBook() {
    const flightUrls = flightSearchUrls({
      from: request.departureIata ?? request.departureCity,
      to: request.destinationIata ?? request.destinationCity,
      date: request.startDate,
      returnDate: request.endDate,
      travelers: request.travelers,
      airline: selectedFlight?.airline,
    });
    const hotelUrls = hotelSearchUrls({
      name: selectedHotel?.name ?? '',
      destination: request.destinationCity,
      checkIn: request.startDate,
      checkOut: request.endDate,
      guests: request.travelers,
    });

    if (bookFlight && selectedFlight) window.open(selectedFlight.bookingUrl ?? flightUrls.google, '_blank');
    if (bookHotel && selectedHotel) window.open(selectedHotel.bookingUrl ?? hotelUrls.booking, '_blank');
    if (bookCar && selectedCarRental?.bookingUrl) window.open(selectedCarRental.bookingUrl, '_blank');
    setShowModal(false);
  }

  return (
    <div className="results-layout">
      <TripSummaryCard request={request} costSummary={trip.costSummary} />

      <RecommendationList title="Recommended hotel bases">
        <div className="stack">
          {trip.hotels.map((hotel) => {
            const urls = hotelSearchUrls({
              name: hotel.name,
              destination: request.destinationCity,
              checkIn: request.startDate,
              checkOut: request.endDate,
              guests: request.travelers,
            });

            return (
              <article className="selectable-card" key={hotel.name}>
                <div style={{ flex: 1 }}>
                  <strong>{hotel.name}</strong>
                  <p className="muted">{hotel.starRating > 0 ? `${'★'.repeat(hotel.starRating)} · ` : ''}{hotel.area}</p>
                  <p className="muted">{hotel.highlights}</p>
                  <div className="booking-links">
                    <span className="muted">Book/search: </span>
                    {hotel.bookingUrl && <a href={hotel.bookingUrl} rel="noreferrer" target="_blank">Open search</a>}
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
      </RecommendationList>

      {/* Selected choices banner */}
      <section className="card" style={{ display: 'grid', gap: 12 }}>
        <h2>Booking choices</h2>
        <div className="summary-grid">
          <div>
            <span className="summary-label">Flight</span>
            {selectedFlight ? (
              <>
                <strong>{selectedFlight.airline} {selectedFlight.flightNumber}</strong>
                <p className="muted">{selectedFlight.departure} → {selectedFlight.arrival} · ${selectedFlight.estimatedPrice}{selectedFlight.priceLabel ? ` · ${selectedFlight.priceLabel}` : ''}</p>
              </>
            ) : (
              <>
                <strong>Skipped</strong>
                <p className="muted">No flight option selected.</p>
              </>
            )}
          </div>
          <div>
            <span className="summary-label">Hotel</span>
            {selectedHotel ? (
              <>
                <strong>{selectedHotel.name}</strong>
                <p className="muted">{selectedHotel.area} · ~${selectedHotel.totalEstimatedPrice} total{selectedHotel.priceLabel ? ` · ${selectedHotel.priceLabel}` : ''}</p>
              </>
            ) : (
              <>
                <strong>Skipped</strong>
                <p className="muted">No hotel option selected.</p>
              </>
            )}
          </div>
          {selectedCarRental && (
            <div>
              <span className="summary-label">Car rental</span>
              <strong>{selectedCarRental.provider}</strong>
              <p className="muted">{selectedCarRental.pickupLocation} · ${selectedCarRental.estimatedTotalPrice}{selectedCarRental.priceLabel ? ` · ${selectedCarRental.priceLabel}` : ''}</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {onContinueToFlights && (
            <button className="primary-button" onClick={onContinueToFlights}>
              Continue to booking links →
            </button>
          )}
          {(selectedFlight || selectedHotel || selectedCarRental) && (
            <button className="back-button" onClick={() => setShowModal(true)}>
              Open selected booking pages
            </button>
          )}
        </div>
      </section>

      <RecommendationList title="Daily itinerary">
        <ItineraryMap itinerary={trip.itinerary} />
      </RecommendationList>

      <RecommendationList title="Restaurants">
        {trip.restaurants.map((r) => {
          const photoUrl = `https://source.unsplash.com/400x200/?${encodeURIComponent(r.photoQuery ?? r.cuisine + ' restaurant food')}`;
          return (
            <article className="restaurant-card" key={r.name}>
              <img src={photoUrl} alt={r.name} className="restaurant-photo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="restaurant-info">
                <div>
                  <strong>{r.name}</strong>
                  <p className="muted">{r.cuisine} · {r.priceRange} · Reservation {r.reservationRecommended ? 'recommended' : 'optional'}</p>
                </div>
                {r.reservationUrl ? <a href={r.reservationUrl} rel="noreferrer" target="_blank">Reserve</a> : null}
              </div>
            </article>
          );
        })}
      </RecommendationList>

      <RecommendationList title="Travel tips">
        <div className="stack">
          {trip.travelTips.weatherSummary && <p><strong>Weather:</strong> {trip.travelTips.weatherSummary}</p>}
          {trip.travelTips.clothingRecommendations && <p><strong>What to pack:</strong> {trip.travelTips.clothingRecommendations}</p>}
          <p><strong>Best season:</strong> {trip.travelTips.bestSeasonSummary}</p>
          <p><strong>Visa:</strong> {trip.travelTips.visaGuidance}</p>
          <p><strong>Local tip:</strong> {trip.travelTips.localTip}</p>
          {trip.travelTips.preTravelReminders?.length ? (
            <div>
              <strong>Pre-travel reminders:</strong>
              <ul>{trip.travelTips.preTravelReminders.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          ) : null}
        </div>
      </RecommendationList>

      <RecommendationList title="Cost breakdown">
        <div className="cost-grid">
          <span>Flights</span><strong>${trip.costSummary.flights}</strong>
          <span>Hotels</span><strong>${trip.costSummary.hotels}</strong>
          <span>Car rental</span><strong>${trip.costSummary.carRental}</strong>
          <span>Food estimate</span><strong>${trip.costSummary.foodEstimate}</strong>
          <span>Activities estimate</span><strong>${trip.costSummary.activitiesEstimate}</strong>
          <span>Total</span><strong>${trip.costSummary.total}</strong>
        </div>
      </RecommendationList>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="back-button" onClick={onBack}>← Back</button>
        {onContinueToFlights && (
          <button className="cta-button" style={{ width: 'auto' }} onClick={onContinueToFlights}>
            Continue to flights →
          </button>
        )}
      </div>

      {/* Book modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm booking</h2>
            <p className="muted">We'll open the booking pages for your selections. You'll complete payment on each platform.</p>
            <div className="stack" style={{ margin: '20px 0' }}>
              {selectedFlight && (
                <label className="checkbox-label">
                  <input type="checkbox" checked={bookFlight} onChange={(e) => setBookFlight(e.target.checked)} />
                  <span>
                    <strong>Flight</strong> — {selectedFlight.airline} {selectedFlight.flightNumber} · ${selectedFlight.estimatedPrice}
                    {selectedFlight.priceLabel ? ` · ${selectedFlight.priceLabel}` : ''}
                  </span>
                </label>
              )}
              {selectedHotel && (
                <label className="checkbox-label">
                  <input type="checkbox" checked={bookHotel} onChange={(e) => setBookHotel(e.target.checked)} />
                  <span>
                    <strong>Hotel</strong> — {selectedHotel.name} · ~${selectedHotel.totalEstimatedPrice}
                    {selectedHotel.priceLabel ? ` · ${selectedHotel.priceLabel}` : ''}
                  </span>
                </label>
              )}
              {selectedCarRental && (
                <label className="checkbox-label">
                  <input type="checkbox" checked={bookCar} onChange={(e) => setBookCar(e.target.checked)} />
                  <span>
                    <strong>Car rental</strong> — {selectedCarRental.provider} · ${selectedCarRental.estimatedTotalPrice}
                    {selectedCarRental.priceLabel ? ` · ${selectedCarRental.priceLabel}` : ''}
                  </span>
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="primary-button" disabled={!bookFlight && !bookHotel && !bookCar} onClick={handleBook}>
                Open booking pages
              </button>
              <button className="back-button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
