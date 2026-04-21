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
      <div>
        <h1>Plan a trip in minutes</h1>
        <p className="muted">P0 supports a single departure city and a single destination city.</p>
      </div>

      <div className="form-grid">
        <label>
          Departure city
          <input name="departureCity" value={values.departureCity} onChange={onChange} placeholder="Seattle" />
        </label>

        <label>
          Destination city
          <input name="destinationCity" value={values.destinationCity} onChange={onChange} placeholder="San Francisco" />
        </label>

        <label>
          Start date
          <input name="startDate" type="date" value={values.startDate} onChange={onChange} />
        </label>

        <label>
          End date
          <input name="endDate" type="date" value={values.endDate} onChange={onChange} />
        </label>

        <label>
          Budget (USD)
          <input name="budget" type="number" min="1" value={values.budget} onChange={onChange} />
        </label>

        <label>
          Travelers
          <input name="travelers" type="number" min="1" value={values.travelers} onChange={onChange} />
        </label>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? 'Generating trip…' : 'Generate trip'}
      </button>
    </form>
  );
}
