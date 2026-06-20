import type { CarRentalOption } from '@/types/trip';

interface Props {
  carRentals: CarRentalOption[];
  selected: CarRentalOption | null;
  onSelect: (car: CarRentalOption | null) => void;
  onBack: () => void;
}

export function CarRentalSelectStep({ carRentals, selected, onSelect, onBack }: Props) {
  return (
    <section className="card">
      <h2>Step 4 — Car rental <span className="muted" style={{ fontSize: '0.9rem', fontWeight: 400 }}>(optional)</span></h2>
      <p className="muted">Add a rental car to your trip, or skip this step.</p>

      <div className="stack" style={{ marginTop: 16 }}>
        {carRentals.length === 0 && (
          <article className="selectable-card">
            <div style={{ flex: 1 }}>
              <strong>No real-time car rental provider configured</strong>
              <p className="muted">Skip this step for now. Car inventory will appear here after a rental provider is connected.</p>
            </div>
          </article>
        )}
        {carRentals.map((car, i) => {
          const isSelected = selected?.provider === car.provider && selected?.pickupLocation === car.pickupLocation;
          return (
            <article
              key={i}
              className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}
              onClick={() => onSelect(car)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(car)}
            >
              <div className="selectable-card-radio">{isSelected ? '●' : '○'}</div>
              <div style={{ flex: 1 }}>
                <strong>{car.provider}</strong>
                {car.isLiveSearch && <span className="selected-badge">Live search</span>}
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">Pickup: {car.pickupLocation}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <strong className="card-price">${car.estimatedTotalPrice}</strong>
                {car.priceLabel && <p className="muted" style={{ fontSize: '0.85rem' }}>{car.priceLabel}</p>}
                <div onClick={(e) => e.stopPropagation()}>
                  <a href={car.bookingUrl} rel="noreferrer" target="_blank" style={{ fontSize: '0.85rem' }}>Search</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button className="back-button" onClick={onBack}>← Back</button>
        {selected && (
          <button className="cta-button" style={{ flex: 1 }} onClick={() => onSelect(selected)}>
            Continue with {selected.provider} →
          </button>
        )}
        <button className="back-button" onClick={() => onSelect(null)}>Skip →</button>
      </div>
    </section>
  );
}
