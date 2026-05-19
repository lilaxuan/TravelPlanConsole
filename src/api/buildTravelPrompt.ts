import type { TripFormValues } from '@/types/trip';

export function buildTravelPrompt(input: TripFormValues): string {
  const nights =
    Math.round(
      (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / 86_400_000,
    ) || 1;

  return `You are a professional travel planner. Generate a complete trip plan as a single JSON object (no markdown, no extra text).

Trip details:
- Departure: ${input.departureCity}
- Destination: ${input.destinationCity}
- Dates: ${input.startDate} to ${input.endDate} (${nights} nights)
- Budget: $${input.budget} USD total
- Travelers: ${input.travelers}

Return ONLY valid JSON matching this exact TypeScript shape:
{
  "departureIata": string,
  "destinationIata": string,
  "flights": [{
    "airline": string,
    "flightNumber": string,
    "departure": string,
    "arrival": string,
    "estimatedPrice": number,
    "duration": string,
    "stops": string
  }],
  "hotels": [{
    "name": string,
    "area": string,
    "estimatedNightlyPrice": number,
    "totalEstimatedPrice": number,
    "starRating": number,
    "highlights": string
  }],
  "carRentals": [{ "provider": string, "estimatedTotalPrice": number, "pickupLocation": string, "bookingUrl": string }],
  "itinerary": [{ "dayNumber": number, "theme": string, "activities": [{ "time": string, "name": string, "type": string, "notes": string | undefined, "transportFromPrevious": string | undefined, "lat": number, "lng": number }] }],
  "restaurants": [{ "name": string, "cuisine": string, "priceRange": string, "reservationRecommended": boolean, "reservationUrl": string | undefined, "photoQuery": string }],
  "travelTips": { "bestSeasonSummary": string, "visaGuidance": string, "localTip": string, "weatherSummary": string, "clothingRecommendations": string, "preTravelReminders": string[] },
  "costSummary": { "flights": number, "hotels": number, "carRental": number, "foodEstimate": number, "activitiesEstimate": number, "total": number }
}

Requirements:
- Include 2-3 realistic flight options with real airline names, plausible flight numbers, and departure/arrival times (e.g. "SEA 08:30", "SFO 10:40")
- Include 2-3 real well-known hotels with accurate star ratings and notable highlights
- Include 2-3 car rental options from different providers (e.g. Enterprise, Hertz, Budget, Avis) with realistic total prices for the trip duration
- Build a day-by-day itinerary for all ${nights} nights covering popular attractions, local food, and hidden gems
- For each activity include approximate travel time/distance from the previous spot in "transportFromPrevious"
- For each activity include accurate GPS coordinates (lat, lng) for map display
- Include weather forecast summary for the travel dates and clothing recommendations
- Include visa requirements for common passport holders traveling from ${input.departureCity} to ${input.destinationCity}
- Include pre-travel reminders (vaccinations, currency, SIM card, etc.)
- Keep total cost estimate within the $${input.budget} budget where possible`;
}
