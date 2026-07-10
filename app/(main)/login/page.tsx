import { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : undefined;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <LoginForm demoMode={!isSupabaseConfigured()} next={safeNext} />
    </div>
  );
}
