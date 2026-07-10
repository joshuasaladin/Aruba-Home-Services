import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarCheck,
  Check,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/coralux/Reveal";
import { SceneImage } from "@/components/coralux/SceneImage";
import { formatNightly } from "@/components/coralux/VillaCard";
import { getListing } from "@/lib/guesty";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const villa = await getListing(id);
  if (!villa) return { title: "Villa not found" };
  return {
    title: villa.title,
    description: villa.summary.slice(0, 155),
  };
}

export default async function VillaDetailPage({ params }: Props) {
  const { id } = await params;
  const villa = await getListing(id);
  if (!villa) notFound();

  const email = process.env.CORALUX_CONTACT_EMAIL || "stay@coralux.aw";
  const inquiryHref = `mailto:${email}?subject=${encodeURIComponent(
    `Stay inquiry — ${villa.title}`
  )}`;
  const gallery = villa.images.slice(0, 3);

  const facts = [
    { icon: BedDouble, label: `${villa.bedrooms} bedrooms` },
    { icon: Bath, label: `${villa.bathrooms} bathrooms` },
    { icon: Users, label: `Sleeps ${villa.guests}` },
    { icon: CalendarCheck, label: `${villa.minNights}-night minimum` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-32 lg:px-8">
      <Reveal>
        <Link
          href="/coralux/villas"
          className="group inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.16em] text-lagoon-700 transition-colors hover:text-lagoon-800"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          All villas
        </Link>
      </Reveal>

      {/* Gallery */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr] md:grid-rows-2">
          <SceneImage
            src={gallery[0] ?? ""}
            alt={villa.title}
            variant="sea"
            priority
            sizes="(min-width: 768px) 66vw, 100vw"
            className="aspect-[16/10] rounded-3xl md:row-span-2 md:aspect-auto md:min-h-[520px]"
          />
          <SceneImage
            src={gallery[1] ?? ""}
            alt={`${villa.title} — interior`}
            variant="sand"
            sizes="(min-width: 768px) 33vw, 100vw"
            className="hidden aspect-[16/10] rounded-3xl md:block md:aspect-auto"
          />
          <SceneImage
            src={gallery[2] ?? ""}
            alt={`${villa.title} — outdoor living`}
            variant="dusk"
            sizes="(min-width: 768px) 33vw, 100vw"
            className="hidden aspect-[16/10] rounded-3xl md:block md:aspect-auto"
          />
        </div>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
        {/* Details */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-[0.24em] text-lagoon-600">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {villa.area} · Aruba
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-espresso-900 sm:text-5xl">
              {villa.title}
            </h1>

            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-y border-espresso-800/10 py-5 font-body text-sm text-espresso-700">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  <f.icon className="h-4.5 w-4.5 text-lagoon-600" aria-hidden />
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-7 max-w-2xl font-body text-lg font-light leading-relaxed text-espresso-700">
              {villa.summary}
            </p>
          </Reveal>

          {villa.amenities.length > 0 && (
            <Reveal delay={0.1}>
              <h2 className="mt-12 font-display text-2xl font-semibold text-espresso-900">
                Amenities
              </h2>
              <ul className="mt-6 grid gap-x-8 gap-y-3.5 font-body text-[15px] text-espresso-700 sm:grid-cols-2">
                {villa.amenities.slice(0, 12).map((a) => (
                  <li key={a} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lagoon-100">
                      <Check className="h-3.5 w-3.5 text-lagoon-700" aria-hidden />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        {/* Booking card */}
        <Reveal delay={0.15}>
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-espresso-800/10 bg-shell-50 p-8 shadow-lg">
              <p className="font-body text-sm text-espresso-500">
                from{" "}
                <span className="font-display text-3xl font-semibold text-espresso-900">
                  {formatNightly(villa.basePrice, villa.currency)}
                </span>{" "}
                / night
              </p>
              <p className="mt-2 font-body text-xs uppercase tracking-[0.16em] text-espresso-300">
                {villa.minNights}-night minimum · taxes at checkout
              </p>

              {villa.bookingUrl ? (
                <a
                  href={villa.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-lagoon-700 px-6 py-4 font-body text-sm font-semibold uppercase tracking-[0.14em] text-shell-50 shadow-md transition-all duration-300 hover:bg-lagoon-800 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-700"
                >
                  Check availability
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <a
                  href={inquiryHref}
                  className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-lagoon-700 px-6 py-4 font-body text-sm font-semibold uppercase tracking-[0.14em] text-shell-50 shadow-md transition-all duration-300 hover:bg-lagoon-800 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-700"
                >
                  Request dates
                </a>
              )}

              <a
                href={inquiryHref}
                className="mt-3.5 flex w-full cursor-pointer items-center justify-center rounded-full border border-espresso-800/15 px-6 py-4 font-body text-sm font-semibold uppercase tracking-[0.14em] text-espresso-700 transition-all duration-300 hover:border-lagoon-600 hover:text-lagoon-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-700"
              >
                Ask a host
              </a>

              <p className="mt-6 border-t border-espresso-800/8 pt-5 text-center font-body text-xs leading-relaxed text-espresso-300">
                {villa.bookingUrl
                  ? "Secure booking via our Guesty reservation system."
                  : "A Coralux host replies within a few hours, island time."}
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
