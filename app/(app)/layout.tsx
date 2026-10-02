import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const userInfo = {
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    email: user.email,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar (hidden on mobile) ──────────────── */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64">
        <Sidebar user={userInfo} />
      </div>

      {/* ── Main content area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Top navbar (desktop: actions bar; mobile: hidden — bottom tab bar used instead) */}
        <Navbar user={userInfo} />

        {/* Page content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Sonner toast notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
