import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";

// Chrome for the Aruba Home Services marketplace. Routes outside this group
// (e.g. /coralux) render their own header/footer.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const demoMode = !isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} demoMode={demoMode} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
