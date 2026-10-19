export interface CompanyDetails {
  email: string;
  primaryPhone: string;
  secondaryPhone?: string; // Optional - not mandatory
  address: string;
  serviceArea?: string;
  mapPinQuery?: string; // Optional custom pin override (landmark, GPS coordinates, or specific place query)
  latitude?: number; // Optional exact GPS latitude
  longitude?: number; // Optional exact GPS longitude
}

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  email: "hi5creationbe@gmail.com",
  primaryPhone: "+91 63792 39878",
  secondaryPhone: "+91 78453 63330",
  address: "No. 2/89, Palakkad - Coimbatore Rd, Gandhi Nagar, Kuniyamuthur, Tamil Nadu 641008.",
  serviceArea: "Coimbatore & across South India",
  mapPinQuery: "10.9664, 76.9422",
  latitude: 10.9664,
  longitude: 76.9422,
};

/**
 * Strips formatting characters from phone string to produce a clean tel: link
 * e.g. "+91 63792 39878" -> "tel:+916379239878"
 */
export function formatTelLink(phone: string): string {
  if (!phone) return "tel:";
  const clean = phone.replace(/[^0-9+]/g, "");
  return `tel:${clean}`;
}

/**
 * Extracts digits from phone string to produce a WhatsApp wa.me link
 * e.g. "+91 63792 39878" -> "https://wa.me/916379239878?text=..."
 */
export function formatWhatsAppLink(phone: string, customText?: string): string {
  if (!phone) return "https://wa.me/";
  const digits = phone.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(
    customText || "Hi Hi 5 Creation, I'm interested in your signage services. I'd like to discuss my requirement."
  );
  return `https://wa.me/${digits}?text=${text}`;
}

/**
 * Cleans location input by extracting coordinates/query if user pasted a Google Maps URL
 */
export function cleanLocationInput(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  // Check for ?q= parameter
  const qMatch = trimmed.match(/[?&]q=([^&]+)/);
  if (qMatch) return decodeURIComponent(qMatch[1]).replace(/\+/g, " ").trim();
  // Check for /@lat,lng
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return `${atMatch[1]}, ${atMatch[2]}`;
  // Check for /place/lat,lng
  const placeCoordMatch = trimmed.match(/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeCoordMatch) return `${placeCoordMatch[1]}, ${placeCoordMatch[2]}`;
  // Check for /place/Place+Name/
  const placeNameMatch = trimmed.match(/place\/([^/@?]+)/);
  if (placeNameMatch) {
    const decoded = decodeURIComponent(placeNameMatch[1]).replace(/\+/g, " ").trim();
    if (decoded) return decoded;
  }
  // Check for /search/Search+Term/
  const searchMatch = trimmed.match(/search\/([^/@?]+)/);
  if (searchMatch) {
    const decoded = decodeURIComponent(searchMatch[1]).replace(/\+/g, " ").trim();
    if (decoded) return decoded;
  }
  return trimmed;
}

/**
 * Resolves the primary location query string used for mapping and directions.
 * Uses exact GPS coordinates if available, then mapPinQuery, then company address.
 */
export function getMapLocationQuery(details?: {
  address?: string;
  mapPinQuery?: string;
  latitude?: number;
  longitude?: number;
}): string {
  if (!details) return "10.9664, 76.9422";
  if (details.mapPinQuery?.trim()) {
    return cleanLocationInput(details.mapPinQuery);
  }
  if (
    typeof details.latitude === "number" &&
    typeof details.longitude === "number" &&
    !isNaN(details.latitude) &&
    !isNaN(details.longitude)
  ) {
    return `${details.latitude.toFixed(6)}, ${details.longitude.toFixed(6)}`;
  }
  return cleanLocationInput(details.address?.trim() || "Kuniyamuthur Coimbatore");
}

/**
 * Generates an interactive Google Maps iframe embed URL that dynamically marks
 * a red location pin at the exact address or coordinates given.
 */
export function getGoogleMapsEmbedUrl(details?: {
  address?: string;
  mapPinQuery?: string;
  latitude?: number;
  longitude?: number;
}): string {
  const query = getMapLocationQuery(details);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Generates a direct Google Maps search link to open in a new tab.
 */
export function getGoogleMapsSearchUrl(details?: {
  address?: string;
  mapPinQuery?: string;
  latitude?: number;
  longitude?: number;
}): string {
  const query = getMapLocationQuery(details);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Generates a turn-by-turn directions link to open directly in Google Maps.
 */
export function getGoogleMapsDirectionsUrl(details?: {
  address?: string;
  mapPinQuery?: string;
  latitude?: number;
  longitude?: number;
}): string {
  const query = getMapLocationQuery(details);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
