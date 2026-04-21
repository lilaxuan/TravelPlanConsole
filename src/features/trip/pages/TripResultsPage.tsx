import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTrip } from '@/api/trips';
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

  if (loading) {
    return <div className="card">Loading trip plan…</div>;
  }

  if (error || !trip) {
    return (
      <div className="card">
        <p>{error ?? 'Trip not found.'}</p>
        <Link className="inline-link" to="/">
          Back to planner
        </Link>
      </div>
    );
  }

  return (
    <div className="results-layout">
      <TripSummaryCard request={trip.request} costSummary={trip.costSummary} />

      <RecommendationList title="Flights">
        {trip.flights.map((flight) => (
          <article className="result-item" key={`${flight.provider}-${flight.title}`}>
            <div>
              <strong>{flight.title}</strong>
              <p className="muted">{flight.provider} · {flight.duration}</p>
            </div>
            <div className="result-actions">
              <strong>${flight.estimatedPrice}</strong>
              <a href={flight.bookingUrl} rel="noreferrer" target="_blank">
                Book
              </a>
            </div>
          </article>
        ))}
      </RecommendationList>

      <RecommendationList title="Hotels">
        {trip.hotels.map((hotel) => (
          <article className="result-item" key={hotel.name}>
            <div>
              <strong>{hotel.name}</strong>
              <p className="muted">{hotel.area}</p>
            </div>
            <div className="result-actions">
              <strong>${hotel.totalEstimatedPrice}</strong>
              <a href={hotel.bookingUrl} rel="noreferrer" target="_blank">
                Reserve
              </a>
            </div>
          </article>
        ))}
      </RecommendationList>

      <RecommendationList title="Daily itinerary">
        {trip.itinerary.map((day) => (
          <article className="itinerary-day" key={day.dayNumber}>
            <h3>
              Day {day.dayNumber}: {day.theme}
            </h3>
            <ul>
              {day.activities.map((activity) => (
                <li key={`${day.dayNumber}-${activity.time}-${activity.name}`}>
                  <strong>{activity.time}</strong> — {activity.name}
                  {activity.notes ? <span className="muted"> ({activity.notes})</span> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </RecommendationList>

      <RecommendationList title="Restaurants">
        {trip.restaurants.map((restaurant) => (
          <article className="result-item" key={restaurant.name}>
            <div>
              <strong>{restaurant.name}</strong>
              <p className="muted">
                {restaurant.cuisine} · {restaurant.priceRange} · Reservation{' '}
                {restaurant.reservationRecommended ? 'recommended' : 'optional'}
              </p>
            </div>
            {restaurant.reservationUrl ? (
              <a href={restaurant.reservationUrl} rel="noreferrer" target="_blank">
                Reserve
              </a>
            ) : null}
          </article>
        ))}
      </RecommendationList>

      <RecommendationList title="Travel tips">
        <div className="stack">
          <p><strong>Best season:</strong> {trip.travelTips.bestSeasonSummary}</p>
          <p><strong>Visa:</strong> {trip.travelTips.visaGuidance}</p>
          <p><strong>Local tip:</strong> {trip.travelTips.localTip}</p>
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
