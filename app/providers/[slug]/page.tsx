import Link from "next/link";
import { notFound } from "next/navigation";
import { ProviderAvatar } from "@/components/ProviderCard";
import { RatingStars } from "@/components/RatingStars";
import { toggleFavoriteAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatAwg, formatAwgRange } from "@/lib/currency";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getT();
  const db = getDb();
  const provider = await db.getProviderBySlug(slug);
  if (!provider || provider.status !== "approved") notFound();

  const [reviews, categories, user] = await Promise.all([
    db.listReviewsForProvider(provider.id),
    db.listCategories(),
    getCurrentUser(),
  ]);
  const favorite = user ? await db.isFavorite(user.id, provider.id) : false;
  const providerCategories = categories.filter((c) =>
    provider.categories.includes(c.slug)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header card */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <ProviderAvatar name={provider.name} size="h-20 w-20 text-3xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              {provider.name}
            </h1>
            <p className="mt-1 text-slate-500">📍 {provider.neighborhood} · Aruba</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <RatingStars rating={provider.ratingAvg} />
                <strong>{provider.ratingAvg.toFixed(1)}</strong>
                <span className="text-sm text-slate-500">
                  ({provider.reviewCount} {t("provider.reviews")})
                </span>
              </span>
              <span className="text-sm text-slate-500">
                🧰 {provider.jobsCompleted} {t("provider.jobsCompleted")}
              </span>
              {provider.yearsInBusiness && (
                <span className="text-sm text-slate-500">
                  🗓 {provider.yearsInBusiness}+ {t("provider.yearsInBusiness")}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.verified ? (
                <span className="badge bg-emerald-100 text-emerald-800">
                  ✓ {t("provider.verified")}
                </span>
              ) : (
                <span className="badge bg-sand-100 text-amber-800">
                  ⏳ {t("provider.pendingVerification")}
                </span>
              )}
              {provider.insured && (
                <span className="badge bg-brand-100 text-brand-800">
                  🛡 {t("provider.insured")}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href={`/book?provider=${provider.slug}&category=${provider.categories[0]}`}
              className="btn-primary"
            >
              {t("provider.book")} →
            </Link>
            <form action={toggleFavoriteAction.bind(null, provider.id)}>
              <button className="btn-secondary w-full text-sm">
                {favorite ? `♥ ${t("provider.unfavorite")}` : `♡ ${t("provider.favorite")}`}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-extrabold text-slate-900">{t("provider.about")}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{provider.bio}</p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t("provider.servicesOffered")}
            </h2>
            <ul className="mt-3 space-y-2">
              {providerCategories.map((c) => (
                <li
                  key={c.slug}
                  className="card flex items-center justify-between gap-3 p-4"
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="text-2xl">{c.icon}</span>
                    <span>
                      <span className="block font-semibold text-slate-900">
                        {t(`cat.${c.slug}`)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t("provider.estimatedRange")}: {formatAwgRange(c.priceMinAwg, c.priceMaxAwg)}
                      </span>
                    </span>
                  </span>
                  <Link
                    href={`/book?provider=${provider.slug}&category=${c.slug}`}
                    className="btn-secondary shrink-0 !px-3 !py-1.5 text-xs"
                  >
                    {t("provider.book")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t("provider.reviewsTitle")}
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-slate-500">{t("provider.noReviews")}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm text-slate-900">{r.customerName}</strong>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{r.comment}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="card h-fit space-y-4 p-5">
          <h2 className="font-extrabold text-slate-900">{t("provider.contact")}</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">{t("provider.serviceArea")}</dt>
              <dd className="text-slate-900">{provider.neighborhood}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">{t("provider.address")}</dt>
              <dd className="text-slate-900">{provider.address}</dd>
            </div>
            {provider.phone && (
              <div>
                <dt className="font-semibold text-slate-500">{t("provider.phone")}</dt>
                <dd>
                  <a className="text-brand-700 hover:underline" href={`tel:${provider.phone}`}>
                    {provider.phone}
                  </a>
                </dd>
              </div>
            )}
            {provider.website && (
              <div>
                <dt className="font-semibold text-slate-500">{t("provider.website")}</dt>
                <dd>
                  <a
                    className="break-all text-brand-700 hover:underline"
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {provider.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </dd>
              </div>
            )}
            {provider.hourlyRateAwg !== null && (
              <div>
                <dt className="font-semibold text-slate-500">{t("directory.filterPrice")}</dt>
                <dd className="font-bold text-brand-800">
                  {t("provider.hourlyFrom")} {formatAwg(provider.hourlyRateAwg)}
                  {t("provider.perHour")}
                </dd>
              </div>
            )}
          </dl>
          <Link
            href={`/book?provider=${provider.slug}&category=${provider.categories[0]}`}
            className="btn-primary w-full"
          >
            {t("provider.book")} →
          </Link>
        </aside>
      </div>
    </div>
  );
}
