// Real-backend implementation of the data service, used when Supabase env vars
// are set. All calls run server-side. Uses the service-role key when available
// (recommended for server actions); falls back to the anon key + RLS.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

let cached: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    cached = createClient(url, key, { auth: { persistSession: false } });
  }
  return cached;
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`[supabase:${context}] ${error?.message ?? "unknown error"}`);
}

// ---- row mappers (snake_case DB → camelCase app types) ----

function mapCategory(r: Record<string, unknown>): Category {
  return {
    slug: r.slug as string,
    icon: r.icon as string,
    priceMinAwg: Number(r.price_min_awg),
    priceMaxAwg: Number(r.price_max_awg),
    sortOrder: Number(r.sort_order),
  };
}

function mapProvider(r: Record<string, unknown>): Provider {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    categories: (r.categories as string[]) ?? [],
    phone: (r.phone as string) ?? "",
    address: (r.address as string) ?? "",
    neighborhood: (r.neighborhood as string) ?? "Island-wide",
    website: (r.website as string) ?? "",
    bio: (r.bio as string) ?? "",
    verified: Boolean(r.verified),
    insured: Boolean(r.insured),
    status: r.status as ProviderStatus,
    ratingAvg: Number(r.rating_avg ?? 0),
    reviewCount: Number(r.review_count ?? 0),
    jobsCompleted: Number(r.jobs_completed ?? 0),
    hourlyRateAwg: r.hourly_rate_awg === null ? null : Number(r.hourly_rate_awg),
    yearsInBusiness:
      r.years_in_business === null ? null : Number(r.years_in_business),
    ownerUserId: (r.owner_user_id as string) ?? null,
    licenseFileName: (r.license_file_name as string) ?? null,
    createdAt: r.created_at as string,
  };
}

function mapBooking(r: Record<string, unknown>): Booking {
  return {
    id: r.id as string,
    ref: r.ref as string,
    customerId: r.customer_id as string,
    providerId: r.provider_id as string,
    categorySlug: r.category_slug as string,
    description: (r.description as string) ?? "",
    neighborhood: (r.neighborhood as string) ?? "",
    address: (r.address as string) ?? "",
    scheduledAt: (r.scheduled_at as string) ?? null,
    asap: Boolean(r.asap),
    status: r.status as BookingStatus,
    paymentStatus: r.payment_status as Booking["paymentStatus"],
    finalPriceAwg: r.final_price_awg === null ? null : Number(r.final_price_awg),
    createdAt: r.created_at as string,
  };
}

function mapInvoice(r: Record<string, unknown>): Invoice {
  return {
    id: r.id as string,
    number: r.number as string,
    bookingId: r.booking_id as string,
    providerId: r.provider_id as string,
    customerId: r.customer_id as string,
    amountAwg: Number(r.amount_awg),
    paymentReference: r.payment_reference as string,
    status: r.status as Invoice["status"],
    issuedAt: r.issued_at as string,
    paidAt: (r.paid_at as string) ?? null,
  };
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    bookingId: (r.booking_id as string) ?? null,
    providerId: r.provider_id as string,
    customerId: r.customer_id as string,
    customerName: (r.customer_name as string) ?? "Customer",
    rating: Number(r.rating),
    comment: (r.comment as string) ?? "",
    createdAt: r.created_at as string,
  };
}

function mapUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    email: r.email as string,
    name: (r.name as string) ?? "",
    role: r.role as User["role"],
    phone: (r.phone as string) ?? undefined,
    providerId: (r.provider_id as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function makePaymentReference(bookingRef: string): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++)
    suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${bookingRef}-${suffix}`;
}

export const supabaseService: DataService = {
  async listCategories() {
    const { data, error } = await db()
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) fail("listCategories", error);
    return (data ?? []).map(mapCategory);
  },

  async listProviders(filters: ProviderFilters = {}) {
    let q = db().from("providers").select("*").eq("status", "approved");
    if (filters.category) q = q.contains("categories", [filters.category]);
    if (filters.neighborhood && filters.neighborhood !== "Island-wide")
      q = q.in("neighborhood", [filters.neighborhood, "Island-wide"]);
    if (filters.minRating) q = q.gte("rating_avg", filters.minRating);
    if (filters.maxRate) q = q.lte("hourly_rate_awg", filters.maxRate);
    if (filters.verifiedOnly) q = q.eq("verified", true);
    if (filters.q) q = q.or(`name.ilike.%${filters.q}%,bio.ilike.%${filters.q}%`);
    switch (filters.sort) {
      case "reviews":
        q = q.order("review_count", { ascending: false });
        break;
      case "name":
        q = q.order("name");
        break;
      case "price":
        q = q.order("hourly_rate_awg", { ascending: true, nullsFirst: false });
        break;
      default:
        q = q
          .order("rating_avg", { ascending: false })
          .order("review_count", { ascending: false });
    }
    const { data, error } = await q;
    if (error) fail("listProviders", error);
    return (data ?? []).map(mapProvider);
  },

  async listAllProviders() {
    const { data, error } = await db()
      .from("providers")
      .select("*")
      .order("status")
      .order("name");
    if (error) fail("listAllProviders", error);
    return (data ?? []).map(mapProvider);
  },

  async getProviderBySlug(slug) {
    const { data } = await db()
      .from("providers")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? mapProvider(data) : null;
  },

  async getProviderById(id) {
    const { data } = await db()
      .from("providers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapProvider(data) : null;
  },

  async applyProvider(app: ProviderApplication, ownerUserId: string | null) {
    const slug =
      app.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 6);
    const { data, error } = await db()
      .from("providers")
      .insert({
        slug,
        name: app.companyName,
        categories: app.categories,
        phone: app.phone,
        address: app.address,
        neighborhood: app.neighborhood,
        website: app.website,
        bio: app.bio,
        hourly_rate_awg: app.hourlyRateAwg,
        owner_user_id: ownerUserId,
        license_file_name: app.licenseFileName,
        verified: false,
        insured: false,
        status: "pending",
      })
      .select()
      .single();
    if (error) fail("applyProvider", error);
    if (ownerUserId) {
      await db()
        .from("profiles")
        .update({ provider_id: data.id, role: "provider" })
        .eq("id", ownerUserId)
        .is("provider_id", null);
    }
    return mapProvider(data);
  },

  async setProviderStatus(id, status, verified) {
    const { error } = await db()
      .from("providers")
      .update({ status, verified })
      .eq("id", id);
    if (error) fail("setProviderStatus", error);
  },

  async listReviewsForProvider(providerId) {
    const { data, error } = await db()
      .from("reviews")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });
    if (error) fail("listReviewsForProvider", error);
    return (data ?? []).map(mapReview);
  },

  async createReview(input) {
    const { data, error } = await db()
      .from("reviews")
      .insert({
        booking_id: input.bookingId,
        provider_id: input.providerId,
        customer_id: input.customerId,
        customer_name: input.customerName,
        rating: input.rating,
        comment: input.comment,
      })
      .select()
      .single();
    if (error) fail("createReview", error);
    // Recompute provider aggregates.
    const { data: agg } = await db()
      .from("reviews")
      .select("rating")
      .eq("provider_id", input.providerId);
    if (agg && agg.length > 0) {
      const avg =
        Math.round(
          (agg.reduce((s, r) => s + Number(r.rating), 0) / agg.length) * 10
        ) / 10;
      await db()
        .from("providers")
        .update({ rating_avg: avg, review_count: agg.length })
        .eq("id", input.providerId);
    }
    return mapReview(data);
  },

  async hasReviewForBooking(bookingId) {
    const { count } = await db()
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", bookingId);
    return (count ?? 0) > 0;
  },

  async createBooking(input: NewBooking) {
    const { data, error } = await db()
      .from("bookings")
      .insert({
        customer_id: input.customerId,
        provider_id: input.providerId,
        category_slug: input.categorySlug,
        description: input.description,
        neighborhood: input.neighborhood,
        address: input.address,
        scheduled_at: input.scheduledAt,
        asap: input.asap,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();
    if (error) fail("createBooking", error);
    return mapBooking(data);
  },

  async getBooking(id) {
    const { data } = await db()
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapBooking(data) : null;
  },

  async listBookingsForCustomer(userId) {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) fail("listBookingsForCustomer", error);
    return (data ?? []).map(mapBooking);
  },

  async listBookingsForProvider(providerId) {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });
    if (error) fail("listBookingsForProvider", error);
    return (data ?? []).map(mapBooking);
  },

  async listAllBookings() {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) fail("listAllBookings", error);
    return (data ?? []).map(mapBooking);
  },

  async updateBookingStatus(id, status) {
    const { error } = await db()
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (error) fail("updateBookingStatus", error);
  },

  async completeBooking(id, finalPriceAwg) {
    const booking = await this.getBooking(id);
    if (!booking) throw new Error("Booking not found");
    const { error: bErr } = await db()
      .from("bookings")
      .update({
        status: "completed",
        payment_status: "invoiced",
        final_price_awg: finalPriceAwg,
      })
      .eq("id", id);
    if (bErr) fail("completeBooking", bErr);
    const { data, error } = await db()
      .from("invoices")
      .insert({
        booking_id: booking.id,
        provider_id: booking.providerId,
        customer_id: booking.customerId,
        amount_awg: finalPriceAwg,
        payment_reference: makePaymentReference(booking.ref),
        status: "invoiced",
      })
      .select()
      .single();
    if (error) fail("completeBooking:invoice", error);
    await db().rpc("increment_jobs_completed", {
      p_provider_id: booking.providerId,
    });
    return mapInvoice(data);
  },

  async getInvoice(id) {
    const { data } = await db()
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapInvoice(data) : null;
  },

  async listInvoicesForCustomer(userId) {
    const { data, error } = await db()
      .from("invoices")
      .select("*")
      .eq("customer_id", userId)
      .order("issued_at", { ascending: false });
    if (error) fail("listInvoicesForCustomer", error);
    return (data ?? []).map(mapInvoice);
  },

  async listInvoicesForProvider(providerId) {
    const { data, error } = await db()
      .from("invoices")
      .select("*")
      .eq("provider_id", providerId)
      .order("issued_at", { ascending: false });
    if (error) fail("listInvoicesForProvider", error);
    return (data ?? []).map(mapInvoice);
  },

  async listAllInvoices() {
    const { data, error } = await db()
      .from("invoices")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) fail("listAllInvoices", error);
    return (data ?? []).map(mapInvoice);
  },

  async setInvoicePaid(id, paid) {
    const inv = await this.getInvoice(id);
    if (!inv) return;
    const { error } = await db()
      .from("invoices")
      .update({
        status: paid ? "paid" : "invoiced",
        paid_at: paid ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) fail("setInvoicePaid", error);
    await db()
      .from("bookings")
      .update({ payment_status: paid ? "paid" : "invoiced" })
      .eq("id", inv.bookingId);
  },

  async listFavoriteProviders(userId) {
    const { data, error } = await db()
      .from("favorites")
      .select("provider_id, providers(*)")
      .eq("user_id", userId);
    if (error) fail("listFavoriteProviders", error);
    return (data ?? [])
      .map((r) => r.providers as unknown as Record<string, unknown>)
      .filter(Boolean)
      .map(mapProvider);
  },

  async isFavorite(userId, providerId) {
    const { count } = await db()
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("provider_id", providerId);
    return (count ?? 0) > 0;
  },

  async toggleFavorite(userId, providerId) {
    if (await this.isFavorite(userId, providerId)) {
      await db()
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("provider_id", providerId);
      return false;
    }
    await db()
      .from("favorites")
      .insert({ user_id: userId, provider_id: providerId });
    return true;
  },

  async getUserById(id) {
    const { data } = await db()
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapUser(data) : null;
  },

  async findUserByEmail(email) {
    const { data } = await db()
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    return data ? mapUser(data) : null;
  },

  async createUser(input) {
    const { data, error } = await db()
      .from("profiles")
      .insert({ email: input.email, name: input.name, role: input.role })
      .select()
      .single();
    if (error) fail("createUser", error);
    return mapUser(data);
  },
};
