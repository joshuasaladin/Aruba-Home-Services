// Central config. Everything degrades gracefully when env vars are missing so the
// app always runs in demo mode with `npm run dev` and zero credentials.

export const AWG_PER_USD = 1.79; // Aruban florin is pegged to the US dollar

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Bank transfer details printed on every invoice. Override via env vars. */
export function getBankDetails() {
  return {
    bankName: process.env.INVOICE_BANK_NAME || "Aruba Bank N.V.",
    accountName:
      process.env.INVOICE_BANK_ACCOUNT_NAME || "Aruba Home Services VBA",
    accountNumber: process.env.INVOICE_BANK_ACCOUNT_NUMBER || "3200.4567.89",
    iban: process.env.INVOICE_BANK_IBAN || "AW42 ARUB 3200 4567 89",
    swift: process.env.INVOICE_BANK_SWIFT || "ARUBAWAX",
  };
}

export const SITE_NAME = "Aruba Home Services";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const NEIGHBORHOODS = [
  "Oranjestad",
  "Noord",
  "Palm Beach",
  "Eagle Beach",
  "San Nicolas",
  "Santa Cruz",
  "Paradera",
  "Savaneta",
  "Island-wide",
] as const;

export type Neighborhood = (typeof NEIGHBORHOODS)[number];
