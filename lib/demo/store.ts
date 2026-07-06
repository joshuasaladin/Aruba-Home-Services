// Demo-mode data store. Used automatically when Supabase env vars are absent so the
// whole app runs and is clickable with zero credentials. Data lives in memory (module
// singleton, survives HMR via globalThis) and resets when the dev server restarts.

import seedJson from "@/data/aruba-providers-seed.json";
import {
  Booking,
  Category,
  Favorite,
  Invoice,
  Provider,
  Review,
  User,
} from "@/lib/types";

export interface DemoDB {
  users: User[];
  categories: Category[];
  providers: Provider[];
  bookings: Booking[];
  invoices: Invoice[];
  reviews: Review[];
  favorites: Favorite[];
  counters: { booking: number; invoice: number };
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-randomness so the demo looks alive but stays stable.
// ---------------------------------------------------------------------------
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const KNOWN_NEIGHBORHOODS = [
  "Oranjestad",
  "Noord",
  "Palm Beach",
  "Eagle Beach",
  "San Nicolas",
  "Santa Cruz",
  "Paradera",
  "Savaneta",
];

function neighborhoodFromAddress(address: string): string {
  for (const n of KNOWN_NEIGHBORHOODS) {
    if (address.toLowerCase().includes(n.toLowerCase())) return n;
  }
  return "Island-wide";
}

export const CATEGORY_DEFS: Category[] = [
  { slug: "electrician", icon: "⚡", priceMinAwg: 90, priceMaxAwg: 450, sortOrder: 1 },
  { slug: "plumber", icon: "🔧", priceMinAwg: 80, priceMaxAwg: 400, sortOrder: 2 },
  { slug: "ac_repair", icon: "❄️", priceMinAwg: 120, priceMaxAwg: 900, sortOrder: 3 },
  { slug: "pool_cleaning", icon: "🏊", priceMinAwg: 100, priceMaxAwg: 350, sortOrder: 4 },
  { slug: "landscaping", icon: "🌴", priceMinAwg: 90, priceMaxAwg: 600, sortOrder: 5 },
  { slug: "house_cleaning", icon: "🧹", priceMinAwg: 70, priceMaxAwg: 300, sortOrder: 6 },
  { slug: "pest_control", icon: "🐜", priceMinAwg: 110, priceMaxAwg: 500, sortOrder: 7 },
  { slug: "handyman", icon: "🛠️", priceMinAwg: 60, priceMaxAwg: 350, sortOrder: 8 },
  { slug: "appliance_repair", icon: "🧊", priceMinAwg: 90, priceMaxAwg: 450, sortOrder: 9 },
  { slug: "moving", icon: "🚚", priceMinAwg: 150, priceMaxAwg: 1200, sortOrder: 10 },
];

const SAMPLE_REVIEWS: [string, number, string][] = [
  ["Maria G.", 5, "Showed up on time, fixed everything the same day. Highly recommend!"],
  ["Kevin d. C.", 4, "Good work and fair price. Communication could be a bit faster."],
  ["Shanella W.", 5, "Very professional team, left everything spotless."],
  ["Roberto F.", 4, "Solid job. Booked again for regular maintenance."],
  ["Anouk V.", 5, "Friendly, honest and the invoice matched the estimate."],
  ["Jean-Carlo M.", 3, "Job got done well but they rescheduled once."],
  ["Lisa B.", 5, "Best on the island. They know what they're doing."],
  ["Miguel S.", 4, "Quick response for an emergency call-out. Grateful!"],
];

const DEMO_USERS: User[] = [
  {
    id: "user-demo-customer",
    email: "customer@demo.aw",
    name: "Dani Croes",
    role: "customer",
    phone: "+297 660-1234",
    createdAt: "2026-05-01T12:00:00.000Z",
  },
  {
    id: "user-demo-provider",
    email: "provider@demo.aw",
    name: "Lucky Electricals (Owner)",
    role: "provider",
    phone: "+297 582-6811",
    providerId: "", // linked after providers are built (Lucky Electricals)
    createdAt: "2026-05-01T12:00:00.000Z",
  },
  {
    id: "user-demo-admin",
    email: "admin@demo.aw",
    name: "AHS Admin",
    role: "admin",
    createdAt: "2026-05-01T12:00:00.000Z",
  },
  {
    id: "user-demo-customer2",
    email: "customer2@demo.aw",
    name: "Ruthline Tromp",
    role: "customer",
    createdAt: "2026-05-10T12:00:00.000Z",
  },
];

function buildProviders(): Provider[] {
  const seen = new Set<string>();
  return (seedJson.providers as {
    name: string;
    category: string[];
    phone: string;
    address: string;
    website: string;
    notes?: string;
    verified: boolean;
  }[]).map((p, idx) => {
    let slug = slugify(p.name);
    while (seen.has(slug)) slug = `${slug}-${idx}`;
    seen.add(slug);
    const h = hash(p.name);
    // Deterministic sample stats so the directory looks real in the demo.
    const reviewCount = (h % 40) + 3;
    const ratingAvg = Math.round((3.8 + ((h >> 3) % 12) / 10) * 10) / 10; // 3.8–4.9
    const jobsCompleted = reviewCount * 3 + ((h >> 5) % 25);
    const hourlyRateAwg = 50 + ((h >> 7) % 12) * 10; // Afl. 50–160
    const yearsMatch = p.notes?.match(/(\d+)\+? years/i);
    return {
      id: `prov-${slug}`,
      slug,
      name: p.name,
      categories: p.category,
      phone: p.phone || "",
      address: p.address || "Aruba",
      neighborhood: neighborhoodFromAddress(p.address || ""),
      website: p.website || "",
      bio:
        p.notes ||
        `${p.name} serves homes and businesses across Aruba. Contact details are being verified — book through Aruba Home Services and we'll coordinate the job.`,
      verified: p.verified,
      insured: h % 3 !== 0,
      status: "approved",
      ratingAvg,
      reviewCount,
      jobsCompleted,
      hourlyRateAwg,
      yearsInBusiness: yearsMatch ? parseInt(yearsMatch[1], 10) : null,
      ownerUserId: null,
      licenseFileName: null,
      createdAt: "2026-06-01T12:00:00.000Z",
    };
  });
}

function buildReviews(providers: Provider[]): Review[] {
  const reviews: Review[] = [];
  for (const p of providers) {
    const h = hash(p.id);
    const count = Math.min(3, (h % 3) + 1);
    for (let i = 0; i < count; i++) {
      const [customerName, rating, comment] =
        SAMPLE_REVIEWS[(h + i * 7) % SAMPLE_REVIEWS.length];
      reviews.push({
        id: `rev-${p.slug}-${i}`,
        bookingId: null,
        providerId: p.id,
        customerId: "user-sample",
        customerName,
        rating,
        comment,
        createdAt: new Date(
          Date.UTC(2026, 3 + (i % 3), ((h >> (i + 2)) % 27) + 1, 14)
        ).toISOString(),
      });
    }
  }
  return reviews;
}

function daysFromNow(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildSampleActivity(providers: Provider[]): {
  bookings: Booking[];
  invoices: Invoice[];
} {
  const lucky = providers.find((p) => p.slug === "lucky-electricals")!;
  const plumber = providers.find((p) => p.categories.includes("plumber"))!;
  const cleaner = providers.find((p) =>
    p.categories.includes("house_cleaning")
  )!;
  const ac = providers.find((p) => p.categories.includes("ac_repair"))!;

  const bookings: Booking[] = [
    {
      id: "bk-demo-1",
      ref: "AHS-1024",
      customerId: "user-demo-customer",
      providerId: lucky.id,
      categorySlug: "electrician",
      description:
        "Two outlets in the kitchen stopped working and the breaker trips when we use the microwave.",
      neighborhood: "Noord",
      address: "Tanki Leendert 145-A",
      scheduledAt: daysFromNow(2, 10),
      asap: false,
      status: "pending",
      paymentStatus: "pending",
      finalPriceAwg: null,
      createdAt: daysFromNow(-1, 16),
    },
    {
      id: "bk-demo-2",
      ref: "AHS-1019",
      customerId: "user-demo-customer",
      providerId: ac.id,
      categorySlug: "ac_repair",
      description: "Annual maintenance for 3 split units in a Palm Beach condo.",
      neighborhood: "Palm Beach",
      address: "L.G. Smith Blvd 240, apt 6",
      scheduledAt: daysFromNow(5, 13),
      asap: false,
      status: "accepted",
      paymentStatus: "pending",
      finalPriceAwg: null,
      createdAt: daysFromNow(-3, 11),
    },
    {
      id: "bk-demo-3",
      ref: "AHS-0991",
      customerId: "user-demo-customer",
      providerId: cleaner.id,
      categorySlug: "house_cleaning",
      description: "Deep clean after renovation — 3 bedrooms, 2 bathrooms.",
      neighborhood: "Oranjestad",
      address: "Wilhelminastraat 88",
      scheduledAt: daysFromNow(-6, 9),
      asap: false,
      status: "completed",
      paymentStatus: "invoiced",
      finalPriceAwg: 285,
      createdAt: daysFromNow(-9, 10),
    },
    {
      id: "bk-demo-4",
      ref: "AHS-0968",
      customerId: "user-demo-customer",
      providerId: plumber.id,
      categorySlug: "plumber",
      description: "Replace leaking water heater connection.",
      neighborhood: "Santa Cruz",
      address: "Santa Cruz 52",
      scheduledAt: daysFromNow(-20, 8),
      asap: false,
      status: "completed",
      paymentStatus: "paid",
      finalPriceAwg: 190,
      createdAt: daysFromNow(-23, 15),
    },
    {
      id: "bk-demo-5",
      ref: "AHS-1027",
      customerId: "user-demo-customer2",
      providerId: lucky.id,
      categorySlug: "electrician",
      description: "Install 4 outdoor lights around the porch, ASAP if possible.",
      neighborhood: "Paradera",
      address: "Paradera 21-B",
      scheduledAt: null,
      asap: true,
      status: "pending",
      paymentStatus: "pending",
      finalPriceAwg: null,
      createdAt: daysFromNow(0, 8),
    },
    {
      id: "bk-demo-6",
      ref: "AHS-0975",
      customerId: "user-demo-customer2",
      providerId: lucky.id,
      categorySlug: "electrician",
      description: "Upgrade fuse box for a home extension.",
      neighborhood: "Savaneta",
      address: "Savaneta 337",
      scheduledAt: daysFromNow(-14, 9),
      asap: false,
      status: "completed",
      paymentStatus: "paid",
      finalPriceAwg: 640,
      createdAt: daysFromNow(-18, 12),
    },
  ];

  const invoices: Invoice[] = [
    {
      id: "inv-demo-1",
      number: "INV-2026-0031",
      bookingId: "bk-demo-3",
      providerId: cleaner.id,
      customerId: "user-demo-customer",
      amountAwg: 285,
      paymentReference: "AHS-0991-K7Q2",
      status: "invoiced",
      issuedAt: daysFromNow(-5, 17),
      paidAt: null,
    },
    {
      id: "inv-demo-2",
      number: "INV-2026-0024",
      bookingId: "bk-demo-4",
      providerId: plumber.id,
      customerId: "user-demo-customer",
      amountAwg: 190,
      paymentReference: "AHS-0968-M3T8",
      status: "paid",
      issuedAt: daysFromNow(-19, 12),
      paidAt: daysFromNow(-16, 10),
    },
    {
      id: "inv-demo-3",
      number: "INV-2026-0022",
      bookingId: "bk-demo-6",
      providerId: lucky.id,
      customerId: "user-demo-customer2",
      amountAwg: 640,
      paymentReference: "AHS-0975-P9X4",
      status: "paid",
      issuedAt: daysFromNow(-13, 12),
      paidAt: daysFromNow(-11, 9),
    },
  ];

  return { bookings, invoices };
}

function buildDB(): DemoDB {
  const providers = buildProviders();
  const users = DEMO_USERS.map((u) => ({ ...u }));
  const lucky = providers.find((p) => p.slug === "lucky-electricals");
  if (lucky) {
    users.find((u) => u.id === "user-demo-provider")!.providerId = lucky.id;
    lucky.ownerUserId = "user-demo-provider";
    lucky.verified = true; // the demo provider account looks fully onboarded
  }
  const { bookings, invoices } = buildSampleActivity(providers);
  return {
    users,
    categories: CATEGORY_DEFS.map((c) => ({ ...c })),
    providers,
    bookings,
    invoices,
    reviews: buildReviews(providers),
    favorites: [
      { userId: "user-demo-customer", providerId: providers[0].id },
      {
        userId: "user-demo-customer",
        providerId:
          providers.find((p) => p.categories.includes("pool_cleaning"))?.id ??
          providers[1].id,
      },
    ],
    counters: { booking: 1028, invoice: 32 },
  };
}

// Persist across Next.js dev HMR reloads.
const globalStore = globalThis as unknown as { __ahsDemoDb?: DemoDB };

export function getDemoDB(): DemoDB {
  if (!globalStore.__ahsDemoDb) {
    globalStore.__ahsDemoDb = buildDB();
  }
  return globalStore.__ahsDemoDb;
}

export function nextBookingRef(db: DemoDB): string {
  db.counters.booking += 1;
  return `AHS-${db.counters.booking}`;
}

export function nextInvoiceNumber(db: DemoDB): string {
  db.counters.invoice += 1;
  return `INV-2026-${String(db.counters.invoice).padStart(4, "0")}`;
}

export function makePaymentReference(bookingRef: string): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${bookingRef}-${suffix}`;
}
