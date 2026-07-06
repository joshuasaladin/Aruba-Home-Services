"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold text-brand-800">
            <span aria-hidden>🌴</span> Aruba Home Services
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("footer.tagline")}</p>
          <p className="mt-3 text-xs text-slate-400">{t("common.awgNote")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
            {t("footer.forCustomers")}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-brand-700" href="/book">{t("nav.bookNow")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-700" href="/providers">{t("nav.findPro")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-700" href="/dashboard">{t("nav.dashboard")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
            {t("footer.forProviders")}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-brand-700" href="/pro/onboarding">{t("nav.listBusiness")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-700" href="/pro">{t("nav.providerDashboard")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
            {t("footer.language")}
          </p>
          <LanguageSwitcher />
          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} Aruba Home Services · Oranjestad, Aruba
          </p>
        </div>
      </div>
    </footer>
  );
}
