import OpenAI from 'openai';
import { config } from '@/api/config';
import { buildTravelPrompt } from '@/api/buildTravelPrompt';
import type { TripFormValues, TripResult } from '@/types/trip';

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
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as Omit<TripResult, 'tripId' | 'status' | 'request' | 'createdAt'> & {
    departureIata?: string;
    destinationIata?: string;
  };

  return {
    tripId,
    status: 'COMPLETED',
    request: {
      ...input,
      departureIata: parsed.departureIata,
      destinationIata: parsed.destinationIata,
    },
    createdAt: new Date().toISOString(),
    flights: parsed.flights ?? [],
    hotels: parsed.hotels ?? [],
    carRentals: parsed.carRentals ?? [],
    itinerary: parsed.itinerary ?? [],
    restaurants: parsed.restaurants ?? [],
    travelTips: parsed.travelTips ?? { bestSeasonSummary: '', visaGuidance: '', localTip: '' },
    costSummary: parsed.costSummary ?? { flights: 0, hotels: 0, carRental: 0, foodEstimate: 0, activitiesEstimate: 0, total: 0 },
  };
}
