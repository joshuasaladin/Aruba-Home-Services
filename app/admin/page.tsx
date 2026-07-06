import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RatingStars } from "@/components/RatingStars";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { setInvoicePaidAction, setProviderStatusAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatAwg } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Admin panel" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  const t = await getT();
  const db = getDb();
  const { tab: rawTab } = await searchParams;
  const tab = ["providers", "bookings", "invoices"].includes(rawTab ?? "")
    ? rawTab!
    : "providers";

  const [providers, bookings, invoices] = await Promise.all([
    db.listAllProviders(),
    db.listAllBookings(),
    db.listAllInvoices(),
  ]);
  const pendingProviders = providers.filter((p) => p.status === "pending");
  const openInvoices = invoices.filter((i) => i.status === "invoiced");
  const providerName = (id: string) => providers.find((p) => p.id === id)?.name ?? "—";

  const tabs = [
    ["providers", `${t("admin.providers")} (${providers.length})`],
    ["bookings", `${t("admin.bookings")} (${bookings.length})`],
    ["invoices", `${t("admin.invoicesTab")} (${invoices.length})`],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">🛡️ {t("admin.title")}</h1>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          [String(pendingProviders.length), t("admin.statusPending")],
          [String(bookings.filter((b) => b.status === "pending").length), t("dash.status.pending")],
          [String(openInvoices.length), t("invoice.status.invoiced")],
          [formatAwg(openInvoices.reduce((s, i) => s + i.amountAwg, 0)), t("pro.pendingTotal")],
        ].map(([num, label]) => (
          <div key={label} className="card p-4">
            <p className="text-2xl font-extrabold text-brand-700">{num}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <nav aria-label="Admin sections" className="mt-8 flex gap-1 border-b border-slate-200">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-bold ${
              tab === key
                ? "border border-b-0 border-slate-200 bg-white text-brand-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Providers tab */}
      {tab === "providers" && (
        <div className="card overflow-x-auto rounded-t-none">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">{t("common.provider")}</th>
                <th className="px-4 py-3">{t("directory.filterCategory")}</th>
                <th className="px-4 py-3">{t("pro.rating")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                <th className="px-4 py-3">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/providers/${p.slug}`} className="font-semibold text-brand-700 hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-400">📍 {p.neighborhood}{p.phone ? ` · ${p.phone}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {p.categories.map((c) => t(`cat.${c}`)).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs">
                      <RatingStars rating={p.ratingAvg} size="text-xs" /> {p.ratingAvg.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "approved" ? (
                      p.verified ? (
                        <span className="badge bg-emerald-100 text-emerald-800">✓ {t("provider.verified")}</span>
                      ) : (
                        <span className="badge bg-brand-100 text-brand-800">{t("admin.statusApproved")}</span>
                      )
                    ) : p.status === "pending" ? (
                      <span className="badge bg-sand-100 text-amber-800">⏳ {t("admin.statusPending")}</span>
                    ) : (
                      <span className="badge bg-rose-100 text-rose-700">{t("admin.statusRejected")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.status !== "approved" || !p.verified) && (
                        <form action={setProviderStatusAction.bind(null, p.id, "approved", true)}>
                          <button className="btn-primary !px-2.5 !py-1 text-xs">✓ {t("admin.verify")}</button>
                        </form>
                      )}
                      {p.status === "approved" && p.verified && (
                        <form action={setProviderStatusAction.bind(null, p.id, "approved", false)}>
                          <button className="btn-secondary !px-2.5 !py-1 text-xs">{t("admin.unverify")}</button>
                        </form>
                      )}
                      {p.status !== "rejected" && (
                        <form action={setProviderStatusAction.bind(null, p.id, "rejected", false)}>
                          <button className="btn-secondary !px-2.5 !py-1 text-xs text-rose-600">
                            ✕ {t("admin.reject")}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings tab */}
      {tab === "bookings" && (
        <div className="card overflow-x-auto rounded-t-none">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">{t("directory.filterCategory")}</th>
                <th className="px-4 py-3">{t("common.provider")}</th>
                <th className="px-4 py-3">{t("common.date")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                <th className="px-4 py-3">{t("common.total")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{b.ref}</td>
                  <td className="px-4 py-3">{t(`cat.${b.categorySlug}`)}</td>
                  <td className="px-4 py-3 text-slate-600">{providerName(b.providerId)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {b.asap
                      ? `⚡ ${t("book.asap")}`
                      : b.scheduledAt
                        ? new Date(b.scheduledAt).toLocaleDateString("en-US", { dateStyle: "medium" })
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <BookingStatusBadge status={b.status} label={t(`dash.status.${b.status}`)} />
                      {b.status === "completed" && (
                        <PaymentStatusBadge status={b.paymentStatus} label={t(`dash.payment.${b.paymentStatus}`)} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {b.finalPriceAwg !== null ? formatAwg(b.finalPriceAwg) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div className="card overflow-x-auto rounded-t-none">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">{t("invoice.title")}</th>
                <th className="px-4 py-3">{t("common.provider")}</th>
                <th className="px-4 py-3">{t("invoice.paymentReference")}</th>
                <th className="px-4 py-3">{t("invoice.amount")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                <th className="px-4 py-3">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${inv.id}`} className="font-semibold text-brand-700 hover:underline">
                      {inv.number}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {new Date(inv.issuedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{providerName(inv.providerId)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{inv.paymentReference}</td>
                  <td className="px-4 py-3 font-semibold">{formatAwg(inv.amountAwg)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge
                      status={inv.status === "paid" ? "paid" : "invoiced"}
                      label={t(inv.status === "paid" ? "dash.payment.paid" : "invoice.status.invoiced")}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === "invoiced" ? (
                      <form action={setInvoicePaidAction.bind(null, inv.id, true)}>
                        <button className="btn-primary !px-2.5 !py-1 text-xs">💰 {t("admin.markPaid")}</button>
                      </form>
                    ) : (
                      <form action={setInvoicePaidAction.bind(null, inv.id, false)}>
                        <button className="btn-secondary !px-2.5 !py-1 text-xs">{t("admin.markUnpaid")}</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
