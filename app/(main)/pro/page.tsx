import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CompleteJobForm } from "@/components/CompleteJobForm";
import { RatingStars } from "@/components/RatingStars";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { respondToBookingAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatAwg, formatAwgWithUsd } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { Booking, User } from "@/lib/types";

export const metadata: Metadata = { title: "Provider dashboard" };

export default async function ProviderDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/pro");
  const t = await getT();
  const db = getDb();

  if (!user.providerId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p aria-hidden className="text-5xl">🔧</p>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{t("pro.title")}</h1>
        <p className="mt-3 text-slate-600">{t("pro.notLinked")}</p>
        <Link href="/pro/onboarding" className="btn-primary mt-6">
          {t("nav.listBusiness")} →
        </Link>
      </div>
    );
  }

  const provider = await db.getProviderById(user.providerId);
  if (!provider) redirect("/pro/onboarding");

  const [bookings, invoices, customersById] = await Promise.all([
    db.listBookingsForProvider(provider.id),
    db.listInvoicesForProvider(provider.id),
    (async () => new Map<string, User>())(),
  ]);
  for (const b of bookings) {
    if (!customersById.has(b.customerId)) {
      const c = await db.getUserById(b.customerId);
      if (c) customersById.set(b.customerId, c);
    }
  }

  const incoming = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");
  const completed = bookings.filter((b) => b.status === "completed");

  const paidTotal = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountAwg, 0);
  const pendingTotal = invoices.filter((i) => i.status === "invoiced").reduce((s, i) => s + i.amountAwg, 0);
  const invoicedTotal = paidTotal + pendingTotal;

  const JobCard = ({ b, actions }: { b: Booking; actions?: React.ReactNode }) => {
    const customer = customersById.get(b.customerId);
    const invoice = invoices.find((i) => i.bookingId === b.id);
    return (
      <li className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-900">
              {t(`cat.${b.categorySlug}`)}
              <span className="ml-2 font-mono text-xs font-normal text-slate-400">{b.ref}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">{b.description}</p>
            <p className="mt-1.5 text-xs text-slate-400">
              {customer && <>🧑 {customer.name} · </>}
              📍 {b.address ? `${b.address}, ` : ""}{b.neighborhood} ·{" "}
              {b.asap
                ? `⚡ ${t("book.asap")}`
                : b.scheduledAt
                  ? new Date(b.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                  : ""}
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
        {(actions || invoice) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {actions}
            {invoice && (
              <Link href={`/invoices/${invoice.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                🧾 {invoice.number}
              </Link>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{t("pro.title")}</h1>
          <p className="mt-1 flex items-center gap-2 text-slate-500">
            {provider.name}
            {provider.verified ? (
              <span className="badge bg-emerald-100 text-emerald-800">✓ {t("provider.verified")}</span>
            ) : (
              <span className="badge bg-sand-100 text-amber-800">⏳ {t("provider.pendingVerification")}</span>
            )}
          </p>
        </div>
        <Link href={`/providers/${provider.slug}`} className="btn-secondary text-sm">
          👁 Public profile
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          [t("pro.invoicedTotal"), formatAwg(invoicedTotal)],
          [t("pro.paidTotal"), formatAwg(paidTotal)],
          [t("pro.pendingTotal"), formatAwg(pendingTotal)],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
          </div>
        ))}
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("pro.rating")}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xl font-extrabold text-slate-900">
            {provider.ratingAvg.toFixed(1)} <RatingStars rating={provider.ratingAvg} />
          </p>
        </div>
      </div>

      {/* Incoming requests */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">
          📥 {t("pro.incoming")}
          {incoming.length > 0 && (
            <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
              {incoming.length}
            </span>
          )}
        </h2>
        {incoming.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-slate-500">{t("pro.noIncoming")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {incoming.map((b) => (
              <JobCard
                key={b.id}
                b={b}
                actions={
                  <>
                    <form action={respondToBookingAction.bind(null, b.id, true)}>
                      <button className="btn-primary !px-4 !py-1.5 text-xs">✓ {t("pro.accept")}</button>
                    </form>
                    <form action={respondToBookingAction.bind(null, b.id, false)}>
                      <button className="btn-secondary !px-4 !py-1.5 text-xs text-rose-600">
                        ✕ {t("pro.decline")}
                      </button>
                    </form>
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>

      {/* Accepted jobs */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">🗓 {t("pro.schedule")}</h2>
        {accepted.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-slate-500">{t("pro.noJobs")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {accepted.map((b) => (
              <JobCard key={b.id} b={b} actions={<CompleteJobForm bookingId={b.id} />} />
            ))}
          </ul>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-slate-900">✅ {t("pro.completedJobs")}</h2>
          <ul className="mt-3 space-y-3">
            {completed.map((b) => <JobCard key={b.id} b={b} />)}
          </ul>
        </section>
      )}
    </div>
  );
}
