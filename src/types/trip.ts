export type TripStatus = 'PLANNING' | 'COMPLETED' | 'FAILED';

export interface TripFormValues {
  departureCity: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  planningMode: 'fast' | 'premium';
  departureIata?: string;   // e.g. "SEA" — resolved by ChatGPT
  destinationIata?: string; // e.g. "SFO"
}

export interface FlightOption {
  airline: string;
  flightNumber: string;
  departure: string;   // e.g. "SEA 08:30"
  arrival: string;     // e.g. "SFO 10:40"
  estimatedPrice: number;
  duration: string;
  stops: string;       // e.g. "Nonstop" or "1 stop via LAX"
  bookingUrl?: string;
  isLiveSearch?: boolean;
  priceLabel?: string;
  recommendationReason?: string;
}

export interface HotelOption {
  name: string;
  area: string;
  estimatedNightlyPrice: number;
  totalEstimatedPrice: number;
  starRating: number;
  highlights: string; // e.g. "Free breakfast, rooftop pool"
  bookingUrl?: string;
  isLiveSearch?: boolean;
  priceLabel?: string;
}

export interface CarRentalOption {
  provider: string;
  estimatedTotalPrice: number;
  pickupLocation: string;
  bookingUrl: string;
  isLiveSearch?: boolean;
  priceLabel?: string;
}

export interface Activity {
  time: string;
  name: string;
  type: string;
  notes?: string;
  transportFromPrevious?: string;
  lat?: number;
  lng?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  priceRange: string;
  reservationRecommended: boolean;
  reservationUrl?: string;
  photoQuery?: string; // e.g. "ramen tokyo" — used to fetch a relevant photo
}

export interface TravelTips {
  bestSeasonSummary: string;
  visaGuidance: string;
  localTip: string;
  weatherSummary?: string;
  clothingRecommendations?: string;
  preTravelReminders?: string[];
}

export interface CostSummary {
  flights: number;
  hotels: number;
  carRental: number;
  foodEstimate: number;
  activitiesEstimate: number;
  total: number;
}

export interface TripResult {
  tripId: string;
  status: TripStatus;
  request: TripFormValues;
  flights: FlightOption[];
  hotels: HotelOption[];
  carRentals: CarRentalOption[];
  itinerary: ItineraryDay[];
  restaurants: RestaurantRecommendation[];
  travelTips: TravelTips;
  costSummary: CostSummary;
  createdAt: string;
  warnings?: string[];
}
