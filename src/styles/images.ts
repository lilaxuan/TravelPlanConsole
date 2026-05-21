// Curated Unsplash travel photos. Free for commercial use, no attribution required.
// URLs hot-link to the Unsplash CDN with on-the-fly resizing.

function unsplash(id: string, w = 1920, q = 80): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export const heroPhotos = {
  // Cinematic landscape — Bali rice terraces, golden hour
  bali: unsplash('photo-1537996194471-e657df975ab4'),
  // Auth background — Santorini blue domes
  santorini: unsplash('photo-1530841377377-3ff06c0ca713'),
  // Alt cinematic — coastal cliffs, Iceland
  iceland: unsplash('photo-1464822759023-fed622ff2c3b'),
};

export const destinationPhotos: ReadonlyArray<{ city: string; country: string; photo: string }> = [
  { city: 'Tokyo',     country: 'Japan',    photo: unsplash('photo-1540959733332-eab4deabeeaf', 800) },
  { city: 'Santorini', country: 'Greece',   photo: unsplash('photo-1530841377377-3ff06c0ca713', 800) },
  { city: 'Bali',      country: 'Indonesia',photo: unsplash('photo-1537996194471-e657df975ab4', 800) },
  { city: 'Lisbon',    country: 'Portugal', photo: unsplash('photo-1555881400-74d7acaacd8b', 800) },
  { city: 'Paris',     country: 'France',   photo: unsplash('photo-1502602898657-3e91760cbb34', 800) },
  { city: 'Cairo',     country: 'Egypt',    photo: unsplash('photo-1572252009286-268acec5ca0a', 800) },
  { city: 'Marrakech', country: 'Morocco',  photo: unsplash('photo-1597212618440-806262de4f6b', 800) },
  { city: 'Reykjavík', country: 'Iceland',  photo: unsplash('photo-1464822759023-fed622ff2c3b', 800) },
];
