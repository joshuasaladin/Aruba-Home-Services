import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured, SITE_NAME } from "@/lib/config";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Book trusted home-service pros on Aruba`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Every home-service company on Aruba in one place. Book electricians, plumbers, AC techs, cleaners and more — pay by bank transfer, no card needed.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  const demoMode = !isSupabaseConfigured();

  return (
    <html lang={locale === "pap" ? "pap" : locale}>
      <body className="flex min-h-screen flex-col">
        <LocaleProvider locale={locale}>
          <Header user={user} demoMode={demoMode} />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
