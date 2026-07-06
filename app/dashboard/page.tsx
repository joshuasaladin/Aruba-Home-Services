import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProviderCard } from "@/components/ProviderCard";
import { ReviewForm } from "@/components/ReviewForm";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { cancelBookingAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatAwgWithUsd } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { Booking, Provider } from "@/lib/types";

export const metadata: Metadata = { title: "My bookings" };

export default async function CustomerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const t = await getT();
  const db = getDb();

  const [bookings, invoices, favorites, categories] = await Promise.all([
    db.listBookingsForCustomer(user.id),
    db.listInvoicesForCustomer(user.id),
    db.listFavoriteProviders(user.id),
    db.listCategories(),
  ]);

  const providerMap = new Map<string, Provider>();
  for (const b of bookings) {
    if (!providerMap.has(b.providerId)) {
      const p = await db.getProviderById(b.providerId);
      if (p) providerMap.set(b.providerId, p);
    }
  }
  const reviewed = new Set<string>();
  for (const b of bookings.filter((b) => b.status === "completed")) {
    if (await db.hasReviewForBooking(b.id)) reviewed.add(b.id);
  }

  const active = bookings.filter((b) => b.status === "pending" || b.status === "accepted");
  const past = bookings.filter((b) => !["pending", "accepted"].includes(b.status));
  const catIcon = (slug: string) => categories.find((c) => c.slug === slug)?.icon ?? "🔧";

  const BookingRow = ({ b }: { b: Booking }) => {
    const provider = providerMap.get(b.providerId);
    const invoice = invoices.find((i) => i.bookingId === b.id);
    return (
      <li className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-900">
              <span aria-hidden className="mr-1">{catIcon(b.categorySlug)}</span>
              {t(`cat.${b.categorySlug}`)}
              <span className="ml-2 font-mono text-xs font-normal text-slate-400">{b.ref}</span>
            </p>
            {provider && (
              <Link href={`/providers/${provider.slug}`} className="text-sm text-brand-700 hover:underline">
                {provider.name}
              </Link>
            )}
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{b.description}</p>
            <p className="mt-1 text-xs text-slate-400">
              {b.asap
                ? `⚡ ${t("book.asap")}`
                : b.scheduledAt
                  ? new Date(b.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                  : ""}
              {" · "}📍 {b.neighborhood}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <BookingStatusBadge status={b.status} label={t(`dash.status.${b.status}`)} />
            {b.status === "completed" && (
              <PaymentStatusBadge status={b.paymentStatus} label={t(`dash.payment.${b.paymentStatus}`)} />
            )}
            {b.finalPriceAwg !== null && (
              <span className="text-sm font-bold text-slate-900">{formatAwgWithUsd(b.finalPriceAwg)}</span>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {(b.status === "pending" || b.status === "accepted") && (
            <form action={cancelBookingAction.bind(null, b.id)}>
              <button className="btn-secondary !px-3 !py-1.5 text-xs text-rose-600">
                ✕ {t("dash.cancel")}
              </button>
            </form>
          )}
          {invoice && (
            <Link href={`/invoices/${invoice.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
              🧾 {t("dash.viewInvoice")}
            </Link>
          )}
          {b.status === "completed" && !reviewed.has(b.id) && <ReviewForm bookingId={b.id} />}
          {provider && b.status === "completed" && (
            <Link
              href={`/book?provider=${provider.slug}&category=${b.categorySlug}`}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              ↻ {t("dash.rebook")}
            </Link>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{t("dash.title")}</h1>
          <p className="mt-1 text-slate-500">👋 {user.name}</p>
        </div>
        <Link href="/book" className="btn-primary">+ {t("nav.bookNow")}</Link>
      </div>

      {/* Active */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">{t("dash.upcoming")}</h2>
        {active.length === 0 ? (
          <div className="card mt-3 p-8 text-center text-slate-500">
            <p>{t("dash.empty")}</p>
            <Link href="/book" className="btn-primary mt-4">{t("nav.bookNow")}</Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">{active.map((b) => <BookingRow key={b.id} b={b} />)}</ul>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-slate-900">{t("dash.past")}</h2>
          <ul className="mt-3 space-y-3">{past.map((b) => <BookingRow key={b.id} b={b} />)}</ul>
        </section>
      )}

      {/* Invoices */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">🧾 {t("dash.invoices")}</h2>
        {invoices.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-slate-500">{t("dash.noInvoices")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/invoices/${inv.id}`} className="font-bold text-brand-700 hover:underline">
                    {inv.number}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {new Date(inv.issuedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    {" · "}{t("invoice.paymentReference")}: <span className="font-mono">{inv.paymentReference}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{formatAwgWithUsd(inv.amountAwg)}</span>
                  <PaymentStatusBadge
                    status={inv.status === "paid" ? "paid" : "invoiced"}
                    label={t(inv.status === "paid" ? "dash.payment.paid" : "invoice.status.invoiced")}
                  />
                  <Link href={`/invoices/${inv.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                    {t("dash.viewInvoice")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Favorites */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">♥ {t("dash.favorites")}</h2>
        {favorites.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-slate-500">{t("dash.noFavorites")}</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {favorites.map((p) => <ProviderCard key={p.id} provider={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
