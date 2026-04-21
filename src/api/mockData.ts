import type { TripFormValues, TripResult } from '@/types/trip';

export function createMockTripResult(input: TripFormValues, tripId: string): TripResult {
  const hotelTotal = 220 * 4;
  const flightTotal = 280 * input.travelers;
  const carRentalTotal = 260;
  const foodEstimate = 70 * input.travelers * 4;
  const activitiesEstimate = 45 * input.travelers * 3;

  return {
    tripId,
    status: 'COMPLETED',
    request: input,
    createdAt: new Date().toISOString(),
    flights: [
      {
        provider: 'Google Flights',
        title: `${input.departureCity} to ${input.destinationCity} - Morning nonstop`,
        estimatedPrice: 280,
        duration: '2h 10m',
        bookingUrl: 'https://www.google.com/travel/flights',
      },
      {
        provider: 'Expedia',
        title: `${input.departureCity} to ${input.destinationCity} - Best value`,
        estimatedPrice: 310,
        duration: '2h 25m',
        bookingUrl: 'https://www.expedia.com/',
      },
    ],
    hotels: [
      {
        name: 'Downtown Stay Hotel',
        area: 'City Center',
        estimatedNightlyPrice: 220,
        totalEstimatedPrice: hotelTotal,
        bookingUrl: 'https://www.booking.com/',
      },
      {
        name: 'Harbor View Suites',
        area: 'Waterfront',
        estimatedNightlyPrice: 240,
        totalEstimatedPrice: 960,
        bookingUrl: 'https://www.airbnb.com/',
      },
    ],
    carRentals: [
      {
        provider: 'RentalCars',
        estimatedTotalPrice: carRentalTotal,
        pickupLocation: `${input.destinationCity} Airport`,
        bookingUrl: 'https://www.rentalcars.com/',
      },
    ],
    itinerary: [
      {
        dayNumber: 1,
        theme: 'Arrival and city center walk',
        activities: [
          { time: '10:00', name: 'Check-in and coffee stop', type: 'relax' },
          { time: '13:00', name: 'Downtown landmark visit', type: 'sightseeing' },
          { time: '18:30', name: 'Dinner in the main food district', type: 'food' },
        ],
      },
      {
        dayNumber: 2,
        theme: 'Signature attractions',
        activities: [
          { time: '09:00', name: 'Top attraction #1', type: 'sightseeing' },
          { time: '14:00', name: 'Museum or waterfront area', type: 'culture' },
          { time: '19:00', name: 'Reservation-only restaurant', type: 'food', notes: 'Book 3 days ahead' },
        ],
      },
      {
        dayNumber: 3,
        theme: 'Flexible neighborhood exploration',
        activities: [
          { time: '10:00', name: 'Local brunch', type: 'food' },
          { time: '12:30', name: 'Neighborhood shopping street', type: 'shopping' },
          { time: '16:00', name: 'Sunset viewpoint', type: 'nature' },
        ],
      },
    ],
    restaurants: [
      {
        name: 'Golden Table',
        cuisine: 'Contemporary',
        priceRange: '$$$',
        reservationRecommended: true,
        reservationUrl: 'https://www.opentable.com/',
      },
      {
        name: 'Street Bowl House',
        cuisine: 'Local Casual',
        priceRange: '$$',
        reservationRecommended: false,
      },
    ],
    travelTips: {
      bestSeasonSummary: `${input.destinationCity} is typically best in spring and fall for balanced weather and moderate crowds.`,
      visaGuidance: 'Visa guidance is informational only. Confirm official entry requirements before booking.',
      localTip: 'Stay near the city center for easier access to attractions, food, and transportation.',
    },
    costSummary: {
      flights: flightTotal,
      hotels: hotelTotal,
      carRental: carRentalTotal,
      foodEstimate,
      activitiesEstimate,
      total: flightTotal + hotelTotal + carRentalTotal + foodEstimate + activitiesEstimate,
    },
  };
}
