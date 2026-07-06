import { NextResponse } from "next/server";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login", SITE_URL));
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  });
  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login", SITE_URL));
  }
  return NextResponse.redirect(data.url);
}
