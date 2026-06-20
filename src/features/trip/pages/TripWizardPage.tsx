import { useEffect, useRef } from 'react';
import { createTrip, getTrip } from '@/api/trips';
import { TripForm } from '@/features/trip/components/TripForm';
import { TripHero } from '@/features/trip/components/TripHero';
import { TripLoadingState } from '@/features/trip/components/TripLoadingState';
import { FlightSelectStep } from '@/features/trip/components/FlightSelectStep';
import { HotelSelectStep } from '@/features/trip/components/HotelSelectStep';
import { CarRentalSelectStep } from '@/features/trip/components/CarRentalSelectStep';
import { ItinerarySummaryStep } from '@/features/trip/components/ItinerarySummaryStep';
import { useTripForm } from '@/features/trip/hooks/useTripForm';
import { useTripWizard, type WizardStep } from '@/features/trip/hooks/useTripWizard';
import { guessUserCity } from '@/utils/geolocate';

const STEP_LABELS = ['Trip details', 'Choose flight', 'Choose hotel', 'Car rental', 'Itinerary'];

export function TripWizardPage(): React.ReactElement {
  const { state, setStep, setTripResult, selectFlight, selectHotel, selectCarRental, setLoading, setError } = useTripWizard();
  const { values, error: formError, submitting, updateField, setField, handleSubmit } = useTripForm(async (formValues) => {
    setLoading(true);
    try {
      const { tripId } = await createTrip(formValues);
      const result = await getTrip(tripId);
      setTripResult(formValues, result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  });

  // Prefill the departure city from IP geolocation (with timezone fallback)
  // on first mount. Won't overwrite if the user has already typed something.
  const departureRef = useRef(values.departureCity);
  departureRef.current = values.departureCity;
  useEffect(() => {
    let cancelled = false;
    guessUserCity().then((city) => {
      if (!cancelled && city && !departureRef.current) {
        setField('departureCity', city);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setField]);

  // Step 1 gets the immersive landing experience.
  if (state.step === 1 && !state.loading) {
    return (
      <TripHero onSelectDestination={(city) => setField('destinationCity', city)}>
        <TripForm
          values={values}
          error={formError ?? state.error}
          submitting={submitting}
          onChange={updateField}
          onSubmit={handleSubmit}
        />
      </TripHero>
    );
  }

  // Steps 2–5 (and the loading state) use the focused wizard layout.
  return (
    <div className="wizard-funnel">
      <div className="wizard-steps">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = n === state.step;
          const done = n < state.step;
          const reachable = n <= state.maxVisitedStep && n !== state.step;
          return (
            <div
              key={label}
              className={`wizard-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}
              onClick={reachable ? () => setStep(n as WizardStep) : undefined}
              style={reachable ? { cursor: 'pointer' } : undefined}
            >
              <div className="wizard-step-dot">{done ? '✓' : n}</div>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {state.loading && <TripLoadingState />}

      {state.step === 2 && state.tripResult && (
        <FlightSelectStep
          flights={state.tripResult.flights}
          request={state.tripResult.request}
          selected={state.selectedFlight}
          onSelect={selectFlight}
          onBack={() => setStep(1)}
        />
      )}

      {state.step === 3 && state.tripResult && (
        <HotelSelectStep
          hotels={state.tripResult.hotels}
          request={state.tripResult.request}
          selected={state.selectedHotel}
          onSelect={selectHotel}
          onBack={() => setStep(2)}
        />
      )}

      {state.step === 4 && state.tripResult && (
        <CarRentalSelectStep
          carRentals={state.tripResult.carRentals}
          selected={state.selectedCarRental}
          onSelect={selectCarRental}
          onBack={() => setStep(3)}
        />
      )}

      {state.step === 5 && state.tripResult && (
        <ItinerarySummaryStep
          trip={state.tripResult}
          selectedFlight={state.selectedFlight}
          selectedHotel={state.selectedHotel}
          selectedCarRental={state.selectedCarRental}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
}
