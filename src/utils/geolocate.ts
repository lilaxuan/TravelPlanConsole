// Best-effort guess of the user's city, in priority order:
//   1. Browser GPS (one-time permission prompt) → reverse-geocode to city
//   2. IP geolocation (silent fallback if GPS is denied/blocked/slow)
//   3. IANA timezone (offline last-resort, e.g. America/Los_Angeles → Los Angeles)
//
// All paths are silent on failure — the form just stays empty.

const REVERSE_GEOCODE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const IP_API = 'https://ipapi.co/json/';
const GPS_TIMEOUT_MS = 8_000;
const REVERSE_GEOCODE_TIMEOUT_MS = 3_000;
const IP_TIMEOUT_MS = 2_500;

interface BigDataCloudResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

interface IpApiResponse {
  city?: string;
  region?: string;
  country_name?: string;
}

function getCurrentPositionPromise(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: 5 * 60 * 1000, // accept a fix up to 5 min old
    });
  });
}

async function fromGPS(): Promise<string | null> {
  try {
    const pos = await getCurrentPositionPromise();
    const { latitude, longitude } = pos.coords;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REVERSE_GEOCODE_TIMEOUT_MS);
    const url = `${REVERSE_GEOCODE}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as BigDataCloudResponse;
    // `locality` (e.g. "Newcastle") is usually the actual city; `city` can be
    // a broader urban area label (e.g. "Seattle East"). Prefer locality.
    return data.locality || data.city || null;
  } catch {
    return null;
  }
}

async function fromIP(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), IP_TIMEOUT_MS);
    const res = await fetch(IP_API, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as IpApiResponse;
      if (data.city) return data.city;
    }
  } catch {
    // fall through
  }
  return null;
}

function fromTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || !tz.includes('/')) return null;
    const tail = tz.split('/').pop();
    if (!tail) return null;
    const city = tail.replace(/_/g, ' ');
    if (/^(UTC|GMT|Universal|Unknown)$/i.test(city)) return null;
    return city;
  } catch {
    return null;
  }
}

export async function guessUserCity(): Promise<string | null> {
  return (await fromGPS()) ?? (await fromIP()) ?? fromTimeZone();
}
