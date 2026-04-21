export type TripStatus = 'PLANNING' | 'COMPLETED' | 'FAILED';

export interface TripFormValues {
  departureCity: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
}

export interface FlightOption {
  provider: string;
  title: string;
  estimatedPrice: number;
  duration: string;
  bookingUrl: string;
}

export interface HotelOption {
  name: string;
  area: string;
  estimatedNightlyPrice: number;
  totalEstimatedPrice: number;
  bookingUrl: string;
}

export interface CarRentalOption {
  provider: string;
  estimatedTotalPrice: number;
  pickupLocation: string;
  bookingUrl: string;
}

export interface Activity {
  time: string;
  name: string;
  type: string;
  notes?: string;
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
}

export interface TravelTips {
  bestSeasonSummary: string;
  visaGuidance: string;
  localTip: string;
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
}
