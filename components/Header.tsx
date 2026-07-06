"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";
import { useT } from "@/lib/i18n/LocaleProvider";
import { User } from "@/lib/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({
  user,
  demoMode,
}: {
  user: User | null;
  demoMode: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dashHref =
    user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/pro" : "/dashboard";
  const dashLabel =
    user?.role === "admin"
      ? t("nav.admin")
      : user?.role === "provider"
        ? t("nav.providerDashboard")
        : t("nav.dashboard");

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-brand-50 hover:text-brand-800 ${
        pathname === href ? "text-brand-700" : "text-slate-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {demoMode && (
        <div className="bg-sand-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
          {t("common.demoBanner")}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-brand-800">
            <span aria-hidden className="text-xl">🌴</span>
            <span>
              Aruba <span className="text-brand-600">Home Services</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLink("/providers", t("nav.findPro"))}
            {navLink("/#services", t("nav.services"))}
            {navLink("/#how-it-works", t("nav.howItWorks"))}
            {navLink("/pro/onboarding", t("nav.listBusiness"))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            {user ? (
              <>
                {navLink(dashHref, dashLabel)}
                <form action={logoutAction}>
                  <button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    {t("nav.logout")}
                  </button>
                </form>
              </>
            ) : (
              navLink("/login", t("nav.login"))
            )}
            <Link href="/book" className="btn-primary !px-4 !py-2 text-sm">
              {t("nav.bookNow")}
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-slate-300 p-2 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav aria-label="Mobile" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLink("/providers", t("nav.findPro"))}
              {navLink("/#services", t("nav.services"))}
              {navLink("/pro/onboarding", t("nav.listBusiness"))}
              {user ? (
                <>
                  {navLink(dashHref, dashLabel)}
                  <form action={logoutAction}>
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-500">
                      {t("nav.logout")}
                    </button>
                  </form>
                </>
              ) : (
                navLink("/login", t("nav.login"))
              )}
              <div className="flex items-center justify-between gap-2 pt-2">
                <LanguageSwitcher />
                <Link href="/book" onClick={() => setOpen(false)} className="btn-primary flex-1 text-sm">
                  {t("nav.bookNow")}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
