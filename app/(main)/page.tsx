import Link from "next/link";
import { ProviderCard } from "@/components/ProviderCard";
import { NEIGHBORHOODS } from "@/lib/config";
import { formatAwgRange } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const t = await getT();
  const db = getDb();
  const [categories, providers] = await Promise.all([
    db.listCategories(),
    db.listProviders({ sort: "rating" }),
  ]);
  const featured = providers.slice(0, 6);

  const trust = [
    ["✅", t("home.trustVerified")],
    ["🏦", t("home.trustNoCard")],
    ["🌴", t("home.trustIsland")],
    ["⭐", t("home.trustReviews")],
  ] as const;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-cyan-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 text-lg text-cyan-100">{t("home.heroSubtitle")}</p>
          </div>

          <form
            action="/providers"
            className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row"
          >
            <label className="flex-1">
              <span className="sr-only">{t("home.searchPlaceholder")}</span>
              <input
                type="search"
                name="q"
                placeholder={t("home.searchPlaceholder")}
                className="input !border-0 !py-3 focus:!outline-0"
              />
            </label>
            <label className="sm:w-52 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="sr-only">{t("directory.filterNeighborhood")}</span>
              <select name="neighborhood" className="input !border-0 !py-3 text-slate-600 focus:!outline-0">
                <option value="">{t("home.locationPlaceholder")}</option>
                {NEIGHBORHOODS.filter((n) => n !== "Island-wide").map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-amber !py-3 sm:!px-8">
              🔍 {t("home.searchButton")}
            </button>
          </form>

          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-cyan-50 md:grid-cols-4">
            {trust.map(([icon, label]) => (
              <li key={label} className="flex items-center gap-2">
                <span aria-hidden>{icon}</span> {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats strip */}
      <section aria-label="Stats" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-6 text-center">
          {[
            [String(providers.length), t("home.statsProviders")],
            [String(categories.length), t("home.statsCategories")],
            ["8", t("home.statsNeighborhoods")],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-brand-700">{num}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-extrabold text-slate-900">{t("home.categoriesTitle")}</h2>
        <p className="mt-1 text-slate-500">{t("home.categoriesSubtitle")}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/book?category=${c.slug}`}
              className="card group flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
            >
              <span aria-hidden className="text-3xl">{c.icon}</span>
              <span className="font-bold text-slate-900 group-hover:text-brand-700">
                {t(`cat.${c.slug}`)}
              </span>
              <span className="text-xs text-slate-500">{t(`cat.${c.slug}.desc`)}</span>
              <span className="mt-auto pt-1 text-xs font-semibold text-brand-700">
                {formatAwgRange(c.priceMinAwg, c.priceMaxAwg)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-slate-900">{t("home.howTitle")}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["📝", t("home.how1Title"), t("home.how1Body")],
              ["🤝", t("home.how2Title"), t("home.how2Body")],
              ["🏦", t("home.how3Title"), t("home.how3Body")],
            ].map(([icon, title, body]) => (
              <div key={title} className="card p-6">
                <span aria-hidden className="text-3xl">{icon}</span>
                <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured providers */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">{t("home.featuredTitle")}</h2>
            <p className="mt-1 text-slate-500">{t("home.featuredSubtitle")}</p>
          </div>
          <Link href="/providers" className="btn-secondary text-sm">
            {t("home.directoryCta")} →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </section>

      {/* Provider CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-r from-brand-800 to-teal-700 px-6 py-10 text-white md:px-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold">{t("home.ctaProviderTitle")}</h2>
              <p className="mt-2 text-cyan-100">{t("home.ctaProviderBody")}</p>
            </div>
            <Link href="/pro/onboarding" className="btn-amber shrink-0">
              {t("home.ctaProviderButton")} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
