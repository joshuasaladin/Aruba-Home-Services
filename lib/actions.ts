"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_SESSION_COOKIE, getCurrentUser, requireRole, requireUser } from "@/lib/auth";
import { isSupabaseConfigured, NEIGHBORHOODS } from "@/lib/config";
import { getDb } from "@/lib/data";
import {
  sendBookingConfirmation,
  sendInvoiceEmail,
  sendProviderNewJobEmail,
} from "@/lib/email";
import { LOCALES, Locale } from "@/lib/i18n/dictionaries";
import { Role } from "@/lib/types";

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------
export async function setLocaleAction(locale: string, path: string) {
  const store = await cookies();
  if (LOCALES.includes(locale as Locale)) {
    store.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath(path.startsWith("/") ? path : "/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
async function setDemoSession(userId: string) {
  const store = await cookies();
  store.set(DEMO_SESSION_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** One-click demo login as customer / provider / admin (demo mode only). */
export async function demoLoginAction(role: Role, next?: string) {
  if (isSupabaseConfigured()) redirect("/login");
  const email =
    role === "admin"
      ? "admin@demo.aw"
      : role === "provider"
        ? "provider@demo.aw"
        : "customer@demo.aw";
  const user = await getDb().findUserByEmail(email);
  if (user) await setDemoSession(user.id);
  redirect(next || (role === "admin" ? "/admin" : role === "provider" ? "/pro" : "/dashboard"));
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  if (!email) return { error: "Enter your email address." };

  if (!isSupabaseConfigured()) {
    // Demo mode: any email logs in; unknown emails become a new customer account.
    let user = await getDb().findUserByEmail(email);
    if (!user) {
      user = await getDb().createUser({
        email,
        name: email.split("@")[0],
        role: "customer",
      });
    }
    await setDemoSession(user.id);
    redirect(next || (user.role === "admin" ? "/admin" : user.role === "provider" ? "/pro" : "/dashboard"));
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect(next || "/dashboard");
}

export async function signupAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const role = (String(formData.get("role") || "customer") === "provider"
    ? "provider"
    : "customer") as Role;
  const next = String(formData.get("next") || "");

  if (!email || !name) return { error: "Name and email are required." };

  if (!isSupabaseConfigured()) {
    const user = await getDb().createUser({ email, name, role });
    await setDemoSession(user.id);
    redirect(
      next || (role === "provider" ? "/pro/onboarding" : "/dashboard")
    );
  }

  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });
  if (error) return { error: error.message };
  redirect(next || (role === "provider" ? "/pro/onboarding" : "/dashboard"));
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } else {
    const store = await cookies();
    store.delete(DEMO_SESSION_COOKIE);
  }
  redirect("/");
}

// ---------------------------------------------------------------------------
// Booking flow
// ---------------------------------------------------------------------------
export async function createBookingAction(input: {
  providerId: string;
  categorySlug: string;
  description: string;
  neighborhood: string;
  address: string;
  scheduledAt: string | null;
  asap: boolean;
}): Promise<{ ok: true; bookingId: string; ref: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth" };

  const db = getDb();
  const provider = await db.getProviderById(input.providerId);
  if (!provider || provider.status !== "approved")
    return { ok: false, error: "Provider unavailable" };
  if (!input.description.trim())
    return { ok: false, error: "Please describe the job." };

  const neighborhood = (NEIGHBORHOODS as readonly string[]).includes(
    input.neighborhood
  )
    ? input.neighborhood
    : "Island-wide";

  const booking = await db.createBooking({
    customerId: user.id,
    providerId: provider.id,
    categorySlug: input.categorySlug,
    description: input.description.trim(),
    neighborhood,
    address: input.address.trim(),
    scheduledAt: input.asap ? null : input.scheduledAt,
    asap: input.asap,
  });

  await sendBookingConfirmation(user, booking, provider);
  const owner = provider.ownerUserId
    ? await db.getUserById(provider.ownerUserId)
    : null;
  await sendProviderNewJobEmail(
    owner?.email || "provider@demo.aw",
    booking,
    provider
  );

  revalidatePath("/dashboard");
  revalidatePath("/pro");
  return { ok: true, bookingId: booking.id, ref: booking.ref };
}

export async function cancelBookingAction(bookingId: string) {
  const user = await requireUser();
  const db = getDb();
  const booking = await db.getBooking(bookingId);
  if (!booking) return;
  if (booking.customerId !== user.id && user.role !== "admin") return;
  if (booking.status === "pending" || booking.status === "accepted") {
    await db.updateBookingStatus(bookingId, "cancelled");
  }
  revalidatePath("/dashboard");
  revalidatePath("/pro");
  revalidatePath("/admin");
}

async function requireProviderFor(bookingId: string) {
  const user = await requireUser();
  const db = getDb();
  const booking = await db.getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (user.role !== "admin" && user.providerId !== booking.providerId)
    throw new Error("Not authorized");
  return { user, db, booking };
}

export async function respondToBookingAction(
  bookingId: string,
  accept: boolean
) {
  const { db, booking } = await requireProviderFor(bookingId);
  if (booking.status !== "pending") return;
  await db.updateBookingStatus(bookingId, accept ? "accepted" : "declined");
  revalidatePath("/pro");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

/** Provider marks a job complete + sets final price → invoice is generated & emailed. */
export async function completeBookingAction(
  bookingId: string,
  finalPriceAwg: number
): Promise<{ ok: boolean; invoiceId?: string; error?: string }> {
  if (!Number.isFinite(finalPriceAwg) || finalPriceAwg <= 0)
    return { ok: false, error: "Enter a valid final price in AWG." };
  const { db, booking } = await requireProviderFor(bookingId);
  if (booking.status !== "accepted" && booking.status !== "pending")
    return { ok: false, error: "Job can't be completed in its current state." };

  const invoice = await db.completeBooking(bookingId, Math.round(finalPriceAwg * 100) / 100);
  const customer = await db.getUserById(booking.customerId);
  const provider = await db.getProviderById(booking.providerId);
  if (customer && provider) {
    await sendInvoiceEmail(customer, invoice, booking, provider);
  }
  revalidatePath("/pro");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, invoiceId: invoice.id };
}

// ---------------------------------------------------------------------------
// Invoices (admin)
// ---------------------------------------------------------------------------
export async function setInvoicePaidAction(invoiceId: string, paid: boolean) {
  await requireRole("admin");
  await getDb().setInvoicePaid(invoiceId, paid);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/pro");
  revalidatePath(`/invoices/${invoiceId}`);
}

// ---------------------------------------------------------------------------
// Reviews & favorites
// ---------------------------------------------------------------------------
export async function submitReviewAction(
  bookingId: string,
  rating: number,
  comment: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const db = getDb();
  const booking = await db.getBooking(bookingId);
  if (!booking || booking.customerId !== user.id)
    return { ok: false, error: "Booking not found." };
  if (booking.status !== "completed")
    return { ok: false, error: "You can review a job once it's completed." };
  if (await db.hasReviewForBooking(bookingId))
    return { ok: false, error: "You already reviewed this job." };
  const r = Math.min(5, Math.max(1, Math.round(rating)));
  await db.createReview({
    bookingId,
    providerId: booking.providerId,
    customerId: user.id,
    customerName: user.name,
    rating: r,
    comment: comment.trim().slice(0, 1000),
  });
  revalidatePath("/dashboard");
  revalidatePath("/providers");
  return { ok: true };
}

export async function toggleFavoriteAction(providerId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/providers");
  await getDb().toggleFavorite(user.id, providerId);
  revalidatePath("/dashboard");
  revalidatePath("/providers");
}

// ---------------------------------------------------------------------------
// Provider onboarding & admin verification
// ---------------------------------------------------------------------------
export async function applyProviderAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const user = await getCurrentUser();
  const companyName = String(formData.get("companyName") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  const email = String(formData.get("email") || user?.email || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const categories = formData.getAll("categories").map(String);
  const neighborhood = String(formData.get("neighborhood") || "Island-wide");
  const address = String(formData.get("address") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const rateRaw = String(formData.get("hourlyRateAwg") || "").trim();
  const license = formData.get("license") as File | null;

  if (!companyName || !email || categories.length === 0) {
    return { error: "Company name, email and at least one service are required." };
  }

  const db = getDb();
  let ownerUserId = user?.id ?? null;
  if (!user) {
    const owner = await db.createUser({
      email,
      name: contactName || companyName,
      role: "provider",
    });
    ownerUserId = owner.id;
    if (!isSupabaseConfigured()) await setDemoSession(owner.id);
  }

  let licenseFileName: string | null = null;
  if (license && license.size > 0) {
    licenseFileName = license.name;
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const path = `licenses/${Date.now()}-${license.name}`;
        await supabase.storage
          .from("provider-docs")
          .upload(path, license, { upsert: false });
        licenseFileName = path;
      } catch (err) {
        console.error("License upload failed:", err);
      }
    }
  }

  await db.applyProvider(
    {
      companyName,
      contactName,
      email,
      phone,
      categories,
      neighborhood,
      address,
      website,
      bio,
      hourlyRateAwg: rateRaw ? Number(rateRaw) : null,
      licenseFileName,
    },
    ownerUserId
  );

  revalidatePath("/admin");
  redirect("/pro/onboarding/success");
}

export async function setProviderStatusAction(
  providerId: string,
  status: "approved" | "rejected" | "pending",
  verified: boolean
) {
  await requireRole("admin");
  await getDb().setProviderStatus(providerId, status, verified);
  revalidatePath("/admin");
  revalidatePath("/providers");
}
