import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { heroPhotos, destinationPhotos } from '@/styles/images';
import { useScrollReveal } from '@/components/useScrollReveal';
import { AnimatedCount } from '@/components/AnimatedCount';
import { useStats } from '@/features/trip/hooks/useStats';

interface TripHeroProps {
  children: ReactNode;
  onSelectDestination?: (city: string) => void;
}

export function TripHero({ children, onSelectDestination }: TripHeroProps): React.ReactElement {
  const statsRef = useScrollReveal<HTMLDivElement>();
  const searchRef = useRef<HTMLDivElement>(null);
  const travelersTileRef = useRef<HTMLDivElement>(null);
  const looped = [...destinationPhotos, ...destinationPhotos];

  const { totalUsers } = useStats();
  const prevTotalRef = useRef<number | null>(null);

  // Pulse the tile when the polled value changes (i.e. someone else just signed up).
  useEffect(() => {
    if (totalUsers == null) return;
    if (prevTotalRef.current != null && prevTotalRef.current !== totalUsers) {
      const tile = travelersTileRef.current;
      if (tile) {
        tile.classList.remove('stat--pulse');
        void tile.offsetWidth;
        tile.classList.add('stat--pulse');
      }
    }
    prevTotalRef.current = totalUsers;
  }, [totalUsers]);

  function handlePick(city: string) {
    onSelectDestination?.(city);
    const card = searchRef.current;
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('hero-search--pulse');
    void card.offsetWidth;
    card.classList.add('hero-search--pulse');
  }

  return (
    <>
      <section className="hero">
        <div className="hero-photo" style={{ backgroundImage: `url(${heroPhotos.bali})` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">AI-crafted itineraries</p>
          <h1 className="hero-title">
            Your next <em>adventure</em><br />starts here.
          </h1>
          <p className="hero-tagline">
            Flights, hotels, restaurants, day-by-day plans — generated in seconds. Tell us where and when; we'll handle the rest.
          </p>
          <div className="hero-search" ref={searchRef}>{children}</div>
        </div>
      </section>

      <section className="section-dark">
        <div className="section-inner">
          <div className="section-header">
            <h2>Trending right now</h2>
            <p>Hover to pause · click any to prefill your trip</p>
          </div>
          <div className="dest-marquee">
            <div className="dest-track">
              {looped.map((d, i) => (
                <button
                  type="button"
                  className="dest-card"
                  key={`${d.city}-${i}`}
                  onClick={() => handlePick(d.city)}
                  aria-label={`Use ${d.city} as destination`}
                >
                  <img src={d.photo} alt={d.city} loading="lazy" />
                  <div className="dest-card-label">
                    <div className="city">{d.city}</div>
                    <div className="country">{d.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stats-grid" ref={statsRef}>
          <div className="stat" key="rating">
            <div className="stat-value">4.9★</div>
            <div className="stat-label">Traveler rating</div>
          </div>
          <div className="stat stat--live" ref={travelersTileRef} key="users">
            <div className="stat-value">
              <AnimatedCount value={totalUsers} />
              {totalUsers != null && <span className="stat-live-dot" aria-hidden />}
            </div>
            <div className="stat-label">Travelers signed up</div>
          </div>
          <div className="stat" key="countries">
            <div className="stat-value">72</div>
            <div className="stat-label">Countries covered</div>
          </div>
          <div className="stat" key="engine">
            <div className="stat-value">GPT-4o</div>
            <div className="stat-label">AI itinerary engine</div>
          </div>
        </div>
      </section>
    </>
  );
}
