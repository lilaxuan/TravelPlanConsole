import { useMemo, useState } from 'react';
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
  const positions = useMemo(
    () => activities.map((activity) => ({ lat: activity.lat!, lng: activity.lng! })),
    [activities],
  );

  const center = positions[0] ?? { lat: 20, lng: 0 };

  return (
    <LoadScript googleMapsApiKey={config.googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={positions.length ? 13 : 2}
        onLoad={(map) => {
          if (positions.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            positions.forEach((position) => bounds.extend(position));
            map.fitBounds(bounds, 48);
          }
        }}
        options={{
          clickableIcons: false,
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
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
              onClick={() => setActiveIndex(i)}
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
    </LoadScript>
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

      {view === 'map' && (
        <div className="itinerary-map-frame">
          {config.googleMapsApiKey ? (
            <GoogleItineraryMap key={selectedDay} activities={mappedActivities} />
          ) : (
            <div className="map-empty-state">
              <strong>Google Maps is not configured</strong>
              <p className="muted">Set VITE_GOOGLE_MAPS_API_KEY in .env.local to render the interactive map.</p>
            </div>
          )}
        </div>
      )}

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
