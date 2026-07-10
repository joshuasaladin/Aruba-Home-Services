// ─────────────────────────────────────────────────────────────────────────────
// Guesty integration for Coralux.
//
// Connects to the Guesty Open API (https://open-api.guesty.com) using the
// OAuth2 client-credentials flow. Create API credentials in your Guesty
// account under  Settings → Integrations → API  and set:
//
//   GUESTY_CLIENT_ID=...
//   GUESTY_CLIENT_SECRET=...
//   GUESTY_BOOKING_ENGINE_URL=https://<your-subdomain>.guestybookings.com   (optional)
//
// Like the rest of this repo, everything degrades gracefully: with no
// credentials (or if Guesty is unreachable) the site renders a curated set of
// demo Aruba villas so it is always previewable.
// ─────────────────────────────────────────────────────────────────────────────

const GUESTY_API = "https://open-api.guesty.com/v1";
const GUESTY_TOKEN_URL = "https://open-api.guesty.com/oauth2/token";

export interface CoraluxListing {
  id: string;
  title: string;
  area: string; // neighborhood, e.g. "Palm Beach"
  city: string;
  summary: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  basePrice: number; // nightly, USD
  currency: string;
  images: string[]; // first image is the hero
  amenities: string[];
  minNights: number;
  /** Direct link to book this listing on your Guesty booking engine. */
  bookingUrl: string | null;
  /** True when this came from Guesty rather than the demo dataset. */
  fromGuesty: boolean;
}

export function isGuestyConfigured(): boolean {
  return Boolean(process.env.GUESTY_CLIENT_ID && process.env.GUESTY_CLIENT_SECRET);
}

// ── OAuth token (cached until ~5 minutes before expiry) ─────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGuestyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(GUESTY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "open-api",
      client_id: process.env.GUESTY_CLIENT_ID!,
      client_secret: process.env.GUESTY_CLIENT_SECRET!,
    }),
    // Guesty rate-limits token creation — never cache-bust this in a loop.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Guesty token request failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

// ── Listings ─────────────────────────────────────────────────────────────────
interface GuestyRawListing {
  _id: string;
  title?: string;
  nickname?: string;
  address?: { city?: string; state?: string; neighborhood?: string };
  publicDescription?: { summary?: string; space?: string };
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  prices?: { basePrice?: number; currency?: string };
  pictures?: { original?: string; large?: string; thumbnail?: string }[];
  picture?: { thumbnail?: string };
  amenities?: string[];
  terms?: { minNights?: number };
  active?: boolean;
}

function bookingUrlFor(id: string): string | null {
  const base = process.env.GUESTY_BOOKING_ENGINE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/properties/${id}`;
}

function normalizeListing(raw: GuestyRawListing): CoraluxListing {
  const images = (raw.pictures ?? [])
    .map((p) => p.original || p.large || p.thumbnail)
    .filter((u): u is string => Boolean(u));
  if (images.length === 0 && raw.picture?.thumbnail) images.push(raw.picture.thumbnail);

  return {
    id: raw._id,
    title: raw.title || raw.nickname || "Coralux Villa",
    area: raw.address?.neighborhood || raw.address?.city || "Aruba",
    city: raw.address?.city || "Aruba",
    summary: raw.publicDescription?.summary || raw.publicDescription?.space || "",
    bedrooms: raw.bedrooms ?? 1,
    bathrooms: raw.bathrooms ?? 1,
    guests: raw.accommodates ?? 2,
    basePrice: raw.prices?.basePrice ?? 0,
    currency: raw.prices?.currency ?? "USD",
    images,
    amenities: raw.amenities ?? [],
    minNights: raw.terms?.minNights ?? 3,
    bookingUrl: bookingUrlFor(raw._id),
    fromGuesty: true,
  };
}

/**
 * All active listings, from Guesty when configured, demo villas otherwise.
 * Guesty responses are revalidated hourly.
 */
export async function getListings(): Promise<CoraluxListing[]> {
  if (!isGuestyConfigured()) return DEMO_VILLAS;
  try {
    const token = await getGuestyToken();
    const fields =
      "title nickname address publicDescription.summary bedrooms bathrooms accommodates prices pictures picture amenities terms active";
    const res = await fetch(
      `${GUESTY_API}/listings?limit=50&fields=${encodeURIComponent(fields)}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`Guesty listings request failed: ${res.status}`);
    const data = (await res.json()) as { results: GuestyRawListing[] };
    const listings = data.results
      .filter((l) => l.active !== false)
      .map(normalizeListing);
    return listings.length > 0 ? listings : DEMO_VILLAS;
  } catch (err) {
    console.error("[guesty] falling back to demo villas:", err);
    return DEMO_VILLAS;
  }
}

export async function getListing(id: string): Promise<CoraluxListing | null> {
  if (!isGuestyConfigured()) {
    return DEMO_VILLAS.find((v) => v.id === id) ?? null;
  }
  try {
    const token = await getGuestyToken();
    const res = await fetch(`${GUESTY_API}/listings/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Guesty listing request failed: ${res.status}`);
    return normalizeListing((await res.json()) as GuestyRawListing);
  } catch (err) {
    console.error("[guesty] falling back to demo villa:", err);
    return DEMO_VILLAS.find((v) => v.id === id) ?? null;
  }
}

