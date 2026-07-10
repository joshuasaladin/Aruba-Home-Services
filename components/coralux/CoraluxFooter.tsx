import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CoralGlyph, CoraluxLogo } from "./CoraluxLogo";

export function CoraluxFooter() {
  const email = process.env.CORALUX_CONTACT_EMAIL || "stay@coralux.aw";

  return (
    <footer id="contact" className="relative overflow-hidden bg-espresso-900 text-shell-200">
      {/* oversized coral watermark, echoing the logo's background */}
      <CoralGlyph className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] text-shell-50 opacity-[0.04]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <CoraluxLogo
              className="items-start text-xl text-shell-100"
              glyphClassName="text-lagoon-300"
            />
            <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-shell-200/70">
              Boutique villa management on Aruba. We host your guests, care for
              your home and grow your returns — so every stay feels effortless,
              on both sides of the door.
            </p>
          </div>

          <nav aria-label="Coralux footer" className="font-body text-sm">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-dune-300">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {[
                { href: "/coralux/villas", label: "Villa collection" },
                { href: "/coralux#services", label: "Guest services" },
                { href: "/coralux#owners", label: "For homeowners" },
                { href: "/coralux#aruba", label: "Discover Aruba" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-shell-200/80 transition-colors hover:text-lagoon-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="font-body text-sm">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-dune-300">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 text-shell-200/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-300" aria-hidden />
                J.E. Irausquin Blvd, Palm Beach, Aruba
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 transition-colors hover:text-lagoon-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-lagoon-300" aria-hidden />
                  {email}
                </a>
              </li>
              <li>
                <a
                  href="tel:+2975860000"
                  className="flex items-center gap-3 transition-colors hover:text-lagoon-300"
                >
                  <Phone className="h-4 w-4 shrink-0 text-lagoon-300" aria-hidden />
                  +297 586 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-shell-50/10 pt-8 font-body text-xs tracking-wide text-shell-200/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Coralux VBA · Oranjestad, Aruba</p>
          <p>
            Reservations powered by{" "}
            <a
              href="https://www.guesty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shell-200/70 underline-offset-4 transition-colors hover:text-lagoon-300 hover:underline"
            >
              Guesty
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
