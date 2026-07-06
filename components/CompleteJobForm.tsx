"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeBookingAction } from "@/lib/actions";
import { awgToUsd, formatUsd } from "@/lib/currency";
import { useT } from "@/lib/i18n/LocaleProvider";

/** Provider sets the final price → job completed → invoice generated & emailed. */
export function CompleteJobForm({ bookingId }: { bookingId: string }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const parsed = parseFloat(price);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary !px-3 !py-1.5 text-xs">
        ✓ {t("pro.markComplete")}
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-lg border border-brand-200 bg-brand-50 p-4">
      <label htmlFor={`price-${bookingId}`} className="label">
        {t("pro.finalPrice")}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
            Afl.
          </span>
          <input
            id={`price-${bookingId}`}
            type="number"
            min="1"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input w-40 !pl-11"
            placeholder="0.00"
          />
        </div>
        {Number.isFinite(parsed) && parsed > 0 && (
          <span className="text-xs text-slate-500">≈ {formatUsd(awgToUsd(parsed))} USD</span>
        )}
        <button
          type="button"
          disabled={pending || !(parsed > 0)}
          onClick={() =>
            startTransition(async () => {
              const res = await completeBookingAction(bookingId, parsed);
              if (res.ok && res.invoiceId) {
                router.push(`/invoices/${res.invoiceId}`);
              } else {
                setError(res.error || "Error");
              }
            })
          }
          className="btn-primary !px-4 !py-2 text-sm"
        >
          {pending ? t("common.loading") : `🧾 ${t("pro.generateInvoice")}`}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary !px-3 !py-2 text-sm">
          {t("common.cancel")}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
    </div>
  );
}
