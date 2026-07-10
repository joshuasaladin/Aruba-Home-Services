"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoraluxLogo } from "./CoraluxLogo";

const NAV = [
  { href: "/coralux/villas", label: "Villas" },
  { href: "/coralux#services", label: "Services" },
  { href: "/coralux#aruba", label: "The Island" },
  { href: "/coralux#owners", label: "Homeowners" },
];

/**
 * Fixed liquid-glass header: transparent over the hero, frosted shell once
 * the page scrolls.
 */
export function CoraluxHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Inner pages have no full-bleed hero behind the header — always frost there.
  const overHero = pathname === "/coralux";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const frosted = scrolled || open || !overHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        frosted
          ? "border-b border-espresso-800/10 bg-shell-100/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <CoraluxLogo
          className="text-[15px] text-espresso-800 sm:text-base"
          withTagline={false}
        />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Coralux">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-body text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
                pathname === item.href
                  ? "text-lagoon-700"
                  : "text-espresso-700 hover:text-lagoon-700"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/coralux/villas"
            className="cursor-pointer rounded-full bg-lagoon-700 px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.14em] text-shell-50 shadow-sm transition-all duration-300 hover:bg-lagoon-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-700"
          >
            Book a stay
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="cursor-pointer rounded-full p-2.5 text-espresso-800 transition-colors hover:bg-espresso-800/5 md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Coralux mobile"
          className="border-t border-espresso-800/10 bg-shell-100/95 px-4 pb-6 pt-2 backdrop-blur-xl md:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-espresso-800/5 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.18em] text-espresso-800"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/coralux/villas"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-lagoon-700 px-6 py-3 text-center font-body text-sm font-semibold uppercase tracking-[0.14em] text-shell-50"
          >
            Book a stay
          </Link>
        </nav>
      )}
    </header>
  );
}
