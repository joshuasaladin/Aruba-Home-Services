import { Metadata } from "next";
import Link from "next/link";
import { ProviderCard } from "@/components/ProviderCard";
import { NEIGHBORHOODS } from "@/lib/config";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { ProviderFilters } from "@/lib/types";

export const metadata: Metadata = { title: "Provider directory" };

type Search = { [key: string]: string | string[] | undefined };

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const filters: ProviderFilters = {
    q: str(sp.q) || undefined,
    category: str(sp.category) || undefined,
    neighborhood: str(sp.neighborhood) || undefined,
    minRating: str(sp.minRating) ? Number(str(sp.minRating)) : undefined,
    maxRate: str(sp.maxRate) ? Number(str(sp.maxRate)) : undefined,
    verifiedOnly: str(sp.verified) === "1",
    sort: (["rating", "reviews", "name", "price"].includes(str(sp.sort))
      ? str(sp.sort)
      : "rating") as ProviderFilters["sort"],
  };

  const db = getDb();
  const [categories, providers] = await Promise.all([
    db.listCategories(),
    db.listProviders(filters),
  ]);

  const hasFilters = Boolean(
    filters.q || filters.category || filters.neighborhood || filters.minRating ||
    filters.maxRate || filters.verifiedOnly
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">{t("directory.title")}</h1>
      <p className="mt-1 text-slate-500">{t("directory.subtitle")}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <form className="card h-fit space-y-4 p-5" aria-label={t("directory.applyFilters")}>
          <div>
            <label htmlFor="f-q" className="label">{t("home.searchButton")}</label>
            <input
              id="f-q"
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder={t("directory.searchPlaceholder")}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="f-cat" className="label">{t("directory.filterCategory")}</label>
            <select id="f-cat" name="category" defaultValue={filters.category ?? ""} className="input">
              <option value="">{t("directory.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {t(`cat.${c.slug}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-hood" className="label">{t("directory.filterNeighborhood")}</label>
            <select id="f-hood" name="neighborhood" defaultValue={filters.neighborhood ?? ""} className="input">
              <option value="">{t("directory.allNeighborhoods")}</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-rating" className="label">{t("directory.filterRating")}</label>
            <select id="f-rating" name="minRating" defaultValue={filters.minRating ?? ""} className="input">
              <option value="">{t("directory.anyRating")}</option>
              <option value="4.5">4.5+ ★</option>
              <option value="4">4.0+ ★</option>
              <option value="3">3.0+ ★</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-rate" className="label">{t("directory.filterPrice")}</label>
            <select id="f-rate" name="maxRate" defaultValue={filters.maxRate ?? ""} className="input">
              <option value="">{t("directory.anyPrice")}</option>
              <option value="80">≤ Afl. 80/hr</option>
              <option value="110">≤ Afl. 110/hr</option>
              <option value="150">≤ Afl. 150/hr</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={filters.verifiedOnly}
              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            {t("directory.filterVerified")}
          </label>
          <div>
            <label htmlFor="f-sort" className="label">{t("directory.sortBy")}</label>
            <select id="f-sort" name="sort" defaultValue={filters.sort} className="input">
              <option value="rating">{t("directory.sortRating")}</option>
              <option value="reviews">{t("directory.sortReviews")}</option>
              <option value="name">{t("directory.sortName")}</option>
              <option value="price">{t("directory.sortPrice")}</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1 text-sm">
              {t("directory.applyFilters")}
            </button>
            {hasFilters && (
              <Link href="/providers" className="btn-secondary text-sm">
                ✕
              </Link>
            )}
          </div>
        </form>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-slate-500" role="status">
            <strong className="text-slate-900">{providers.length}</strong> {t("directory.results")}
          </p>
          {providers.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl" aria-hidden>🔍</p>
              <p className="mt-3 font-semibold text-slate-700">{t("directory.noResults")}</p>
              <Link href="/providers" className="btn-secondary mt-4 text-sm">
                {t("directory.clearFilters")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
