import { useState } from 'react';
import { flightSearchUrls, hotelSearchUrls } from '@/api/bookingUrls';
import { ItineraryMap } from '@/features/trip/components/ItineraryMap';
import { RecommendationList } from '@/features/trip/components/RecommendationList';
import { TripSummaryCard } from '@/features/trip/components/TripSummaryCard';
import type { FlightOption, HotelOption, CarRentalOption, TripResult } from '@/types/trip';

interface Props {
  trip: TripResult;
  selectedFlight: FlightOption;
  selectedHotel: HotelOption;
  selectedCarRental: CarRentalOption | null;
  onBack: () => void;
}

export function ItinerarySummaryStep({ trip, selectedFlight, selectedHotel, selectedCarRental, onBack }: Props) {
  const [bookFlight, setBookFlight] = useState(true);
  const [bookHotel, setBookHotel] = useState(true);
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
      airline: selectedFlight.airline,
    });
    const hotelUrls = hotelSearchUrls({
      name: selectedHotel.name,
      destination: request.destinationCity,
      checkIn: request.startDate,
      checkOut: request.endDate,
      guests: request.travelers,
    });

    if (bookFlight) window.open(flightUrls.google, '_blank');
    if (bookHotel) window.open(hotelUrls.booking, '_blank');
    if (bookCar && selectedCarRental?.bookingUrl) window.open(selectedCarRental.bookingUrl, '_blank');
    setShowModal(false);
  }

  return (
    <div className="results-layout">
      <TripSummaryCard request={request} costSummary={trip.costSummary} />

      {/* Selected choices banner */}
      <section className="card" style={{ display: 'grid', gap: 12 }}>
        <h2>Your selections</h2>
        <div className="summary-grid">
          <div>
            <span className="summary-label">Flight</span>
            <strong>{selectedFlight.airline} {selectedFlight.flightNumber}</strong>
            <p className="muted">{selectedFlight.departure} → {selectedFlight.arrival} · ${selectedFlight.estimatedPrice}</p>
          </div>
          <div>
            <span className="summary-label">Hotel</span>
            <strong>{selectedHotel.name}</strong>
            <p className="muted">{selectedHotel.area} · ~${selectedHotel.totalEstimatedPrice} total</p>
          </div>
          {selectedCarRental && (
            <div>
              <span className="summary-label">Car rental</span>
              <strong>{selectedCarRental.provider}</strong>
              <p className="muted">{selectedCarRental.pickupLocation} · ${selectedCarRental.estimatedTotalPrice}</p>
            </div>
          )}
        </div>
        <button className="primary-button" style={{ justifySelf: 'start' }} onClick={() => setShowModal(true)}>
          🚀 Proceed to Book
        </button>
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

      <button className="back-button" onClick={onBack}>← Back</button>

      {/* Book modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm booking</h2>
            <p className="muted">We'll open the booking pages for your selections. You'll complete payment on each platform.</p>
            <div className="stack" style={{ margin: '20px 0' }}>
              <label className="checkbox-label">
                <input type="checkbox" checked={bookFlight} onChange={(e) => setBookFlight(e.target.checked)} />
                <span>
                  <strong>Flight</strong> — {selectedFlight.airline} {selectedFlight.flightNumber} · ${selectedFlight.estimatedPrice}
                </span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={bookHotel} onChange={(e) => setBookHotel(e.target.checked)} />
                <span>
                  <strong>Hotel</strong> — {selectedHotel.name} · ~${selectedHotel.totalEstimatedPrice}
                </span>
              </label>
              {selectedCarRental && (
                <label className="checkbox-label">
                  <input type="checkbox" checked={bookCar} onChange={(e) => setBookCar(e.target.checked)} />
                  <span>
                    <strong>Car rental</strong> — {selectedCarRental.provider} · ${selectedCarRental.estimatedTotalPrice}
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
