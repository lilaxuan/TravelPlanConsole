import { callChatGPT } from '@/api/chatgpt';
import { config } from '@/api/config';
import { createMockTripResult } from '@/api/mockData';
import type { TripFormValues, TripResult } from '@/types/trip';

const tripStore = new Map<string, TripResult>();

function createTripId(): string {
  return `trip_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createTrip(input: TripFormValues): Promise<{ tripId: string }> {
  const tripId = createTripId();
  const result = config.enableMocks
    ? createMockTripResult(input, tripId)
    : await callChatGPT(input, tripId);
  tripStore.set(tripId, result);
  return { tripId };
}

export async function getTrip(tripId: string): Promise<TripResult> {
  const result = tripStore.get(tripId);
  if (!result) throw new Error('Trip not found');
  return result;
}
