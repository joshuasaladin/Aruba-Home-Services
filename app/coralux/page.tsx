import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Compass,
  ConciergeBell,
  KeyRound,
  Quote,
  ShieldCheck,
  Sun,
  TrendingUp,
  Waves,
  Wrench,
} from "lucide-react";
import { CoralGlyph } from "@/components/coralux/CoraluxLogo";
import { Reveal } from "@/components/coralux/Reveal";
import { SceneImage } from "@/components/coralux/SceneImage";
import { VillaCard } from "@/components/coralux/VillaCard";
import { getListings, isGuestyConfigured } from "@/lib/guesty";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80";

const SERVICES = [
  {
    icon: ConciergeBell,
    n: "01",
    title: "Guest concierge",
    body: "Private chefs, catamaran charters, in-villa spa days — one message to your Coralux host and it's arranged.",
  },
  {
    icon: KeyRound,
    n: "02",
    title: "Seamless arrivals",
    body: "Airport pickup, chilled welcome amenities and a home that's spotless, stocked and glowing before you land.",
  },
  {
    icon: Wrench,
    n: "03",
    title: "Meticulous care",
    body: "Weekly inspections, trusted island technicians and preventive maintenance in the salt-air climate.",
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Revenue that grows",
    body: "Dynamic pricing tuned to Aruba's seasons, professional photography and listings everywhere guests search.",
  },
];

const ISLAND_SPOTS = [
  {
    img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    title: "Eagle Beach",
    body: "Powder-white sand and the island's iconic fofoti trees, minutes from your door.",
    icon: Sun,
  },
  {
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    title: "Boca Catalina",
    body: "Turquoise snorkeling coves where turtles drift past before breakfast.",
    icon: Waves,
  },
  {
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
    title: "Arikok National Park",
    body: "Desert trails, hidden pools and cactus sunsets across a fifth of the island.",
    icon: Compass,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The villa was flawless, but it's the people we remember — our host had sunset sails and a private chef arranged before we even asked.",
    name: "Claire & Tom V.",
    detail: "Casa Corales · Amsterdam",
  },
  {
    quote:
      "As owners living abroad, we finally sleep easy. Monthly statements are transparent, the house is immaculate, and our returns are up 40%.",
    name: "The Jansen Family",
    detail: "Homeowners since 2022",
  },
  {
    quote:
      "Ten days at Eagle Dunes with three generations in tow — Coralux made it feel effortless. We rebooked for next year on the drive to the airport.",
    name: "Marisol R.",
    detail: "Eagle Dunes · Bogotá",
  },
];

