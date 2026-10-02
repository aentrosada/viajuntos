import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TripPanel } from "@/components/trips/TripPanel";
import { MemberProgress } from "@/components/group/MemberProgress";
import { GroupSummary } from "@/components/group/GroupSummary";
import type { Database } from "@/types/database";

type TripRow = Database["public"]["Tables"]["trips"]["Row"];
type TripItemRow = Database["public"]["Tables"]["trip_items"]["Row"];
type MemberProgressRow = Database["public"]["Views"]["member_progress"]["Row"];
type ContributionRow = Database["public"]["Tables"]["contributions"]["Row"];

interface ContributionWithProfile extends ContributionRow {
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("name, destination, emoji")
    .eq("id", id)
    .single();

  if (!data) return { title: "Viagem — ViaJuntos" };

  return {
    title: `${data.emoji ?? "✈️"} ${data.name} · ViaJuntos`,
    description: `Planejamento e poupança para ${data.destination}`,
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all data in parallel
  const [tripRes, membersRes, itemsRes, contributionsRes] = await Promise.all([
    supabase.from("trips").select("*").eq("id", id).single(),
    supabase
      .from("member_progress")
      .select("*")
      .eq("trip_id", id)
      .order("contributed_amount", { ascending: false }),
    supabase
      .from("trip_items")
      .select("*")
      .eq("trip_id", id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("contributions")
      .select("*, profiles(full_name, avatar_url)")
      .eq("trip_id", id)
      .eq("status", "approved")
      .order("confirmed_at", { ascending: false })
      .limit(20),
  ]);

  if (tripRes.error || !tripRes.data) {
    notFound();
  }

  const trip = tripRes.data as TripRow;
  const members = (membersRes.data ?? []) as MemberProgressRow[];
  const items = (itemsRes.data ?? []) as TripItemRow[];
  const contributions = (contributionsRes.data ?? []) as ContributionWithProfile[];

  // Compute group total
  const totalContributed = members.reduce(
    (sum, m) => sum + (m.contributed_amount ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Trip panel handles its own cover, header and content */}
      <TripPanel
        trip={{
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          emoji: trip.emoji,
          cover_image_url: trip.cover_image_url,
          start_date: trip.start_date,
          end_date: trip.end_date,
          total_budget: trip.total_budget,
          status: trip.status,
        }}
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          amount: i.amount,
          paid_amount: i.paid_amount,
          description: i.description,
          external_url: i.external_url,
          status: i.status,
          item_date: i.item_date,
        }))}
        contributions={contributions.map((c) => ({
          id: c.id,
          amount: c.amount,
          confirmed_at: c.confirmed_at,
          created_at: c.created_at,
          profiles: c.profiles,
        }))}
        members={members.map((m) => ({
          user_id: m.user_id,
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          contributed_amount: m.contributed_amount,
          target_amount: m.target_amount,
          progress_pct: m.progress_pct,
        }))}
        totalContributed={totalContributed}
      />

      {/* Sidebar-style sections below the panel on larger screens */}
      <div className="max-w-2xl mx-auto px-4 pb-10 space-y-4 -mt-2">
        <GroupSummary
          totalContributed={totalContributed}
          totalBudget={trip.total_budget}
          memberCount={members.length}
        />

        <MemberProgress members={members.map((m) => ({
          user_id: m.user_id,
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          contributed_amount: m.contributed_amount,
          target_amount: m.target_amount,
          progress_pct: m.progress_pct,
        }))} />
      </div>
    </main>
  );
}
