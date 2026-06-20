import { useEffect, useState } from 'react';

const MESSAGES = [
  '🗺️  Building your day-by-day itinerary…',
  '🏨  Recommending hotel bases…',
  '🍜  Discovering local restaurants…',
  '✈️  Preparing booking search links…',
  '🌤️  Checking weather and travel tips…',
  '✨  Almost ready…',
];

export function TripLoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, MESSAGES.length - 1)), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-state card">
      <div className="loading-plane">✈</div>
      <div className="loading-track"><div className="loading-track-fill" /></div>
      <p className="loading-message">{MESSAGES[index]}</p>
      <p className="muted" style={{ fontSize: '0.85rem' }}>This usually takes 10–20 seconds</p>
    </div>
  );
}
