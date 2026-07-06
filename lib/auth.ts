// Auth abstraction. Demo mode: signed-in user id lives in an httpOnly cookie and
// users live in the in-memory store. Supabase mode: real Supabase Auth session.
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/config";
import { getDb } from "@/lib/data";
import { User } from "@/lib/types";

export const DEMO_SESSION_COOKIE = "ahs_demo_uid";

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    const store = await cookies();
    const uid = store.get(DEMO_SESSION_COOKIE)?.value;
    if (!uid) return null;
    return getDb().getUserById(uid);
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Profile row is created by a DB trigger on signup; fall back gracefully.
  const profile = await getDb().getUserById(user.id);
  if (profile) return profile;
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string) ?? user.email ?? "Customer",
    role: "customer",
    createdAt: user.created_at,
  };
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireRole(role: User["role"]): Promise<User> {
  const user = await requireUser();
  if (user.role !== role && user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return user;
}
