import { useState } from 'react';
import type { TripFormValues, TripResult, FlightOption, HotelOption, CarRentalOption } from '@/types/trip';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  step: WizardStep;
  maxVisitedStep: WizardStep;
  formValues: TripFormValues | null;
  tripResult: TripResult | null;
  selectedFlight: FlightOption | null;
  selectedHotel: HotelOption | null;
  selectedCarRental: CarRentalOption | null;
  loading: boolean;
  error: string | null;
}

export function useTripWizard() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    maxVisitedStep: 1,
    formValues: null,
    tripResult: null,
    selectedFlight: null,
    selectedHotel: null,
    selectedCarRental: null,
    loading: false,
    error: null,
  });

  function setStep(step: WizardStep) {
    setState((s) => ({ ...s, step, maxVisitedStep: Math.max(s.maxVisitedStep, step) as WizardStep }));
  }

  function setTripResult(formValues: TripFormValues, tripResult: TripResult) {
    setState((s) => ({ ...s, formValues, tripResult, step: 2, maxVisitedStep: Math.max(s.maxVisitedStep, 2) as WizardStep, error: null }));
  }

  function selectFlight(flight: FlightOption) {
    setState((s) => ({ ...s, selectedFlight: flight, step: 3, maxVisitedStep: Math.max(s.maxVisitedStep, 3) as WizardStep }));
  }

  function selectHotel(hotel: HotelOption) {
    setState((s) => ({ ...s, selectedHotel: hotel, step: 4, maxVisitedStep: Math.max(s.maxVisitedStep, 4) as WizardStep }));
  }

  function selectCarRental(car: CarRentalOption | null) {
    setState((s) => ({ ...s, selectedCarRental: car, step: 5, maxVisitedStep: Math.max(s.maxVisitedStep, 5) as WizardStep }));
  }

  function setLoading(loading: boolean) {
    setState((s) => ({ ...s, loading }));
  }

  function setError(error: string | null) {
    setState((s) => ({ ...s, error }));
  }

  return { state, setStep, setTripResult, selectFlight, selectHotel, selectCarRental, setLoading, setError };
}
