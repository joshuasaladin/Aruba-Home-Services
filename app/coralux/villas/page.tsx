import type { Metadata } from "next";
import { Reveal } from "@/components/coralux/Reveal";
import { VillaCard } from "@/components/coralux/VillaCard";
import { getListings, isGuestyConfigured } from "@/lib/guesty";

export const metadata: Metadata = {
  title: "The Villa Collection",
  description:
    "Every Coralux villa on Aruba — oceanfront estates in Malmok, Palm Beach retreats, Eagle Beach penthouses and hidden south-shore escapes.",
};

export default async function VillasPage() {
  const listings = await getListings();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 md:pb-32 md:pt-40 lg:px-8">
      <Reveal className="max-w-2xl">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-600">
          The Collection
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-espresso-900 sm:text-6xl">
          Find your place in the sun
        </h1>
        <p className="mt-5 font-body text-lg font-light leading-relaxed text-espresso-500">
          {listings.length} private villas and residences, each hosted to the
          Coralux standard. From Malmok&rsquo;s snorkeling coves to the quiet
          piers of Savaneta.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((villa, i) => (
          <Reveal key={villa.id} delay={Math.min(i, 5) * 0.08}>
            <VillaCard villa={villa} priority={i < 3} />
          </Reveal>
        ))}
      </div>

      {!isGuestyConfigured() && (
        <Reveal delay={0.2}>
          <p className="mt-12 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-6 py-4 text-center font-body text-sm text-lagoon-800">
            These are sample villas. Connect your Guesty account (see{" "}
            <code className="rounded bg-lagoon-100 px-1.5 py-0.5 font-semibold">.env.example</code>
            ) and your live listings, photos and nightly rates replace them
            automatically.
          </p>
        </Reveal>
      )}
    </div>
  );
}
