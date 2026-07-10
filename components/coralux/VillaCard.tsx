import Link from "next/link";
import { Bath, BedDouble, MapPin, Users } from "lucide-react";
import type { CoraluxListing } from "@/lib/guesty";
import { SceneImage } from "./SceneImage";

export function formatNightly(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function VillaCard({
  villa,
  priority = false,
}: {
  villa: CoraluxListing;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/coralux/villas/${villa.id}`}
      className="group block cursor-pointer overflow-hidden rounded-3xl border border-espresso-800/8 bg-shell-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon-700"
    >
      <div className="relative">
        <SceneImage
          src={villa.images[0] ?? ""}
          alt={villa.title}
          variant="sea"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="aspect-[4/3]"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-shell-50/90 px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-espresso-800 backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5 text-lagoon-600" aria-hidden />
          {villa.area}
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-display text-xl font-semibold leading-snug text-espresso-800 transition-colors duration-200 group-hover:text-lagoon-700">
          {villa.title}
        </h3>

        <div className="mt-4 flex items-center gap-5 font-body text-sm text-espresso-500">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-lagoon-500" aria-hidden />
            {villa.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-lagoon-500" aria-hidden />
            {villa.bathrooms} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-lagoon-500" aria-hidden />
            {villa.guests} guests
          </span>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-espresso-800/8 pt-5">
          <p className="font-body text-sm text-espresso-500">
            from{" "}
            <span className="font-display text-lg font-semibold text-espresso-800">
              {formatNightly(villa.basePrice, villa.currency)}
            </span>{" "}
            / night
          </p>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-600 transition-transform duration-300 group-hover:translate-x-1">
            View villa →
          </span>
        </div>
      </div>
    </Link>
  );
}