// ── Demo villas (shown until Guesty credentials are added) ───────────────────
// Photos are Unsplash stock; swap freely.
const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const DEMO_VILLAS: CoraluxListing[] = [
  {
    id: "casa-corales",
    title: "Casa Corales — Oceanfront Estate",
    area: "Malmok",
    city: "Noord",
    summary:
      "A glass-walled estate on Malmok's limestone shore, steps from Boca Catalina's snorkeling coves. Infinity pool, chef's kitchen and unbroken sunset views over the Caribbean.",
    bedrooms: 5,
    bathrooms: 5.5,
    guests: 10,
    basePrice: 1450,
    currency: "USD",
    images: [u("photo-1613490493576-7fde63acd811"), u("photo-1512917774080-9991f1c4c750"), u("photo-1600607687939-ce8a6c25118c")],
    amenities: ["Infinity pool", "Oceanfront", "Chef's kitchen", "Daily housekeeping", "EV charger", "Snorkeling gear"],
    minNights: 5,
    bookingUrl: null,
    fromGuesty: false,
  },
  {
    id: "villa-flamenco",
    title: "Villa Flamenco — Palm Beach Retreat",
    area: "Palm Beach",
    city: "Noord",
    summary:
      "Five minutes' walk from Palm Beach's white sand, this palm-shaded retreat pairs a resort-size pool with a swim-up bar, outdoor cinema and space for the whole family.",
    bedrooms: 4,
    bathrooms: 4,
    guests: 8,
    basePrice: 890,
    currency: "USD",
    images: [u("photo-1600596542815-ffad4c1539a9"), u("photo-1582268611958-ebfd161ef9cf"), u("photo-1571896349842-33c89424de2d")],
    amenities: ["Private pool", "Swim-up bar", "Outdoor cinema", "Concierge", "Walk to beach", "BBQ pavilion"],
    minNights: 4,
    bookingUrl: null,
    fromGuesty: false,
  },
  {
    id: "eagle-dunes",
    title: "Eagle Dunes — Beachfront Penthouse",
    area: "Eagle Beach",
    city: "Oranjestad",
    summary:
      "A top-floor penthouse over Aruba's most celebrated beach. Wraparound terrace, plunge pool, and the famous fofoti trees framing your morning coffee.",
    bedrooms: 3,
    bathrooms: 3,
    guests: 6,
    basePrice: 690,
    currency: "USD",
    images: [u("photo-1507525428034-b723cf961d3e"), u("photo-1520250497591-112f2f40a3f4"), u("photo-1540541338287-41700207dee6")],
    amenities: ["Beachfront", "Plunge pool", "Wraparound terrace", "Beach cabana", "Valet parking", "Gym access"],
    minNights: 3,
    bookingUrl: null,
    fromGuesty: false,
  },
  {
    id: "cas-di-solo",
    title: "Cas di Solo — Tierra del Sol Golf Villa",
    area: "Tierra del Sol",
    city: "Noord",
    summary:
      "On the fairways of Aruba's championship golf course with the California Lighthouse on the horizon. Courtyard pool, casita suite and desert-chic interiors.",
    bedrooms: 4,
    bathrooms: 4.5,
    guests: 8,
    basePrice: 780,
    currency: "USD",
    images: [u("photo-1600585154340-be6161a56a0c"), u("photo-1600566753190-17f0baa2a6c3"), u("photo-1600210492486-724fe5c67fb0")],
    amenities: ["Golf course", "Courtyard pool", "Casita suite", "Golf cart", "Housekeeping", "Ocean views"],
    minNights: 4,
    bookingUrl: null,
    fromGuesty: false,
  },
  {
    id: "savaneta-hideaway",
    title: "The Savaneta Hideaway — Private Pier",
    area: "Savaneta",
    city: "Savaneta",
    summary:
      "Old-Aruba soul on the island's quiet south shore. A restored sea captain's house with its own pier, kayaks, and bioluminescent-lagoon tours from the back garden.",
    bedrooms: 3,
    bathrooms: 2.5,
    guests: 6,
    basePrice: 520,
    currency: "USD",
    images: [u("photo-1499793983690-e29da59ef1c2"), u("photo-1544551763-46a013bb70d5"), u("photo-1505118380757-91f5f5632de0")],
    amenities: ["Private pier", "Kayaks", "Hammock garden", "Outdoor shower", "Fire pit", "Pet friendly"],
    minNights: 3,
    bookingUrl: null,
    fromGuesty: false,
  },
  {
    id: "oranjestad-loft",
    title: "Coralux Loft — Oranjestad Marina",
    area: "Oranjestad",
    city: "Oranjestad",
    summary:
      "A designer loft above the marina's pastel facades — rooftop plunge pool, curated Aruban art, and the capital's restaurants at your doorstep.",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    basePrice: 380,
    currency: "USD",
    images: [u("photo-1522708323590-d24dbb6b0267"), u("photo-1502672260266-1c1ef2d93688"), u("photo-1493809842364-78817add7ffb")],
    amenities: ["Rooftop plunge pool", "Marina views", "Designer interiors", "Walk to dining", "Smart home", "Espresso bar"],
    minNights: 2,
    bookingUrl: null,
    fromGuesty: false,
  },
];
