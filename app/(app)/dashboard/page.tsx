import { createClient } from "@/lib/supabase/server";
import { TripCard } from "@/components/trips/TripCard";
import type { TripSummaryRow } from "@/components/trips/TripCard";
import { formatCurrency } from "@/lib/utils";
import { Plane, PiggyBank, Calendar, Plus, MapPin } from "lucide-react";
import Link from "next/link";

// ─── Server-side data fetching ────────────────────────────────────────────────

async function getTrips(userId: string): Promise<TripSummaryRow[]> {
  const supabase = await createClient();

  // Get trip IDs user belongs to
  const { data: memberships } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const tripIds = memberships.map((m) => m.trip_id);

  const { data, error } = await supabase
    .from("trip_summary")
    .select("*")
    .in("trip_id", tripIds)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("[dashboard] trips fetch error:", error.message);
    return [];
  }

  return (data ?? []) as TripSummaryRow[];
}

// ─── Stats summary cards ──────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
}

function StatCard({ icon, label, value, sub, gradient }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 text-white ${gradient} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
        </div>
        <div className="p-2 rounded-xl bg-white/20">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="size-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-5 shadow-sm">
        <span className="text-4xl">🗺️</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Nenhuma viagem ainda
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
        Crie sua primeira viagem, defina o orçamento e comece a juntar com o grupo!
      </p>
      <Link
        href="/trips/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
      >
        <Plus className="size-4" />
        Criar primeira viagem
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // user is guaranteed by the layout redirect, but TypeScript needs narrowing
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Viajante";

  const trips = await getTrips(user.id);

  // ── Summary stats ──────────────────────────────────────────────────────────

  const totalTrips = trips.length;
  const totalSaved = trips.reduce((acc, t) => acc + (t.total_contributed ?? 0), 0);

  // Next upcoming trip (planning or active, with a future start_date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextTrip = trips
    .filter((t) => t.start_date && new Date(t.start_date) >= today && t.status !== "archived")
    .at(0);

  return (
    <div className="space-y-8">
      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalTrips > 0
              ? `Você tem ${totalTrips} viage${totalTrips === 1 ? "m" : "ns"} em andamento.`
              : "Pronto para planejar sua próxima aventura?"}
          </p>
        </div>
        <Link
          href="/trips/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="size-4" />
          Nova Viagem
        </Link>
      </div>

      {/* ── Summary stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Plane className="size-5 text-white" />}
          label="Total de Viagens"
          value={String(totalTrips)}
          sub={totalTrips === 0 ? "Crie a primeira!" : `${trips.filter(t => t.status === "active").length} ativa(s)`}
          gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
        />
        <StatCard
          icon={<PiggyBank className="size-5 text-white" />}
          label="Total Guardado"
          value={formatCurrency(totalSaved)}
          sub="somado entre todas as viagens"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<Calendar className="size-5 text-white" />}
          label="Próxima Viagem"
          value={nextTrip?.name ?? "—"}
          sub={
            nextTrip?.start_date
              ? `${new Date(nextTrip.start_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`
              : "Nenhuma agendada"
          }
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      {/* ── Trip grid ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="size-4 text-indigo-500" />
            Minhas Viagens
          </h2>
          {totalTrips > 0 && (
            <Link
              href="/trips"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Ver todas →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.length === 0 ? (
            <EmptyState />
          ) : (
            trips.map((trip) => (
              <TripCard key={trip.trip_id} trip={trip} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
