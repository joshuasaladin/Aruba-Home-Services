import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBankDetails } from "@/lib/config";
import { awgToUsd, formatAwg } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/invoices/${id}`);

  const t = await getT();
  const db = getDb();
  const invoice = await db.getInvoice(id);
  if (!invoice) notFound();

  const allowed =
    user.role === "admin" ||
    invoice.customerId === user.id ||
    (user.providerId && user.providerId === invoice.providerId);
  if (!allowed) redirect("/dashboard");

  const [booking, provider, customer] = await Promise.all([
    db.getBooking(invoice.bookingId),
    db.getProviderById(invoice.providerId),
    db.getUserById(invoice.customerId),
  ]);
  if (!booking || !provider) notFound();

  const bank = getBankDetails();
  const paid = invoice.status === "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard" className="text-sm font-semibold text-brand-700 hover:underline">
          ← {t("nav.dashboard")}
        </Link>
        <a href={`/api/invoices/${invoice.id}/pdf`} className="btn-primary text-sm" download>
          ⬇ {t("invoice.download")}
        </a>
      </div>

      <article className="card overflow-hidden">
        {/* Header */}
        <div className="bg-brand-800 px-6 py-6 text-white md:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xl font-extrabold">🌴 Aruba Home Services</p>
              <p className="mt-1 text-sm text-cyan-200">Oranjestad, Aruba</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold tracking-wide">{t("invoice.title").toUpperCase()}</p>
              <p className="text-sm text-cyan-200">{invoice.number}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 md:px-10">
          {/* Status */}
          <div
            className={`rounded-lg px-4 py-3 text-center font-extrabold uppercase tracking-wide ${
              paid ? "bg-emerald-50 text-emerald-700" : "bg-sand-50 text-amber-700"
            }`}
            role="status"
          >
            {paid
              ? `✓ ${t("invoice.status.paid")}${invoice.paidAt ? ` — ${t("invoice.paidOn")} ${new Date(invoice.paidAt).toLocaleDateString("en-US", { dateStyle: "medium" })}` : ""}`
              : `⏳ ${t("invoice.status.invoiced")}`}
          </div>

          {/* Parties */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("invoice.billTo")}</p>
              <p className="mt-1 font-semibold text-slate-900">{customer?.name ?? "Customer"}</p>
              <p className="text-sm text-slate-500">{customer?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("invoice.from")}</p>
              <p className="mt-1 font-semibold text-slate-900">{provider.name}</p>
              <p className="text-sm text-slate-500">{provider.address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("invoice.issued")}</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(invoice.issuedAt).toLocaleDateString("en-US", { dateStyle: "long" })}
              </p>
              <p className="text-sm text-slate-500">
                {t("invoice.bookingRef")}: <span className="font-mono">{booking.ref}</span>
              </p>
            </div>
          </div>

          {/* Line item */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">{t("invoice.service")}</th>
                <th className="py-2 text-right">{t("invoice.amount")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3">
                  <p className="font-semibold text-slate-900">{t(`cat.${booking.categorySlug}`)}</p>
                  <p className="mt-0.5 text-slate-500">{booking.description}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    📍 {booking.address ? `${booking.address}, ` : ""}{booking.neighborhood}
                  </p>
                </td>
                <td className="py-3 text-right align-top font-semibold">{formatAwg(invoice.amountAwg)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-4 text-right font-bold uppercase tracking-wide text-slate-500">
                  {t("common.total")}
                </td>
                <td className="py-4 text-right">
                  <span className="text-2xl font-extrabold text-slate-900">{formatAwg(invoice.amountAwg)}</span>
                  <span className="block text-xs text-slate-500">
                    ≈ ${awgToUsd(invoice.amountAwg).toFixed(2)} USD · {t("common.awgNote")}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Bank transfer box */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-5 md:p-6">
            <h2 className="font-extrabold text-brand-900">🏦 {t("invoice.howToPay")}</h2>
            <p className="mt-1 text-sm text-brand-800">{t("invoice.payInstructions")}</p>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {[
                [t("invoice.bank"), bank.bankName],
                [t("invoice.accountName"), bank.accountName],
                [t("invoice.accountNumber"), bank.accountNumber],
                [t("invoice.iban"), bank.iban],
                [t("invoice.swift"), bank.swift],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-brand-100 py-1.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-semibold text-slate-900">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 rounded-lg bg-white px-3 py-2 sm:col-span-2">
                <dt className="font-bold text-amber-700">⚠ {t("invoice.paymentReference")}</dt>
                <dd className="font-mono text-base font-extrabold text-slate-900">
                  {invoice.paymentReference}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </article>
    </div>
  );
}
