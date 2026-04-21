import { useNavigate } from 'react-router-dom';
import { createTrip } from '@/api/trips';
import { TripForm } from '@/features/trip/components/TripForm';
import { useTripForm } from '@/features/trip/hooks/useTripForm';

export function TripFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const { values, error, submitting, updateField, handleSubmit } = useTripForm(async (formValues) => {
    const response = await createTrip(formValues);
    navigate(`/trips/${response.tripId}`);
  });

  return (
    <div className="page-grid">
      <TripForm
        values={values}
        error={error}
        submitting={submitting}
        onChange={updateField}
        onSubmit={handleSubmit}
      />

      <aside className="card side-panel">
        <h2>P0 coverage</h2>
        <ul>
          <li>Single destination city planning</li>
          <li>Flights, hotels, car rentals, itinerary, restaurants</li>
          <li>Static redirect links to partner booking sites</li>
          <li>Cost summary and travel tips</li>
        </ul>
      </aside>
    </div>
  );
}
