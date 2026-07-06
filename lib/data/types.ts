import {
  Booking,
  BookingStatus,
  Category,
  Invoice,
  Provider,
  ProviderApplication,
  ProviderFilters,
  ProviderStatus,
  Review,
  User,
} from "@/lib/types";

export interface NewBooking {
  customerId: string;
  providerId: string;
  categorySlug: string;
  description: string;
  neighborhood: string;
  address: string;
  scheduledAt: string | null;
  asap: boolean;
}

/**
 * The single data-access interface for the whole app.
 * Implemented twice: `demoService` (in-memory, zero credentials) and
 * `supabaseService` (real Postgres). `getDb()` picks the right one.
 */
export interface DataService {
  listCategories(): Promise<Category[]>;

  listProviders(filters?: ProviderFilters): Promise<Provider[]>;
  listAllProviders(): Promise<Provider[]>; // admin: includes pending/rejected
  getProviderBySlug(slug: string): Promise<Provider | null>;
  getProviderById(id: string): Promise<Provider | null>;
  applyProvider(
    app: ProviderApplication,
    ownerUserId: string | null
  ): Promise<Provider>;
  setProviderStatus(
    id: string,
    status: ProviderStatus,
    verified: boolean
  ): Promise<void>;

  listReviewsForProvider(providerId: string): Promise<Review[]>;
  createReview(input: {
    bookingId: string;
    providerId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
  }): Promise<Review>;
  hasReviewForBooking(bookingId: string): Promise<boolean>;

  createBooking(input: NewBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | null>;
  listBookingsForCustomer(userId: string): Promise<Booking[]>;
  listBookingsForProvider(providerId: string): Promise<Booking[]>;
  listAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<void>;
  /** Marks the job complete, sets the final price and generates the invoice. */
  completeBooking(id: string, finalPriceAwg: number): Promise<Invoice>;

  getInvoice(id: string): Promise<Invoice | null>;
  listInvoicesForCustomer(userId: string): Promise<Invoice[]>;
  listInvoicesForProvider(providerId: string): Promise<Invoice[]>;
  listAllInvoices(): Promise<Invoice[]>;
  setInvoicePaid(id: string, paid: boolean): Promise<void>;

  listFavoriteProviders(userId: string): Promise<Provider[]>;
  isFavorite(userId: string, providerId: string): Promise<boolean>;
  toggleFavorite(userId: string, providerId: string): Promise<boolean>;

  getUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  createUser(input: {
    email: string;
    name: string;
    role: User["role"];
  }): Promise<User>;
}
