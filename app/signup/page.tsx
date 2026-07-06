import { Metadata } from "next";
import { SignupForm } from "@/components/AuthForms";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : undefined;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SignupForm demoMode={!isSupabaseConfigured()} next={safeNext} />
    </div>
  );
}
