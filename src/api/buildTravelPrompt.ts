import type { TripFormValues } from '@/types/trip';

export function buildTravelPrompt(input: TripFormValues): string {
  const nights =
    Math.round(
      (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / 86_400_000,
    ) || 1;

  return `You are a professional travel planner. Generate the experience-planning parts of a trip as a single JSON object (no markdown, no extra text).

Trip details:
- Departure: ${input.departureCity}
- Destination: ${input.destinationCity}
- Dates: ${input.startDate} to ${input.endDate} (${nights} nights)
- Budget: $${input.budget} USD total
- Travelers: ${input.travelers}

Return ONLY valid JSON matching this exact TypeScript shape:
{
  "itinerary": [{ "dayNumber": number, "theme": string, "activities": [{ "time": string, "name": string, "type": string, "notes": string | undefined, "transportFromPrevious": string | undefined, "lat": number, "lng": number }] }],
  "restaurants": [{ "name": string, "cuisine": string, "priceRange": string, "reservationRecommended": boolean, "reservationUrl": string | undefined, "photoQuery": string }],
  "travelTips": { "bestSeasonSummary": string, "visaGuidance": string, "localTip": string, "weatherSummary": string, "clothingRecommendations": string, "preTravelReminders": string[] }
}

Requirements:
- Do not generate flight, hotel, car rental, price, or booking inventory. The app provides those static planning options separately.
- Build a detailed day-by-day itinerary for every calendar day between ${input.startDate} and ${input.endDate}. Use dayNumber 1 through ${nights}.
- Each day must include 4-6 chronological activities with realistic times from morning through evening.
- Each activity must be a real, mappable place in or near ${input.destinationCity}. Use specific place names, not generic labels like "museum", "downtown walk", or "local lunch".
- Every activity must include numeric "lat" and "lng" coordinates that Google Maps can plot. Do not omit coordinates. Use the best-known entrance/center coordinates for the place.
- Cluster each day geographically so the map route is practical instead of jumping across the city.
- "transportFromPrevious" must describe the route from the previous activity to this activity using this format: "From [previous place]: [walk/drive/transit] about [minutes] min, [miles] mi / [kilometers] km." Use both miles and kilometers for every transition.
- For the first activity of each day, "transportFromPrevious" must describe the route from the recommended hotel/base area using the same format, including estimated drive or walk time, miles, and kilometers.
- Choose walk for short urban transfers, transit when it is practical, and drive/rideshare for longer transfers. Keep the estimate realistic for normal traffic and walking speed.
- "notes" must explain why the stop fits the user's destination, dates, budget, and traveler count, plus any reservation/ticket timing advice.
- Use activity "type" values such as "attraction", "restaurant", "culture", "nature", "shopping", "viewpoint", "transport", or "free_time".
- Include meals as activities when they are part of the day's flow, and make those meal stops match the restaurants list when sensible.
- Keep the pacing realistic for ${input.travelers} traveler${input.travelers === 1 ? '' : 's'} and leave buffers between major stops.
- Include weather forecast summary for the travel dates and clothing recommendations
- Include visa requirements for common passport holders traveling from ${input.departureCity} to ${input.destinationCity}
- Include pre-travel reminders (vaccinations, currency, SIM card, etc.)`;
}
