import { isSupabaseConfigured } from "@/lib/config";
import { demoService } from "./demo-service";
import { supabaseService } from "./supabase-service";
import type { DataService } from "./types";

/**
 * Returns the active data service:
 * - Supabase env vars present → real Postgres backend.
 * - Otherwise → demo mode (in-memory store seeded from data/aruba-providers-seed.json).
 */
export function getDb(): DataService {
  return isSupabaseConfigured() ? supabaseService : demoService;
}

export type { DataService, NewBooking } from "./types";
