import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ItineraryDay } from '@/types/trip';

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeNumberedIcon(n: number) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#2563eb;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(positions, { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

interface Props {
  itinerary: ItineraryDay[];
}

export function ItineraryMap({ itinerary }: Props) {
  const [selectedDay, setSelectedDay] = useState(itinerary[0]?.dayNumber ?? 1);
  const day = itinerary.find((d) => d.dayNumber === selectedDay);
  const activities = (day?.activities ?? []).filter((a) => a.lat != null && a.lng != null);
  const positions = activities.map((a) => [a.lat!, a.lng!] as [number, number]);

  return (
    <div>
      {/* Day selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {itinerary.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setSelectedDay(d.dayNumber)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              background: d.dayNumber === selectedDay ? '#2563eb' : '#e5e7eb',
              color: d.dayNumber === selectedDay ? 'white' : '#111827',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      {day && <p style={{ marginBottom: 8 }}><strong>{day.theme}</strong></p>}

      {/* Map */}
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer
          center={positions[0] ?? [20, 0]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={selectedDay} // remount on day change to reset view
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {positions.length > 0 && <FitBounds positions={positions} />}
          {positions.length > 1 && (
            <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 3, dashArray: '6 6' }} />
          )}
          {activities.map((a, i) => (
            <Marker key={`${a.name}-${i}`} position={[a.lat!, a.lng!]} icon={makeNumberedIcon(i + 1)}>
              <Popup>
                <strong>{a.time} — {a.name}</strong>
                {a.transportFromPrevious && <p style={{ margin: '4px 0 0' }}>🚗 {a.transportFromPrevious}</p>}
                {a.notes && <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{a.notes}</p>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Activity list below map */}
      <ol style={{ marginTop: 16, paddingLeft: 20, display: 'grid', gap: 8 }}>
        {activities.map((a, i) => (
          <li key={`${a.name}-${i}`}>
            {a.transportFromPrevious && (
              <p className="muted" style={{ margin: '0 0 2px' }}>🚗 {a.transportFromPrevious}</p>
            )}
            <strong>{a.time}</strong> — {a.name}
            {a.notes && <span className="muted"> ({a.notes})</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
