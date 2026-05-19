import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTrip } from '@/api/trips';
import { flightSearchUrls, hotelSearchUrls } from '@/api/bookingUrls';
import { ItineraryMap } from '@/features/trip/components/ItineraryMap';
import { RecommendationList } from '@/features/trip/components/RecommendationList';
import { TripSummaryCard } from '@/features/trip/components/TripSummaryCard';
import type { TripResult } from '@/types/trip';

export function TripResultsPage(): React.ReactElement {
  const { tripId = '' } = useParams();
  const [trip, setTrip] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const result = await getTrip(tripId);
        setTrip(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load trip');
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  if (loading) return <div className="card">Loading trip plan…</div>;

  if (error || !trip) {
    return (
      <div className="card">
        <p>{error ?? 'Trip not found.'}</p>
        <Link className="inline-link" to="/">Back to planner</Link>
      </div>
    );
  }

  const { request } = trip;

  return (
    <div className="results-layout">
      <TripSummaryCard request={request} costSummary={trip.costSummary} />

      <RecommendationList title="Flights">
        {trip.flights.map((flight) => {
          const urls = flightSearchUrls({
            from: request.departureIata ?? request.departureCity,
            to: request.destinationIata ?? request.destinationCity,
            date: request.startDate,
            returnDate: request.endDate,
            travelers: request.travelers,
            airline: flight.airline,
          });
          return (
            <article className="result-item" key={`${flight.airline}-${flight.flightNumber}`}>
              <div>
                <strong>{flight.airline} · {flight.flightNumber}</strong>
                <p className="muted">{flight.departure} → {flight.arrival} · {flight.duration} · {flight.stops}</p>
                <div className="booking-links">
                  <span className="muted">Search on: </span>
                  <a href={urls.google} rel="noreferrer" target="_blank">Google Flights</a>
                  <a href={urls.kayak} rel="noreferrer" target="_blank">Kayak</a>
                  <a href={urls.expedia} rel="noreferrer" target="_blank">Expedia</a>
                  <a href={urls.skyscanner} rel="noreferrer" target="_blank">Skyscanner</a>
                </div>
              </div>
              <strong className="price">${flight.estimatedPrice}</strong>
            </article>
          );
        })}
      </RecommendationList>

      <RecommendationList title="Hotels">
        {trip.hotels.map((hotel) => {
          const urls = hotelSearchUrls({
            name: hotel.name,
            destination: request.destinationCity,
            checkIn: request.startDate,
            checkOut: request.endDate,
            guests: request.travelers,
          });
          return (
            <article className="result-item" key={hotel.name}>
              <div>
                <strong>{hotel.name}</strong>
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
              <div className="result-actions">
                <strong>${hotel.estimatedNightlyPrice}/night</strong>
                <span className="muted">~${hotel.totalEstimatedPrice} total</span>
              </div>
            </article>
          );
        })}
      </RecommendationList>

      <RecommendationList title="Daily itinerary">
        <ItineraryMap itinerary={trip.itinerary} />
      </RecommendationList>

      <RecommendationList title="Restaurants">
        {trip.restaurants.map((restaurant) => {
          const photoUrl = `https://source.unsplash.com/400x200/?${encodeURIComponent(restaurant.photoQuery ?? restaurant.cuisine + ' restaurant food')}`;
          return (
            <article className="restaurant-card" key={restaurant.name}>
              <img
                src={photoUrl}
                alt={restaurant.name}
                className="restaurant-photo"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="restaurant-info">
                <div>
                  <strong>{restaurant.name}</strong>
                  <p className="muted">
                    {restaurant.cuisine} · {restaurant.priceRange} · Reservation{' '}
                    {restaurant.reservationRecommended ? 'recommended' : 'optional'}
                  </p>
                </div>
                {restaurant.reservationUrl ? (
                  <a href={restaurant.reservationUrl} rel="noreferrer" target="_blank">Reserve</a>
                ) : null}
              </div>
            </article>
          );
        })}
      </RecommendationList>

      <RecommendationList title="Travel tips">
        <div className="stack">
          {trip.travelTips.weatherSummary ? <p><strong>Weather:</strong> {trip.travelTips.weatherSummary}</p> : null}
          {trip.travelTips.clothingRecommendations ? <p><strong>What to pack:</strong> {trip.travelTips.clothingRecommendations}</p> : null}
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
    </div>
  );
}
