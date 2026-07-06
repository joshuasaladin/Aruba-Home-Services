"use client";

import { useState, useTransition } from "react";
import { submitReviewAction } from "@/lib/actions";
import { useT } from "@/lib/i18n/LocaleProvider";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return <span className="badge bg-emerald-100 text-emerald-800">✓ {t("review.submit")}</span>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary !px-3 !py-1.5 text-xs">
        ⭐ {t("dash.review")}
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-900">{t("review.title")}</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t("review.title")}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} / 5`}
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-sand-500" : "text-slate-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("review.commentPlaceholder")}
        className="input mt-2 text-sm"
        aria-label={t("review.commentPlaceholder")}
      />
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await submitReviewAction(bookingId, rating, comment);
              if (res.ok) setSubmitted(true);
              else setError(res.error || "Error");
            })
          }
          className="btn-primary !px-3 !py-1.5 text-xs"
        >
          {pending ? t("common.loading") : t("review.submit")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary !px-3 !py-1.5 text-xs">
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
