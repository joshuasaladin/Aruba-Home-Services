import { Metadata } from "next";
import { BookingWizard } from "@/components/BookingWizard";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { getDb } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Book a service" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; provider?: string }>;
}) {
  const sp = await searchParams;
  const t = await getT();
  const db = getDb();
  const [categories, providers, user] = await Promise.all([
    db.listCategories(),
    db.listProviders({}),
    getCurrentUser(),
  ]);

  const initialCategory = categories.some((c) => c.slug === sp.category)
    ? sp.category
    : undefined;
  const initialProvider = sp.provider
    ? providers.find((p) => p.slug === sp.provider)
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-extrabold text-slate-900">
        {t("book.title")}
      </h1>
      <BookingWizard
        categories={categories}
        providers={providers}
        user={user}
        demoMode={!isSupabaseConfigured()}
        initialCategory={initialCategory}
        initialProviderId={initialProvider?.id}
      />
    </div>
  );
}
