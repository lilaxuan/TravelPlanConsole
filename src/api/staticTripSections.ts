import { flightSearchUrls, hotelSearchUrls } from '@/api/bookingUrls';
import type { CarRentalOption, CostSummary, FlightOption, HotelOption, TripFormValues } from '@/types/trip';

function tripLengthInNights(startDate: string, endDate: string): number {
  return Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000));
}

function cityCode(city: string): string {
  const letters = city.replace(/[^a-z]/gi, '').toUpperCase();
  return (letters.slice(0, 3) || 'AIR').padEnd(3, 'X');
}

export function buildStaticTripSections(input: TripFormValues): {
  departureIata: string;
  destinationIata: string;
  flights: FlightOption[];
  hotels: HotelOption[];
  carRentals: CarRentalOption[];
  costSummary: CostSummary;
} {
  const nights = tripLengthInNights(input.startDate, input.endDate);
  const departureIata = input.departureIata ?? cityCode(input.departureCity);
  const destinationIata = input.destinationIata ?? cityCode(input.destinationCity);
  const flightBase = Math.max(180, Math.round((input.budget * 0.18) / Math.max(1, input.travelers)));
  const nightlyBase = Math.max(120, Math.round((input.budget * 0.32) / nights));
  const carBase = Math.max(180, nights * 58);

  const flightUrls = flightSearchUrls({
    from: departureIata,
    to: destinationIata,
    date: input.startDate,
    returnDate: input.endDate,
    travelers: input.travelers,
  });
  const hotelUrls = hotelSearchUrls({
    name: '',
    destination: input.destinationCity,
    checkIn: input.startDate,
    checkOut: input.endDate,
    guests: input.travelers,
  });

  const flights: FlightOption[] = [
    {
      airline: 'Flexible fare search',
      flightNumber: `${departureIata}-${destinationIata}`,
      departure: `${departureIata} morning`,
      arrival: `${destinationIata} afternoon`,
      estimatedPrice: flightBase,
      duration: 'Search live times',
      stops: 'Best available',
      bookingUrl: flightUrls.google,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
      recommendationReason: 'Static planning option; open a provider to confirm live flight inventory.',
    },
    {
      airline: 'Budget fare search',
      flightNumber: `${departureIata}-${destinationIata}-VALUE`,
      departure: `${departureIata} flexible`,
      arrival: `${destinationIata} flexible`,
      estimatedPrice: Math.max(120, flightBase - 45),
      duration: 'Search live times',
      stops: 'Lowest fare focus',
      bookingUrl: flightUrls.kayak,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
      recommendationReason: 'Static planning option for price-sensitive searches.',
    },
  ];

  const hotels: HotelOption[] = [
    {
      name: `${input.destinationCity} Central Hotel Search`,
      area: 'Central / transit-friendly area',
      estimatedNightlyPrice: nightlyBase,
      totalEstimatedPrice: nightlyBase * nights,
      starRating: 4,
      highlights: 'Recommended search area for first-time visitors, transit access, and easy dinner plans.',
      bookingUrl: hotelUrls.booking,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
    },
    {
      name: `${input.destinationCity} Neighborhood Stay Search`,
      area: 'Local neighborhood option',
      estimatedNightlyPrice: Math.max(95, nightlyBase - 35),
      totalEstimatedPrice: Math.max(95, nightlyBase - 35) * nights,
      starRating: 3,
      highlights: 'Recommended search area for better value and a more local base.',
      bookingUrl: hotelUrls.hotels,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
    },
  ];

  const carRentals: CarRentalOption[] = [
    {
      provider: 'Airport rental search',
      estimatedTotalPrice: carBase,
      pickupLocation: `${input.destinationCity} airport`,
      bookingUrl: `https://www.expedia.com/Cars?pickup=${encodeURIComponent(input.destinationCity)}&startDate=${input.startDate}&endDate=${input.endDate}`,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
    },
    {
      provider: 'City pickup rental search',
      estimatedTotalPrice: Math.max(160, carBase - 40),
      pickupLocation: `${input.destinationCity} city center`,
      bookingUrl: `https://www.kayak.com/cars/${encodeURIComponent(input.destinationCity)}/${input.startDate}/${input.endDate}`,
      isLiveSearch: true,
      priceLabel: 'Estimate only',
    },
  ];

  const flightTotal = flightBase * input.travelers;
  const hotelTotal = hotels[0].totalEstimatedPrice;
  const foodEstimate = Math.round(70 * input.travelers * nights);
  const activitiesEstimate = Math.round(45 * input.travelers * Math.max(1, nights - 1));

  return {
    departureIata,
    destinationIata,
    flights,
    hotels,
    carRentals,
    costSummary: {
      flights: flightTotal,
      hotels: hotelTotal,
      carRental: carBase,
      foodEstimate,
      activitiesEstimate,
      total: flightTotal + hotelTotal + carBase + foodEstimate + activitiesEstimate,
    },
  };
}
