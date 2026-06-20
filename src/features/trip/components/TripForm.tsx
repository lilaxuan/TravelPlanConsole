import type { TripFormValues } from '@/types/trip';

interface TripFormProps {
  values: TripFormValues;
  submitting: boolean;
  error: string | null;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TripForm({ values, submitting, error, onChange, onSubmit }: TripFormProps): React.ReactElement {
  return (
    <form className="card trip-form" onSubmit={onSubmit}>
      <div className="form-heading">
        <h1>Where are you going?</h1>
        <p className="muted">Tell us your trip details and we'll build the itinerary first, then add hotel recommendations and booking links.</p>
      </div>

      {/* Route row */}
      <div className="route-row">
        <label className="route-field">
          <span className="field-label">From</span>
          <div className="input-icon-wrap">
            <span className="input-icon">🛫</span>
            <input name="departureCity" value={values.departureCity} onChange={onChange} placeholder="Seattle" />
          </div>
        </label>
        <div className="route-arrow">→</div>
        <label className="route-field">
          <span className="field-label">To</span>
          <div className="input-icon-wrap">
            <span className="input-icon">🛬</span>
            <input name="destinationCity" value={values.destinationCity} onChange={onChange} placeholder="Tokyo" />
          </div>
        </label>
      </div>

      {/* Details row */}
      <div className="details-row">
        <label>
          <span className="field-label">Depart</span>
          <input name="startDate" type="date" value={values.startDate} onChange={onChange} />
        </label>
        <label>
          <span className="field-label">Return</span>
          <input name="endDate" type="date" value={values.endDate} onChange={onChange} />
        </label>
        <label>
          <span className="field-label">Budget (USD)</span>
          <div className="input-icon-wrap">
            <span className="input-icon">$</span>
            <input name="budget" type="number" min="1" value={values.budget} onChange={onChange} />
          </div>
        </label>
        <label>
          <span className="field-label">Travelers</span>
          <div className="input-icon-wrap">
            <span className="input-icon">👤</span>
            <input name="travelers" type="number" min="1" value={values.travelers} onChange={onChange} />
          </div>
        </label>
      </div>

      <fieldset className="planning-mode-group">
        <legend className="field-label">Recommendation mode</legend>
        <label className={`planning-mode-option ${values.planningMode === 'fast' ? 'active' : ''}`}>
          <input
            type="radio"
            name="planningMode"
            value="fast"
            checked={values.planningMode === 'fast'}
            onChange={onChange}
          />
          <span>
            <strong>Fast response</strong>
            <small>Quicker itinerary draft for everyday planning.</small>
          </span>
        </label>
        <label className={`planning-mode-option ${values.planningMode === 'premium' ? 'active' : ''}`}>
          <input
            type="radio"
            name="planningMode"
            value="premium"
            checked={values.planningMode === 'premium'}
            onChange={onChange}
          />
          <span>
            <strong>Premium recommendation</strong>
            <small>Higher-quality recommendations with slower generation.</small>
          </span>
        </label>
      </fieldset>

      {error ? <div className="error-banner">{error}</div> : null}

      <button className="cta-button" disabled={submitting} type="submit">
        {submitting ? (
          <span className="cta-loading"><span className="spinner" />Generating your trip plan…</span>
        ) : (
          '✨ Generate my trip plan'
        )}
      </button>
    </form>
  );
}
