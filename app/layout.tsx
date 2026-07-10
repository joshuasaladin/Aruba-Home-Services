import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/config";
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
  const locale = await getLocale();

  return (
    <html lang={locale === "pap" ? "pap" : locale}>
      <body className="antialiased">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
