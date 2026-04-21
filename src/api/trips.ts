import { config } from '@/api/config';
import { createMockTripResult } from '@/api/mockData';
import type { TripFormValues, TripResult } from '@/types/trip';

const mockStore = new Map<string, TripResult>();

function createTripId(): string {
  return `trip_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createTrip(input: TripFormValues): Promise<{ tripId: string }> {
  if (config.enableMocks || !config.apiBaseUrl) {
    const tripId = createTripId();
    const result = createMockTripResult(input, tripId);
    mockStore.set(tripId, result);
    return Promise.resolve({ tripId });
  }

  const response = await fetch(`${config.apiBaseUrl}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create trip');
  }

  return (await response.json()) as { tripId: string };
}

export async function getTrip(tripId: string): Promise<TripResult> {
  if (config.enableMocks || !config.apiBaseUrl) {
    const result = mockStore.get(tripId);
    if (!result) {
      throw new Error('Trip not found');
    }
    return Promise.resolve(result);
  }

  const response = await fetch(`${config.apiBaseUrl}/trips/${tripId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch trip');
  }

  return (await response.json()) as TripResult;
}
