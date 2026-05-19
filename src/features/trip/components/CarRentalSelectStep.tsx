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
        {carRentals.map((car) => {
          const isSelected = selected?.provider === car.provider && selected?.pickupLocation === car.pickupLocation;
          return (
            <article key={`${car.provider}-${car.pickupLocation}`} className={`selectable-card ${isSelected ? 'selectable-card--selected' : ''}`}>
              <div>
                <strong>{car.provider}</strong>
                {isSelected && <span className="selected-badge">✓ Selected</span>}
                <p className="muted">Pickup: {car.pickupLocation}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <strong style={{ fontSize: '1.1rem' }}>${car.estimatedTotalPrice}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={car.bookingUrl} rel="noreferrer" target="_blank" style={{ fontSize: '0.85rem' }}>Search</a>
                  <button className="primary-button" onClick={() => onSelect(car)}>{isSelected ? 'Selected' : 'Select'}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button className="back-button" onClick={onBack}>← Back</button>
        <button className="back-button" onClick={() => onSelect(null)}>Skip car rental →</button>
      </div>
    </section>
  );
}
