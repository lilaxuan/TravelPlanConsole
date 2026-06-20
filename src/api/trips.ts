import { callChatGPT } from '@/api/chatgpt';
import { createMockTripResult } from '@/api/mockData';
import { config } from '@/api/config';
import type { TripFormValues, TripResult } from '@/types/trip';

const tripStore = new Map<string, TripResult>();
const requestCache = new Map<string, TripResult>();
const inflightRequests = new Map<string, Promise<TripResult>>();

function createTripId(): string {
  return `trip_${Math.random().toString(36).slice(2, 10)}`;
}

function buildRequestKey(input: TripFormValues): string {
  return JSON.stringify({
    departureCity: input.departureCity.trim().toLowerCase(),
    destinationCity: input.destinationCity.trim().toLowerCase(),
    startDate: input.startDate,
    endDate: input.endDate,
    budget: Number(input.budget),
    travelers: Number(input.travelers),
    planningMode: input.planningMode,
  });
}

function cloneTripResult(result: TripResult, tripId: string): TripResult {
  return {
    ...structuredClone(result),
    tripId,
    createdAt: new Date().toISOString(),
  };
}

export async function createTrip(input: TripFormValues): Promise<{ tripId: string }> {
  const tripId = createTripId();
  const requestKey = buildRequestKey(input);
  const cachedResult = requestCache.get(requestKey);

  if (cachedResult) {
    tripStore.set(tripId, cloneTripResult(cachedResult, tripId));
    return { tripId };
  }

  let request = inflightRequests.get(requestKey);
  if (!request) {
    request = config.enableMocks
      ? Promise.resolve(createMockTripResult(input, tripId))
      : callChatGPT(input, tripId);
    inflightRequests.set(requestKey, request);
  }

  const generatedResult = await request.finally(() => {
    inflightRequests.delete(requestKey);
  });
  requestCache.set(requestKey, generatedResult);
  const result = generatedResult.tripId === tripId ? generatedResult : cloneTripResult(generatedResult, tripId);

  tripStore.set(tripId, result);
  return { tripId };
}

export async function getTrip(tripId: string): Promise<TripResult> {
  const result = tripStore.get(tripId);
  if (!result) throw new Error('Trip not found');
  return result;
}
