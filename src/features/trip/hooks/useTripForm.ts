import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { TripFormValues } from '@/types/trip';

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDefaultValues(): TripFormValues {
  const today = new Date();
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(today.getDate() + 14);
  return {
    departureCity: '',
    destinationCity: '',
    startDate: toLocalISODate(today),
    endDate: toLocalISODate(inTwoWeeks),
    budget: 1500,
    travelers: 1,
  };
}

export function useTripForm(onSubmit: (values: TripFormValues) => Promise<void>) {
  const [values, setValues] = useState<TripFormValues>(buildDefaultValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return Boolean(
      values.departureCity &&
        values.destinationCity &&
        values.startDate &&
        values.endDate &&
        values.budget > 0 &&
        values.travelers > 0 &&
        values.startDate <= values.endDate,
    );
  }, [values]);

  function updateField(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name === 'budget' || name === 'travelers' ? Number(value) : value,
    }));
  }

  const setField = useCallback(<K extends keyof TripFormValues>(name: K, value: TripFormValues[K]): void => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError('Please complete all required fields and confirm the date range.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(values);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create trip');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    values,
    error,
    submitting,
    isValid,
    updateField,
    setField,
    handleSubmit,
  };
}
