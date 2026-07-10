import { Metadata } from "next";
import { OnboardingForm } from "@/components/OnboardingForm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "List your business" };

export default async function OnboardingPage() {
  const t = await getT();
  const [categories, user] = await Promise.all([
    getDb().listCategories(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">🏝 {t("onboard.title")}</h1>
      <p className="mt-2 text-slate-600">{t("onboard.subtitle")}</p>
      <div className="mt-8">
        <OnboardingForm categories={categories} user={user} />
      </div>
    </div>
  );
}