export default async function CoraluxHomePage() {
  const listings = await getListings();
  const featured = listings.slice(0, 3);
  const email = process.env.CORALUX_CONTACT_EMAIL || "stay@coralux.aw";

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[94svh] items-center justify-center overflow-hidden">
        <SceneImage
          src={HERO_IMAGE}
          alt="Turquoise Caribbean water meeting white sand on an Aruba beach"
          variant="sea"
          priority
          className="absolute inset-0"
        />
        {/* scrim for legibility + soft blend into the page below */}
        <div className="absolute inset-0 bg-gradient-to-b from-lagoon-900/60 via-lagoon-800/40 to-shell-100" />

        <div className="relative mx-auto max-w-4xl px-4 pb-40 pt-36 text-center sm:px-6">
          <Reveal>
            <p className="inline-flex items-center gap-3 rounded-full border border-shell-50/30 bg-shell-50/10 px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.3em] text-shell-50 backdrop-blur-md">
              <CoralGlyph className="h-4 w-4 text-dune-300" />
              Aruba · Dutch Caribbean
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <h1 className="mt-8 font-display text-4xl font-semibold leading-tight tracking-wide text-shell-50 drop-shadow-sm sm:text-6xl md:text-7xl">
              Barefoot Luxury on
              <br />
              <span className="text-dune-300">One Happy Island</span>
            </h1>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg font-light leading-relaxed text-shell-100/95 sm:text-xl">
              Coralux curates and cares for Aruba&rsquo;s finest private villas —
              hosted like a boutique hotel, managed like your own.
            </p>
          </Reveal>
          <Reveal delay={0.36}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/coralux/villas"
                className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-lagoon-600 px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-shell-50 shadow-lg shadow-lagoon-900/30 transition-all duration-300 hover:bg-lagoon-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shell-50"
              >
                Explore the villas
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#owners"
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-shell-50/40 bg-shell-50/10 px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-shell-50 backdrop-blur-md transition-all duration-300 hover:border-shell-50/70 hover:bg-shell-50/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shell-50"
              >
                Own a home here?
              </Link>
            </div>
          </Reveal>
        </div>

        {/* glass stat strip */}
        <div className="absolute inset-x-0 bottom-10 hidden justify-center px-6 md:flex">
          <Reveal delay={0.5} className="w-full max-w-4xl">
            <dl className="grid grid-cols-4 divide-x divide-shell-50/15 rounded-2xl border border-shell-50/20 bg-espresso-900/45 py-6 text-center text-shell-50 shadow-2xl backdrop-blur-xl">
              {[
                ["25+", "Villas under care"],
                ["4.9★", "Guest rating"],
                ["92%", "Peak occupancy"],
                ["24/7", "Island concierge"],
              ].map(([value, label]) => (
                <div key={label} className="px-4">
                  <dt className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-shell-100/70">
                    {label}
                  </dt>
                  <dd className="mt-1.5 font-display text-3xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Featured villas ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-600">
              The Collection
            </p>
            <h2 className="mt-4 max-w-xl text-balance font-display text-3xl font-semibold leading-tight text-espresso-900 sm:text-5xl">
              Villas worth crossing an ocean for
            </h2>
          </div>
          <Link
            href="/coralux/villas"
            className="group inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.16em] text-lagoon-700 transition-colors hover:text-lagoon-800"
          >
            View all villas
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((villa, i) => (
            <Reveal key={villa.id} delay={i * 0.1}>
              <VillaCard villa={villa} priority={i === 0} />
            </Reveal>
          ))}
        </div>

        {!isGuestyConfigured() && (
          <Reveal delay={0.2}>
            <p className="mt-10 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-6 py-4 text-center font-body text-sm text-lagoon-800">
              Showing sample villas — add your{" "}
              <code className="rounded bg-lagoon-100 px-1.5 py-0.5 font-semibold">GUESTY_CLIENT_ID</code>{" "}
              and{" "}
              <code className="rounded bg-lagoon-100 px-1.5 py-0.5 font-semibold">GUESTY_CLIENT_SECRET</code>{" "}
              to <code className="rounded bg-lagoon-100 px-1.5 py-0.5 font-semibold">.env.local</code>{" "}
              and your live Guesty listings appear here automatically.
            </p>
          </Reveal>
        )}
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="scroll-mt-24 bg-shell-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-600">
              The Coralux Standard
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-espresso-900 sm:text-5xl">
              Hospitality in every detail
            </h2>
            <p className="mt-5 font-body text-lg font-light leading-relaxed text-espresso-500">
              A boutique team on the ground in Noord, hosting every stay the way
              the island greets you — warmly, and without a single worry.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="group h-full rounded-3xl border border-espresso-800/8 bg-shell-100 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-lagoon-300 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700 transition-colors duration-300 group-hover:bg-lagoon-600 group-hover:text-shell-50">
                      <s.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-display text-sm tracking-[0.2em] text-espresso-300">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-espresso-900">
                    {s.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-espresso-500">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── The island ───────────────────────────────────────────────────── */}
      <section id="aruba" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0">
          <SceneImage
            src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2400&q=80"
            alt="Deep turquoise Caribbean sea"
            variant="dusk"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-espresso-900/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-dune-300">
              Discover Aruba
            </p>
            <h2 className="mt-4 text-balance text-balance font-display text-3xl font-semibold leading-tight text-shell-50 sm:text-5xl">
              Seventy square miles of sunshine
            </h2>
            <p className="mt-5 font-body text-lg font-light leading-relaxed text-shell-100/85">
              Outside the hurricane belt, 28°C year-round, and the friendliest
              corner of the Caribbean. Every Coralux villa comes with our
              insiders&rsquo; map of it.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {ISLAND_SPOTS.map((spot, i) => (
              <Reveal key={spot.title} delay={i * 0.1}>
                <div className="group overflow-hidden rounded-3xl border border-shell-50/15 bg-shell-50/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-shell-50/15">
                  <SceneImage
                    src={spot.img}
                    alt={spot.title}
                    variant="sea"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="aspect-[16/10]"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="p-7">
                    <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold text-shell-50">
                      <spot.icon className="h-5 w-5 text-dune-300" aria-hidden />
                      {spot.title}
                    </h3>
                    <p className="mt-2.5 font-body text-sm leading-relaxed text-shell-100/80">
                      {spot.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Homeowners ───────────────────────────────────────────────────── */}
      <section id="owners" className="scroll-mt-24 bg-shell-100 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <Reveal>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-600">
              For Homeowners
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-espresso-900 sm:text-5xl">
              Your villa, in devoted hands
            </h2>
            <p className="mt-5 max-w-xl font-body text-lg font-light leading-relaxed text-espresso-500">
              We treat a handful of exceptional homes to the full Coralux
              standard — never a portfolio number, always a name we know.
            </p>

            <ul className="mt-9 space-y-4 font-body text-espresso-700">
              {[
                { icon: ShieldCheck, text: "Full-service care: housekeeping, maintenance, bills and insurance runs" },
                { icon: CalendarCheck, text: "Live calendar, dynamic pricing and guest vetting — synced on Guesty" },
                { icon: TrendingUp, text: "Transparent monthly statements and owner portal, wherever you live" },
                { icon: ConciergeBell, text: "Five-star hosting that earns the reviews (and the repeat guests)" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lagoon-100 text-lagoon-700">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>

            <a
              href={`mailto:${email}?subject=Property management proposal — Coralux`}
              className="group mt-10 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-espresso-800 px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-shell-50 shadow-md transition-all duration-300 hover:bg-espresso-900 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso-800"
            >
              Request a proposal
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="grid grid-cols-2 gap-5">
              <SceneImage
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                alt="Modern villa exterior at golden hour"
                variant="sand"
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="mt-10 aspect-[3/4] rounded-3xl shadow-xl"
              />
              <SceneImage
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80"
                alt="Villa pool terrace with loungers"
                variant="sea"
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="aspect-[3/4] rounded-3xl shadow-xl"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-2xl border border-espresso-800/10 bg-shell-50/90 px-7 py-4 text-center shadow-lg backdrop-blur-md">
              <p className="font-display text-2xl font-semibold text-lagoon-700">+40%</p>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-espresso-500">
                avg. owner revenue, year one
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="bg-shell-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-600">
              Guest Book
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-espresso-900 sm:text-5xl">
              Stories from the shore
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <figure className="flex h-full flex-col rounded-3xl border border-espresso-800/8 bg-shell-100 p-8">
                  <Quote className="h-7 w-7 text-lagoon-300" aria-hidden />
                  <blockquote className="mt-5 flex-1 font-body text-[15px] leading-relaxed text-espresso-700">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-7 border-t border-espresso-800/8 pt-5">
                    <p className="font-display text-sm font-semibold tracking-wide text-espresso-900">
                      {t.name}
                    </p>
                    <p className="mt-1 font-body text-xs uppercase tracking-[0.16em] text-lagoon-600">
                      {t.detail}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-lagoon-800 py-24 md:py-28">
        <CoralGlyph className="pointer-events-none absolute -left-20 -bottom-24 h-[380px] w-[380px] text-shell-50 opacity-[0.05]" />
        <CoralGlyph className="pointer-events-none absolute -right-16 -top-20 h-[300px] w-[300px] text-shell-50 opacity-[0.05]" />
        <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-shell-50 sm:text-5xl">
            Your island story begins here
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg font-light leading-relaxed text-lagoon-100">
            Tell us the dates and who&rsquo;s coming — we&rsquo;ll match you with
            the villa (and the sunsets) to fit.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/coralux/villas"
              className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-shell-50 px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-lagoon-800 shadow-lg transition-all duration-300 hover:bg-shell-100 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shell-50"
            >
              Browse the collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href={`mailto:${email}?subject=Planning our Aruba stay`}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-shell-50/40 px-8 py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-shell-50 transition-all duration-300 hover:border-shell-50/80 hover:bg-shell-50/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shell-50"
            >
              Talk to a host
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
