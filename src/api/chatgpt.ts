import OpenAI from 'openai';
import { config } from '@/api/config';
import { buildEnrichmentPrompt, buildItineraryPrompt } from '@/api/buildTravelPrompt';
import { buildStaticTripSections } from '@/api/staticTripSections';
import type { HotelOption, TripFormValues, TripResult } from '@/types/trip';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: config.openAiApiKey, dangerouslyAllowBrowser: true });
  }
  return _client;
}

export async function callChatGPT(input: TripFormValues, tripId: string): Promise<TripResult> {
  const model = modelForPlanningMode(input.planningMode);
  const itineraryPrompt = buildItineraryPrompt(input);

  const itineraryPayload = await requestJson<Pick<TripResult, 'hotels' | 'itinerary'>>(model, itineraryPrompt);
  const staticSections = buildStaticTripSections(input);
  const hotels = normalizeHotels(itineraryPayload.hotels, staticSections.hotels);
  const hotelTotal = hotels[0]?.totalEstimatedPrice ?? staticSections.costSummary.hotels;
  const costSummary = {
    ...staticSections.costSummary,
    hotels: hotelTotal,
    total: staticSections.costSummary.total - staticSections.costSummary.hotels + hotelTotal,
  };
  const { restaurants, travelTips, warnings } = await generateEnrichment(input, model);

  return {
    tripId,
    status: 'COMPLETED',
    request: {
      ...input,
      departureIata: staticSections.departureIata,
      destinationIata: staticSections.destinationIata,
    },
    createdAt: new Date().toISOString(),
    flights: staticSections.flights,
    hotels,
    carRentals: staticSections.carRentals,
    itinerary: itineraryPayload.itinerary ?? [],
    restaurants,
    travelTips,
    costSummary,
    warnings,
  };
}

async function requestJson<T>(model: string, prompt: string): Promise<T> {
  const completion = await getClient().chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as T;
}

async function generateEnrichment(
  input: TripFormValues,
  model: string,
): Promise<Pick<TripResult, 'restaurants' | 'travelTips' | 'warnings'>> {
  try {
    const enrichment = await requestJson<Pick<TripResult, 'restaurants' | 'travelTips'>>(
      model,
      buildEnrichmentPrompt(input),
    );
    return {
      restaurants: enrichment.restaurants ?? [],
      travelTips: enrichment.travelTips ?? fallbackTravelTips(input),
      warnings: [],
    };
  } catch (error) {
    return {
      restaurants: [],
      travelTips: fallbackTravelTips(input),
      warnings: [error instanceof Error ? `Restaurant and travel tip generation failed: ${error.message}` : 'Restaurant and travel tip generation failed.'],
    };
  }
}

function modelForPlanningMode(mode: TripFormValues['planningMode']): string {
  return mode === 'premium' ? config.openAiPremiumModel : config.openAiFastModel;
}

function fallbackTravelTips(input: TripFormValues): TripResult['travelTips'] {
  return {
    bestSeasonSummary: `Check seasonal conditions for ${input.destinationCity} before departure.`,
    visaGuidance: 'Confirm official entry and visa requirements based on your citizenship before booking.',
    localTip: 'Keep the first day flexible and verify opening hours for major attractions.',
    weatherSummary: 'Review the forecast shortly before departure.',
    clothingRecommendations: 'Pack comfortable walking shoes and layers.',
    preTravelReminders: ['Confirm bookings', 'Save offline maps', 'Check airport and local transport options'],
  };
}

function normalizeHotels(hotels: HotelOption[] | undefined, fallback: HotelOption[]): HotelOption[] {
  const validHotels = (hotels ?? []).filter((hotel) => hotel.name && hotel.area);
  if (!validHotels.length) return fallback;

  return validHotels.map((hotel) => ({
    ...hotel,
    estimatedNightlyPrice: Number(hotel.estimatedNightlyPrice) || 0,
    totalEstimatedPrice: Number(hotel.totalEstimatedPrice) || Number(hotel.estimatedNightlyPrice) || 0,
    starRating: Number(hotel.starRating) || 0,
    highlights: hotel.highlights || 'Recommended as a practical base for the itinerary.',
    priceLabel: hotel.priceLabel ?? 'AI estimate',
  }));
}
