import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { config } from '@/api/config';
import type { Activity, ItineraryDay } from '@/types/trip';

interface Props {
  itinerary: ItineraryDay[];
}

type ItineraryView = 'map' | 'list' | 'calendar';

function ActivityDetails({ activity }: { activity: Activity }) {
  return (
    <>
      {activity.transportFromPrevious && (
        <p className="muted" style={{ margin: '0 0 2px' }}>{activity.transportFromPrevious}</p>
      )}
      <strong>{activity.time}</strong> — {activity.name}
      {activity.notes && <span className="muted"> ({activity.notes})</span>}
    </>
  );
}

function GoogleItineraryMap({ activities }: { activities: Activity[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const positions = useMemo(
    () => activities.map((activity) => ({ lat: activity.lat!, lng: activity.lng! })),
    [activities],
  );

  const center = positions[0] ?? { lat: 20, lng: 0 };
  const routeUrl = useMemo(() => {
    if (positions.length === 0) return '';
    const destination = positions[positions.length - 1];
    const waypoints = positions.slice(1, -1).map((position) => `${position.lat},${position.lng}`).join('|');
    const params = new URLSearchParams({
      api: '1',
      origin: `${positions[0].lat},${positions[0].lng}`,
      destination: `${destination.lat},${destination.lng}`,
      travelmode: 'walking',
    });
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [positions]);

  const fitRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || positions.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    positions.forEach((position) => bounds.extend(position));
    if (positions.length === 1) {
      map.setCenter(positions[0]);
      map.setZoom(15);
      return;
    }
    map.fitBounds(bounds, 56);
  }, [positions]);

  const focusStop = useCallback((index: number) => {
    const map = mapRef.current;
    const position = positions[index];
    if (!map || !position) return;

    setActiveIndex(index);
    map.panTo(position);
    if ((map.getZoom() ?? 0) < 14) map.setZoom(14);
  }, [positions]);

  useEffect(() => {
    setActiveIndex(null);
    fitRoute();
  }, [fitRoute]);

  if (activities.length === 0) {
    return (
      <div className="map-empty-state">
        <strong>No mappable stops for this day</strong>
        <p className="muted">Switch to List or Calendar view to see the full itinerary text.</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={config.googleMapsApiKey}>
      <div className="interactive-map-shell">
        <div className="interactive-map-canvas">
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={positions.length ? 13 : 2}
            onLoad={(map) => {
              mapRef.current = map;
              fitRoute();
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
            options={{
              clickableIcons: true,
              fullscreenControl: true,
              gestureHandling: 'greedy',
              mapTypeControl: true,
              streetViewControl: true,
            }}
          >
            {positions.length > 1 && (
              <Polyline
                path={positions}
                options={{
                  strokeColor: '#ff6b5b',
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                }}
              />
            )}
            {activities.map((activity, i) => {
              const position = { lat: activity.lat!, lng: activity.lng! };
              return (
                <Marker
                  key={`${activity.name}-${i}`}
                  position={position}
                  label={{ text: String(i + 1), color: 'white', fontWeight: '700' }}
                  animation={activeIndex === i ? google.maps.Animation.BOUNCE : undefined}
                  onClick={() => focusStop(i)}
                >
                  {activeIndex === i && (
                    <InfoWindow onCloseClick={() => setActiveIndex(null)}>
                      <div className="map-info-window">
                        <strong>{activity.time} — {activity.name}</strong>
                        {activity.transportFromPrevious && <p>{activity.transportFromPrevious}</p>}
                        {activity.notes && <p>{activity.notes}</p>}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          </GoogleMap>
        </div>

        <aside className="interactive-map-panel" aria-label="Mapped itinerary stops">
          <div className="map-panel-actions">
            <button type="button" className="back-button" onClick={fitRoute}>Fit route</button>
            {routeUrl && <a className="primary-button map-directions-link" href={routeUrl} target="_blank" rel="noreferrer">Directions</a>}
          </div>
          <ol className="map-stop-list">
            {activities.map((activity, i) => (
              <li key={`${activity.name}-panel-${i}`}>
                <button
                  type="button"
                  className={`map-stop-button ${activeIndex === i ? 'active' : ''}`}
                  onClick={() => focusStop(i)}
                >
                  <span className="map-stop-number">{i + 1}</span>
                  <span>
                    <strong>{activity.time} · {activity.name}</strong>
                    {activity.transportFromPrevious && <small>{activity.transportFromPrevious}</small>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </LoadScript>
  );
}

function MapView({ activities }: { activities: Activity[] }) {
  return (
    <div className="itinerary-map-frame">
      {config.googleMapsApiKey ? (
        <GoogleItineraryMap activities={activities} />
      ) : (
        <div className="map-empty-state">
          <strong>Google Maps is not configured</strong>
          <p className="muted">Set VITE_GOOGLE_MAPS_API_KEY in .env.local to render the interactive map.</p>
        </div>
      )}
    </div>
  );
}

export function ItineraryMap({ itinerary }: Props) {
  const [selectedDay, setSelectedDay] = useState(itinerary[0]?.dayNumber ?? 1);
  const [view, setView] = useState<ItineraryView>('map');
  const day = itinerary.find((d) => d.dayNumber === selectedDay);
  const allActivities = day?.activities ?? [];
  const mappedActivities = allActivities.filter((a) => a.lat != null && a.lng != null);

  return (
    <div className="itinerary-workspace">
      <div className="itinerary-day-tabs">
        {itinerary.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setSelectedDay(d.dayNumber)}
            className={d.dayNumber === selectedDay ? 'active' : ''}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      <div className="itinerary-toolbar">
        {day && <p><strong>{day.theme}</strong></p>}
        <div className="itinerary-view-tabs" aria-label="Itinerary view">
          {(['map', 'list', 'calendar'] as ItineraryView[]).map((option) => (
            <button key={option} className={view === option ? 'active' : ''} onClick={() => setView(option)}>
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'map' && <MapView key={selectedDay} activities={mappedActivities} />}

      {view === 'list' && (
        <ol className="itinerary-list">
          {allActivities.map((activity, i) => (
            <li key={`${activity.name}-${i}`}>
              <ActivityDetails activity={activity} />
            </li>
          ))}
        </ol>
      )}

      {view === 'calendar' && (
        <div className="itinerary-calendar">
          {allActivities.map((activity, i) => (
            <div className="calendar-row" key={`${activity.name}-${i}`}>
              <time>{activity.time}</time>
              <div>
                <strong>{activity.name}</strong>
                <p className="muted">{activity.type}</p>
                {activity.transportFromPrevious && <p>{activity.transportFromPrevious}</p>}
                {activity.notes && <p className="muted">{activity.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
