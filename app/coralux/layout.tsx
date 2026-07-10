import type { Metadata } from "next";
import { Cinzel, Josefin_Sans } from "next/font/google";
import { CoraluxFooter } from "@/components/coralux/CoraluxFooter";
import { CoraluxHeader } from "@/components/coralux/CoraluxHeader";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    // `absolute` opts out of the root layout's "· Aruba Home Services" template.
    absolute: "Coralux — Luxury Villa Rentals & Property Management on Aruba",
    template: "%s · Coralux Aruba",
  },
  description:
    "Coralux manages Aruba's finest vacation villas — Palm Beach, Eagle Beach, Malmok and beyond. Boutique guest service for travelers, full-service property management for homeowners.",
};

export default function CoraluxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cinzel.variable} ${josefin.variable} coralux-type flex min-h-screen flex-col bg-shell-100 font-body text-espresso-800 selection:bg-lagoon-200 selection:text-espresso-900`}
    >
      <CoraluxHeader />
      <main className="flex-1">{children}</main>
      <CoraluxFooter />
    </div>
  );
}
