import type { TripFormValues } from '@/types/trip';

interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
  returnDate: string;
  travelers: number;
  airline?: string;
}

interface HotelSearchParams {
  name: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function flightSearchUrls({ from, to, date, returnDate, travelers, airline }: FlightSearchParams) {
  const dateCompact = date.replace(/-/g, '');
  const returnDateCompact = returnDate.replace(/-/g, '');
  const googleQuery = `${airline ? airline + ' ' : ''}${from} to ${to} ${date} return ${returnDate}`;

  return {
    google: `https://www.google.com/travel/flights/search?q=${encodeURIComponent(googleQuery)}`,
    kayak: `https://www.kayak.com/flights/${encodeURIComponent(from)}-${encodeURIComponent(to)}/${date}/${returnDate}/${travelers}adults`,
    expedia: `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:${encodeURIComponent(from)},to:${encodeURIComponent(to)},departure:${date}TANYT&leg2=from:${encodeURIComponent(to)},to:${encodeURIComponent(from)},departure:${returnDate}TANYT&passengers=adults:${travelers},children:0&options=cabinclass:economy`,
    skyscanner: `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${dateCompact}/${returnDateCompact}/?adults=${travelers}&adultsv2=${travelers}&cabinclass=economy&children=0&infants=0`,
  };
}

export function hotelSearchUrls({ name, destination, checkIn, checkOut, guests }: HotelSearchParams) {
  return {
    booking: `https://www.booking.com/search.html?ss=${encodeURIComponent(name + ' ' + destination)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}`,
    hotels: `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(destination)}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=1&q-room-0-adults=${guests}`,
    expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${checkIn}&endDate=${checkOut}&adults=${guests}`,
    airbnb: `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes?checkin=${checkIn}&checkout=${checkOut}&adults=${guests}`,
  };
}

export function buildBookingUrls(request: TripFormValues, airline?: string) {
  return {
    flight: flightSearchUrls({
      from: request.departureCity,
      to: request.destinationCity,
      date: request.startDate,
      returnDate: request.endDate,
      travelers: request.travelers,
      airline,
    }),
    hotel: hotelSearchUrls({
      name: '',
      destination: request.destinationCity,
      checkIn: request.startDate,
      checkOut: request.endDate,
      guests: request.travelers,
    }),
  };
}
