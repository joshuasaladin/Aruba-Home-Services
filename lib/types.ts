// Shared domain types used by both the demo (in-memory) store and Supabase.

export type Role = "customer" | "provider" | "admin";

export type BookingStatus =
  | "pending" // waiting for provider to accept
  | "accepted" // provider accepted, job scheduled
  | "declined" // provider declined
  | "completed" // provider marked job done
  | "cancelled"; // customer cancelled

/** Money flow: pending → invoiced → paid. No card processing anywhere. */
export type PaymentStatus = "pending" | "invoiced" | "paid";

export type ProviderStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  /** For provider accounts: the provider (company) they manage. */
  providerId?: string;
  createdAt: string;
}

export interface Category {
  slug: string;
  icon: string; // emoji used as a lightweight icon
  /** Estimated price range shown at booking time (final price comes on the invoice). */
  priceMinAwg: number;
  priceMaxAwg: number;
  sortOrder: number;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  categories: string[]; // category slugs
  phone: string;
  address: string;
  neighborhood: string; // Aruba district, or "Island-wide"
  website: string;
  bio: string;
  verified: boolean;
  insured: boolean;
  status: ProviderStatus; // must be "approved" to appear in the directory
  ratingAvg: number;
  reviewCount: number;
  jobsCompleted: number;
  hourlyRateAwg: number | null;
  yearsInBusiness: number | null;
  ownerUserId: string | null;
  licenseFileName: string | null; // uploaded license/insurance doc (Supabase Storage path)
  createdAt: string;
}

export interface Booking {
  id: string;
  ref: string; // human-friendly reference, e.g. AHS-2417
  customerId: string;
  providerId: string;
  categorySlug: string;
  description: string;
  neighborhood: string;
  address: string;
  /** ISO datetime, or null when the customer asked for ASAP. */
  scheduledAt: string | null;
  asap: boolean;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  finalPriceAwg: number | null; // set by the provider when marking complete
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string; // e.g. INV-2026-0007
  bookingId: string;
  providerId: string;
  customerId: string;
  amountAwg: number;
  /** Unique reference the customer must include with the bank transfer. */
  paymentReference: string;
  status: "invoiced" | "paid";
  issuedAt: string;
  paidAt: string | null;
}

export interface Review {
  id: string;
  bookingId: string | null;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  providerId: string;
}

export interface ProviderFilters {
  q?: string;
  category?: string;
  neighborhood?: string;
  minRating?: number;
  maxRate?: number; // max hourly rate in AWG
  verifiedOnly?: boolean;
  sort?: "rating" | "reviews" | "name" | "price";
}

export interface ProviderApplication {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  neighborhood: string;
  address: string;
  website: string;
  bio: string;
  hourlyRateAwg: number | null;
  licenseFileName: string | null;
}
