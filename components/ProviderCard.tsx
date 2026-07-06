"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LocaleProvider";
import { formatAwg } from "@/lib/currency";
import { Provider } from "@/lib/types";
import { RatingStars } from "./RatingStars";

/** Colored monogram used instead of provider logos. */
export function ProviderAvatar({
  name,
  size = "h-14 w-14 text-xl",
}: {
  name: string;
  size?: string;
}) {
  const colors = [
    "bg-brand-700",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-sky-700",
    "bg-emerald-600",
    "bg-indigo-600",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const color = colors[Math.abs(h) % colors.length];
  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-white ${size} ${color}`}
    >
      {initials || "?"}
    </span>
  );
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const t = useT();
  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <ProviderAvatar name={provider.name} />
        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-900">{provider.name}</h3>
          <p className="text-sm text-slate-500">📍 {provider.neighborhood}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <RatingStars rating={provider.ratingAvg} />
            <span className="text-xs text-slate-500">
              {provider.ratingAvg.toFixed(1)} ({provider.reviewCount})
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.verified && (
          <span className="badge bg-emerald-100 text-emerald-800">
            ✓ {t("provider.verified")}
          </span>
        )}
        {provider.insured && (
          <span className="badge bg-brand-100 text-brand-800">
            🛡 {t("provider.insured")}
          </span>
        )}
        {provider.categories.slice(0, 3).map((c) => (
          <span key={c} className="badge bg-slate-100 text-slate-600">
            {t(`cat.${c}`)}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          {provider.jobsCompleted} {t("provider.jobsCompleted")}
        </span>
        {provider.hourlyRateAwg !== null && (
          <span className="font-bold text-brand-800">
            {t("provider.hourlyFrom")} {formatAwg(provider.hourlyRateAwg)}
            <span className="font-normal text-slate-400">{t("provider.perHour")}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
