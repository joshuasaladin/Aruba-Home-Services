"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createBookingAction, demoLoginAction } from "@/lib/actions";
import { NEIGHBORHOODS } from "@/lib/config";
import { formatAwgRange, awgToUsd, formatUsd } from "@/lib/currency";
import { useT } from "@/lib/i18n/LocaleProvider";
import { Category, Provider, User } from "@/lib/types";
import { ProviderAvatar } from "./ProviderCard";
import { RatingStars } from "./RatingStars";

const DRAFT_KEY = "ahs-booking-draft";

interface Draft {
  category: string;
  description: string;
  neighborhood: string;
  address: string;
  asap: boolean;
  scheduledAt: string;
  providerId: string;
  step: number;
}

export function BookingWizard({
  categories,
  providers,
  user,
  demoMode,
  initialCategory,
  initialProviderId,
}: {
  categories: Category[];
  providers: Provider[];
  user: User | null;
  demoMode: boolean;
  initialCategory?: string;
  initialProviderId?: string;
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const [draft, setDraft] = useState<Draft>({
    category: initialCategory || "",
    description: "",
    neighborhood: "",
    address: "",
    asap: true,
    scheduledAt: "",
    providerId: initialProviderId || "",
    step: initialCategory ? 1 : 0,
  });

  // Restore a saved draft (e.g. after a login round-trip), unless a fresh
  // category/provider was passed via the URL.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw && !initialProviderId && !initialCategory) {
        setDraft(JSON.parse(raw) as Draft);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const category = categories.find((c) => c.slug === draft.category);
  const matched = useMemo(() => {
    let list = providers.filter((p) => p.categories.includes(draft.category));
    if (draft.neighborhood && draft.neighborhood !== "Island-wide") {
      const local = list.filter(
        (p) => p.neighborhood === draft.neighborhood || p.neighborhood === "Island-wide"
      );
      if (local.length > 0) list = local;
    }
    return [...list].sort((a, b) => b.ratingAvg - a.ratingAvg);
  }, [providers, draft.category, draft.neighborhood]);
  const chosen = providers.find((p) => p.id === draft.providerId);

  const steps = [
    t("book.stepService"),
    t("book.stepDetails"),
    t("book.stepSchedule"),
    t("book.stepProvider"),
    t("book.stepConfirm"),
  ];

  const canNext = () => {
    switch (draft.step) {
      case 0: return Boolean(draft.category);
      case 1: return draft.description.trim().length > 4 && Boolean(draft.neighborhood);
      case 2: return draft.asap || Boolean(draft.scheduledAt);
      case 3: return Boolean(chosen);
      default: return true;
    }
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const res = await createBookingAction({
        providerId: draft.providerId,
        categorySlug: draft.category,
        description: draft.description,
        neighborhood: draft.neighborhood || "Island-wide",
        address: draft.address,
        scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
        asap: draft.asap,
      });
      if (res.ok) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
        setDone({ ref: res.ref });
      } else if (res.error === "auth") {
        setNeedsAuth(true);
      } else {
        setError(res.error);
      }
    });
  };

  if (done) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p aria-hidden className="text-5xl">🎉</p>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{t("book.successTitle")}</h1>
        <p className="mt-2 text-slate-600">{t("book.successBody")}</p>
        <p className="mt-4 rounded-lg bg-brand-50 py-3 font-mono text-lg font-bold text-brand-800">
          {t("book.reference")}: {done.ref}
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 w-full">
          {t("book.goToDashboard")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-1 text-xs font-semibold" aria-label="Progress">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              aria-current={i === draft.step ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                i < draft.step
                  ? "bg-emerald-500 text-white"
                  : i === draft.step
                    ? "bg-brand-700 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {i < draft.step ? "✓" : i + 1}
            </span>
            <span className={`hidden sm:block ${i === draft.step ? "text-brand-800" : "text-slate-400"}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="card p-6 md:p-8">
        {/* STEP 0 — service */}
        {draft.step === 0 && (
          <fieldset>
            <legend className="text-xl font-extrabold text-slate-900">{t("book.chooseService")}</legend>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => patch({ category: c.slug, providerId: "", step: 1 })}
                  aria-pressed={draft.category === c.slug}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    draft.category === c.slug
                      ? "border-brand-600 bg-brand-50"
                      : "border-slate-200 hover:border-brand-300"
                  }`}
                >
                  <span aria-hidden className="text-2xl">{c.icon}</span>
                  <span className="mt-1 block text-sm font-bold text-slate-900">{t(`cat.${c.slug}`)}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {formatAwgRange(c.priceMinAwg, c.priceMaxAwg)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* STEP 1 — details */}
        {draft.step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900">{t("book.describeJob")}</h2>
            <div>
              <label htmlFor="bw-desc" className="label">{t("book.describeJob")}</label>
              <textarea
                id="bw-desc"
                rows={4}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder={t("book.descriptionPlaceholder")}
                className="input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bw-hood" className="label">{t("book.whereLabel")}</label>
                <select
                  id="bw-hood"
                  value={draft.neighborhood}
                  onChange={(e) => patch({ neighborhood: e.target.value })}
                  className="input"
                >
                  <option value="">—</option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bw-addr" className="label">{t("book.addressLabel")}</label>
                <input
                  id="bw-addr"
                  value={draft.address}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder={t("book.addressPlaceholder")}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — schedule */}
        {draft.step === 2 && (
          <fieldset className="space-y-4">
            <legend className="text-xl font-extrabold text-slate-900">{t("book.whenLabel")}</legend>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                draft.asap ? "border-brand-600 bg-brand-50" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="when"
                checked={draft.asap}
                onChange={() => patch({ asap: true })}
                className="mt-1 accent-brand-700"
              />
              <span>
                <span className="block font-bold text-slate-900">⚡ {t("book.asap")}</span>
                <span className="text-sm text-slate-500">{t("book.asapHint")}</span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                !draft.asap ? "border-brand-600 bg-brand-50" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="when"
                checked={!draft.asap}
                onChange={() => patch({ asap: false })}
                className="mt-1 accent-brand-700"
              />
              <span className="flex-1">
                <span className="block font-bold text-slate-900">📅 {t("book.pickDate")}</span>
                {!draft.asap && (
                  <input
                    type="datetime-local"
                    value={draft.scheduledAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => patch({ scheduledAt: e.target.value })}
                    className="input mt-2"
                    aria-label={t("book.pickDate")}
                  />
                )}
              </span>
            </label>
          </fieldset>
        )}

        {/* STEP 3 — provider */}
        {draft.step === 3 && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t("book.chooseProvider")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("book.matchedProviders")}</p>
            {matched.length === 0 ? (
              <p className="mt-6 rounded-lg bg-sand-50 p-4 text-sm text-amber-800">
                {t("book.noProviders")}
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {matched.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => patch({ providerId: p.id })}
                      aria-pressed={draft.providerId === p.id}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                        draft.providerId === p.id
                          ? "border-brand-600 bg-brand-50"
                          : "border-slate-200 hover:border-brand-300"
                      }`}
                    >
                      <ProviderAvatar name={p.name} size="h-12 w-12 text-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-slate-900">
                          {p.name} {p.verified && <span className="text-emerald-600">✓</span>}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <RatingStars rating={p.ratingAvg} size="text-xs" />
                          {p.ratingAvg.toFixed(1)} · {p.jobsCompleted} {t("provider.jobsCompleted")} · 📍 {p.neighborhood}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                          draft.providerId === p.id ? "border-brand-600 bg-brand-600" : "border-slate-300"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* STEP 4 — confirm */}
        {draft.step === 4 && chosen && category && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t("book.confirmTitle")}</h2>
            <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-5 text-sm">
              {[
                [t("directory.filterCategory"), `${category.icon} ${t(`cat.${category.slug}`)}`],
                [t("common.provider"), chosen.name],
                [t("book.describeJob"), draft.description],
                [t("book.whereLabel"), `${draft.address ? draft.address + ", " : ""}${draft.neighborhood}`],
                [
                  t("book.whenLabel"),
                  draft.asap
                    ? `⚡ ${t("book.asap")}`
                    : new Date(draft.scheduledAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }),
                ],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-6">
                  <dt className="shrink-0 font-semibold text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-6 border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-500">{t("book.estimate")}</dt>
                <dd className="text-right font-extrabold text-brand-800">
                  {formatAwgRange(category.priceMinAwg, category.priceMaxAwg)}
                  <span className="block text-xs font-normal text-slate-500">
                    ≈ {formatUsd(awgToUsd(category.priceMinAwg))}–{formatUsd(awgToUsd(category.priceMaxAwg))} USD
                  </span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-900">
              🏦 {t("book.estimateNote")}
            </p>

            {needsAuth && !user && (
              <div className="mt-4 rounded-lg border border-sand-400 bg-sand-50 p-4">
                <p className="text-sm font-semibold text-amber-900">{t("book.loginRequired")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {demoMode && (
                    <button
                      type="button"
                      onClick={() => startTransition(() => demoLoginAction("customer", "/book"))}
                      className="btn-primary !py-2 text-sm"
                    >
                      ⚡ {t("auth.demoCustomer")}
                    </button>
                  )}
                  <Link href="/login?next=/book" className="btn-secondary !py-2 text-sm">
                    {t("nav.login")}
                  </Link>
                  <Link href="/signup?next=/book" className="btn-secondary !py-2 text-sm">
                    {t("nav.signup")}
                  </Link>
                </div>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => patch({ step: Math.max(0, draft.step - 1) })}
            disabled={draft.step === 0 || pending}
            className="btn-secondary text-sm disabled:invisible"
          >
            ← {t("book.back")}
          </button>
          {draft.step < 4 ? (
            <button
              type="button"
              onClick={() => canNext() && patch({ step: draft.step + 1 })}
              disabled={!canNext()}
              className="btn-primary text-sm"
            >
              {t("book.next")} →
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={pending} className="btn-primary">
              {pending ? t("common.loading") : `✓ ${t("book.confirmButton")}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
