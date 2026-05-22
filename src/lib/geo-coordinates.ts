/** Approximate coordinates for map dots (country centroids + known cities). */

type Coords = { lat: number; lng: number };

const COUNTRY_CENTROIDS: Record<string, Coords> = {
  AD: { lat: 42.55, lng: 1.6 },
  AE: { lat: 24.0, lng: 54.0 },
  AL: { lat: 41.0, lng: 20.0 },
  AR: { lat: -34.0, lng: -64.0 },
  AT: { lat: 47.52, lng: 14.55 },
  AU: { lat: -25.0, lng: 135.0 },
  BE: { lat: 50.85, lng: 4.35 },
  BG: { lat: 42.73, lng: 25.49 },
  BR: { lat: -10.0, lng: -55.0 },
  CA: { lat: 56.0, lng: -96.0 },
  CH: { lat: 46.82, lng: 8.23 },
  CN: { lat: 35.0, lng: 105.0 },
  CY: { lat: 35.0, lng: 33.0 },
  CZ: { lat: 49.82, lng: 15.47 },
  DE: { lat: 51.17, lng: 10.45 },
  DK: { lat: 56.0, lng: 10.0 },
  EG: { lat: 26.82, lng: 30.8 },
  ES: { lat: 40.0, lng: -4.0 },
  FI: { lat: 64.0, lng: 26.0 },
  FR: { lat: 46.23, lng: 2.21 },
  GB: { lat: 55.38, lng: -3.44 },
  GR: { lat: 39.07, lng: 21.82 },
  HR: { lat: 45.1, lng: 15.2 },
  HU: { lat: 47.16, lng: 19.5 },
  IE: { lat: 53.41, lng: -8.24 },
  IL: { lat: 31.05, lng: 34.85 },
  IN: { lat: 22.0, lng: 79.0 },
  IR: { lat: 32.0, lng: 53.0 },
  IT: { lat: 42.83, lng: 12.83 },
  JP: { lat: 36.2, lng: 138.25 },
  KR: { lat: 36.5, lng: 127.5 },
  KZ: { lat: 48.0, lng: 68.0 },
  LT: { lat: 55.17, lng: 23.88 },
  LU: { lat: 49.82, lng: 6.13 },
  LV: { lat: 56.88, lng: 24.6 },
  MA: { lat: 32.0, lng: -5.0 },
  MX: { lat: 23.0, lng: -102.0 },
  NL: { lat: 52.37, lng: 4.9 },
  NO: { lat: 60.47, lng: 8.47 },
  NZ: { lat: -41.0, lng: 174.0 },
  PL: { lat: 51.92, lng: 19.15 },
  PT: { lat: 39.4, lng: -8.22 },
  RO: { lat: 45.94, lng: 24.97 },
  RS: { lat: 44.02, lng: 21.01 },
  RU: { lat: 61.52, lng: 105.32 },
  SA: { lat: 24.0, lng: 45.0 },
  SE: { lat: 60.13, lng: 18.64 },
  SG: { lat: 1.35, lng: 103.82 },
  SK: { lat: 48.67, lng: 19.7 },
  SY: { lat: 35.0, lng: 38.0 },
  TR: { lat: 39.0, lng: 35.0 },
  UA: { lat: 49.0, lng: 32.0 },
  US: { lat: 39.83, lng: -98.58 },
  ZA: { lat: -30.56, lng: 22.94 },
};

/** City keys: lowercase ASCII-ish slug from Vercel city header. */
const CITY_COORDS: Record<string, Coords> = {
  kayseri: { lat: 38.7312, lng: 35.4787 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  ankara: { lat: 39.9334, lng: 32.8597 },
  izmir: { lat: 38.4237, lng: 27.1428 },
  antalya: { lat: 36.8969, lng: 30.7133 },
  bursa: { lat: 40.1885, lng: 29.061 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  berlin: { lat: 52.52, lng: 13.405 },
  "new york": { lat: 40.7128, lng: -74.006 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
};

function normalizeCityKey(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function resolveGeoCoordinates(
  country: string | null,
  city: string | null,
  _region?: string | null,
): Coords | null {
  if (city) {
    const key = normalizeCityKey(city);
    const hit = CITY_COORDS[key];
    if (hit) return hit;
  }

  if (country) {
    const code = country.trim().toUpperCase();
    if (code.length === 2 && COUNTRY_CENTROIDS[code]) {
      return COUNTRY_CENTROIDS[code];
    }
  }

  return null;
}

/** Equirectangular projection into 0–1000 × 0–500 viewBox. */
export function projectToMap(coords: Coords): { x: number; y: number } {
  const x = ((coords.lng + 180) / 360) * 1000;
  const y = ((90 - coords.lat) / 180) * 500;
  return { x, y };
}
