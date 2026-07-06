#!/usr/bin/env node
/**
 * Imports data/aruba-providers-seed.json (34 real Aruba companies) + the service
 * categories into your Supabase database.
 *
 * Usage:
 *   1. Run supabase/migrations/0001_init.sql in the Supabase SQL editor first.
 *   2. Put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run import-seed
 *
 * Safe to re-run: providers are upserted by slug, categories by slug.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env.local loader (no dotenv dependency needed).
for (const file of [".env.local", ".env"]) {
  const p = join(root, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.\n" +
      "(The service-role key is under Supabase → Project Settings → API.)"
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(
  readFileSync(join(root, "data", "aruba-providers-seed.json"), "utf8")
);

const CATEGORIES = [
  { slug: "electrician", icon: "⚡", price_min_awg: 90, price_max_awg: 450, sort_order: 1 },
  { slug: "plumber", icon: "🔧", price_min_awg: 80, price_max_awg: 400, sort_order: 2 },
  { slug: "ac_repair", icon: "❄️", price_min_awg: 120, price_max_awg: 900, sort_order: 3 },
  { slug: "pool_cleaning", icon: "🏊", price_min_awg: 100, price_max_awg: 350, sort_order: 4 },
  { slug: "landscaping", icon: "🌴", price_min_awg: 90, price_max_awg: 600, sort_order: 5 },
  { slug: "house_cleaning", icon: "🧹", price_min_awg: 70, price_max_awg: 300, sort_order: 6 },
  { slug: "pest_control", icon: "🐜", price_min_awg: 110, price_max_awg: 500, sort_order: 7 },
  { slug: "handyman", icon: "🛠️", price_min_awg: 60, price_max_awg: 350, sort_order: 8 },
  { slug: "appliance_repair", icon: "🧊", price_min_awg: 90, price_max_awg: 450, sort_order: 9 },
  { slug: "moving", icon: "🚚", price_min_awg: 150, price_max_awg: 1200, sort_order: 10 },
];

const NEIGHBORHOODS = [
  "Oranjestad", "Noord", "Palm Beach", "Eagle Beach",
  "San Nicolas", "Santa Cruz", "Paradera", "Savaneta",
];

const slugify = (name) =>
  name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const neighborhoodOf = (address = "") =>
  NEIGHBORHOODS.find((n) => address.toLowerCase().includes(n.toLowerCase())) ?? "Island-wide";

async function main() {
  console.log("→ Importing categories…");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "slug" });
  if (catErr) throw new Error(`categories: ${catErr.message}`);
  console.log(`  ${CATEGORIES.length} categories upserted.`);

  console.log("→ Importing providers…");
  const seen = new Set();
  const rows = seed.providers.map((p, i) => {
    let slug = slugify(p.name);
    while (seen.has(slug)) slug = `${slug}-${i}`;
    seen.add(slug);
    const years = p.notes?.match(/(\d+)\+? years/i);
    return {
      slug,
      name: p.name,
      categories: p.category,
      phone: p.phone || "",
      address: p.address || "Aruba",
      neighborhood: neighborhoodOf(p.address),
      website: p.website || "",
      bio:
        p.notes ||
        `${p.name} serves homes and businesses across Aruba. Contact details are being verified.`,
      verified: Boolean(p.verified),
      status: "approved", // listed in the directory; admin toggles "verified"
      years_in_business: years ? parseInt(years[1], 10) : null,
    };
  });

  const { error: provErr } = await supabase
    .from("providers")
    .upsert(rows, { onConflict: "slug" });
  if (provErr) throw new Error(`providers: ${provErr.message}`);
  console.log(`  ${rows.length} providers upserted.`);
  console.log("✓ Seed import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});
