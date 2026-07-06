// Demo-mode implementation of the data service (in-memory, seeded from JSON).
import {
  getDemoDB,
  makePaymentReference,
  nextBookingRef,
  nextInvoiceNumber,
} from "@/lib/demo/store";
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
import type { DataService, NewBooking } from "./types";

function applyFilters(providers: Provider[], f: ProviderFilters): Provider[] {
  let list = providers.filter((p) => p.status === "approved");
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.categories.some((c) => c.replace(/_/g, " ").includes(q))
    );
  }
  if (f.category) list = list.filter((p) => p.categories.includes(f.category!));
  if (f.neighborhood && f.neighborhood !== "Island-wide") {
    list = list.filter(
      (p) =>
        p.neighborhood === f.neighborhood || p.neighborhood === "Island-wide"
    );
  }
  if (f.minRating) list = list.filter((p) => p.ratingAvg >= f.minRating!);
  if (f.maxRate)
    list = list.filter(
      (p) => p.hourlyRateAwg !== null && p.hourlyRateAwg <= f.maxRate!
    );
  if (f.verifiedOnly) list = list.filter((p) => p.verified);

  switch (f.sort) {
    case "reviews":
      list.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price":
      list.sort(
        (a, b) => (a.hourlyRateAwg ?? 9999) - (b.hourlyRateAwg ?? 9999)
      );
      break;
    default:
      list.sort(
        (a, b) => b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount
      );
  }
  return list;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const demoService: DataService = {
  async listCategories(): Promise<Category[]> {
    return [...getDemoDB().categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async listProviders(filters: ProviderFilters = {}): Promise<Provider[]> {
    return applyFilters([...getDemoDB().providers], filters);
  },

  async listAllProviders(): Promise<Provider[]> {
    return [...getDemoDB().providers].sort((a, b) =>
      a.status === b.status ? a.name.localeCompare(b.name) : a.status === "pending" ? -1 : 1
    );
  },

  async getProviderBySlug(slug: string): Promise<Provider | null> {
    return getDemoDB().providers.find((p) => p.slug === slug) ?? null;
  },

  async getProviderById(id: string): Promise<Provider | null> {
    return getDemoDB().providers.find((p) => p.id === id) ?? null;
  },

  async listReviewsForProvider(providerId: string): Promise<Review[]> {
    return getDemoDB()
      .reviews.filter((r) => r.providerId === providerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createBooking(input: NewBooking): Promise<Booking> {
    const db = getDemoDB();
    const booking: Booking = {
      id: `bk-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      ref: nextBookingRef(db),
      customerId: input.customerId,
      providerId: input.providerId,
      categorySlug: input.categorySlug,
      description: input.description,
      neighborhood: input.neighborhood,
      address: input.address,
      scheduledAt: input.scheduledAt,
      asap: input.asap,
      status: "pending",
      paymentStatus: "pending",
      finalPriceAwg: null,
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(booking);
    return booking;
  },

  async getBooking(id: string): Promise<Booking | null> {
    return getDemoDB().bookings.find((b) => b.id === id) ?? null;
  },

  async listBookingsForCustomer(userId: string): Promise<Booking[]> {
    return getDemoDB()
      .bookings.filter((b) => b.customerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listBookingsForProvider(providerId: string): Promise<Booking[]> {
    return getDemoDB()
      .bookings.filter((b) => b.providerId === providerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listAllBookings(): Promise<Booking[]> {
    return [...getDemoDB().bookings].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    const b = getDemoDB().bookings.find((b) => b.id === id);
    if (b) b.status = status;
  },

  async completeBooking(id: string, finalPriceAwg: number): Promise<Invoice> {
    const db = getDemoDB();
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found");
    booking.status = "completed";
    booking.paymentStatus = "invoiced";
    booking.finalPriceAwg = finalPriceAwg;
    const provider = db.providers.find((p) => p.id === booking.providerId);
    if (provider) provider.jobsCompleted += 1;
    const invoice: Invoice = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      number: nextInvoiceNumber(db),
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId: booking.customerId,
      amountAwg: finalPriceAwg,
      paymentReference: makePaymentReference(booking.ref),
      status: "invoiced",
      issuedAt: new Date().toISOString(),
      paidAt: null,
    };
    db.invoices.unshift(invoice);
    return invoice;
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    return getDemoDB().invoices.find((i) => i.id === id) ?? null;
  },

  async listInvoicesForCustomer(userId: string): Promise<Invoice[]> {
    return getDemoDB()
      .invoices.filter((i) => i.customerId === userId)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  },

  async listInvoicesForProvider(providerId: string): Promise<Invoice[]> {
    return getDemoDB()
      .invoices.filter((i) => i.providerId === providerId)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  },

  async listAllInvoices(): Promise<Invoice[]> {
    return [...getDemoDB().invoices].sort((a, b) =>
      b.issuedAt.localeCompare(a.issuedAt)
    );
  },

  async setInvoicePaid(id: string, paid: boolean): Promise<void> {
    const db = getDemoDB();
    const inv = db.invoices.find((i) => i.id === id);
    if (!inv) return;
    inv.status = paid ? "paid" : "invoiced";
    inv.paidAt = paid ? new Date().toISOString() : null;
    const booking = db.bookings.find((b) => b.id === inv.bookingId);
    if (booking) booking.paymentStatus = paid ? "paid" : "invoiced";
  },

  async createReview(input: {
    bookingId: string;
    providerId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const db = getDemoDB();
    const review: Review = {
      id: `rev-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(review);
    const provider = db.providers.find((p) => p.id === input.providerId);
    if (provider) {
      const all = db.reviews.filter((r) => r.providerId === provider.id);
      provider.reviewCount = all.length;
      provider.ratingAvg =
        Math.round(
          (all.reduce((s, r) => s + r.rating, 0) / all.length) * 10
        ) / 10;
    }
    return review;
  },

  async hasReviewForBooking(bookingId: string): Promise<boolean> {
    return getDemoDB().reviews.some((r) => r.bookingId === bookingId);
  },

  async listFavoriteProviders(userId: string): Promise<Provider[]> {
    const db = getDemoDB();
    const ids = db.favorites
      .filter((f) => f.userId === userId)
      .map((f) => f.providerId);
    return db.providers.filter((p) => ids.includes(p.id));
  },

  async isFavorite(userId: string, providerId: string): Promise<boolean> {
    return getDemoDB().favorites.some(
      (f) => f.userId === userId && f.providerId === providerId
    );
  },

  async toggleFavorite(userId: string, providerId: string): Promise<boolean> {
    const db = getDemoDB();
    const idx = db.favorites.findIndex(
      (f) => f.userId === userId && f.providerId === providerId
    );
    if (idx >= 0) {
      db.favorites.splice(idx, 1);
      return false;
    }
    db.favorites.push({ userId, providerId });
    return true;
  },

  async applyProvider(
    app: ProviderApplication,
    ownerUserId: string | null
  ): Promise<Provider> {
    const db = getDemoDB();
    let slug = slugify(app.companyName) || `provider-${Date.now()}`;
    while (db.providers.some((p) => p.slug === slug)) slug = `${slug}-1`;
    const provider: Provider = {
      id: `prov-${slug}`,
      slug,
      name: app.companyName,
      categories: app.categories,
      phone: app.phone,
      address: app.address,
      neighborhood: app.neighborhood,
      website: app.website,
      bio: app.bio,
      verified: false,
      insured: false,
      status: "pending",
      ratingAvg: 0,
      reviewCount: 0,
      jobsCompleted: 0,
      hourlyRateAwg: app.hourlyRateAwg,
      yearsInBusiness: null,
      ownerUserId,
      licenseFileName: app.licenseFileName,
      createdAt: new Date().toISOString(),
    };
    db.providers.push(provider);
    if (ownerUserId) {
      const user = db.users.find((u) => u.id === ownerUserId);
      if (user && !user.providerId) {
        user.providerId = provider.id;
        user.role = "provider";
      }
    }
    return provider;
  },

  async setProviderStatus(
    id: string,
    status: ProviderStatus,
    verified: boolean
  ): Promise<void> {
    const p = getDemoDB().providers.find((p) => p.id === id);
    if (p) {
      p.status = status;
      p.verified = verified;
    }
  },

  // --- users (demo auth) ---
  async getUserById(id: string): Promise<User | null> {
    return getDemoDB().users.find((u) => u.id === id) ?? null;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    return (
      getDemoDB().users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      ) ?? null
    );
  },

  async createUser(input: {
    email: string;
    name: string;
    role: User["role"];
  }): Promise<User> {
    const db = getDemoDB();
    const existing = await this.findUserByEmail(input.email);
    if (existing) return existing;
    const user: User = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      email: input.email,
      name: input.name,
      role: input.role,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  },
};
