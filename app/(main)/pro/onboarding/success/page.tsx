import { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Application received" };

export default async function OnboardingSuccessPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8 text-center">
        <p aria-hidden className="text-5xl">📨</p>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
          {t("onboard.successTitle")}
        </h1>
        <p className="mt-3 text-slate-600">{t("onboard.successBody")}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/pro" className="btn-primary">
            {t("nav.providerDashboard")} →
          </Link>
          <Link href="/" className="btn-secondary">← Home</Link>
        </div>
      </div>
    </div>
  );
}
