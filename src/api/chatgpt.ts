import OpenAI from 'openai';
import { config } from '@/api/config';
import { buildTravelPrompt } from '@/api/buildTravelPrompt';
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
  const prompt = buildTravelPrompt(input);

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 5000,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as Pick<TripResult, 'hotels' | 'itinerary' | 'restaurants' | 'travelTips'>;
  const staticSections = buildStaticTripSections(input);
  const hotels = normalizeHotels(parsed.hotels, staticSections.hotels);
  const hotelTotal = hotels[0]?.totalEstimatedPrice ?? staticSections.costSummary.hotels;
  const costSummary = {
    ...staticSections.costSummary,
    hotels: hotelTotal,
    total: staticSections.costSummary.total - staticSections.costSummary.hotels + hotelTotal,
  };

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
    itinerary: parsed.itinerary ?? [],
    restaurants: parsed.restaurants ?? [],
    travelTips: parsed.travelTips ?? { bestSeasonSummary: '', visaGuidance: '', localTip: '' },
    costSummary,
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
