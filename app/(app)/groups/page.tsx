import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Plus, ArrowRight } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";

export const metadata = {
  title: "Grupos de Viagem — ViaJuntos",
};

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscar viagens que o usuário participa
  const { data: memberRecords } = await supabase
    .from("trip_members")
    .select("trip_id, role")
    .eq("user_id", user.id);

  const tripIds = (memberRecords ?? []).map((m) => m.trip_id);

  const { data: trips } = tripIds.length
    ? await supabase.from("trips").select("*").in("id", tripIds)
    : { data: [] };

  const { data: members } = tripIds.length
    ? await supabase
        .from("member_progress")
        .select("*")
        .in("trip_id", tripIds)
    : { data: [] };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="size-6 text-indigo-600" />
            Grupos de Viagem
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Veja todas as pessoas que estão planejando e juntando dinheiro com você
          </p>
        </div>

        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="size-4" />
          Criar nova viagem
        </Link>
      </div>

      {/* Trips Groups Grid */}
      {!trips || trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-4">
          <div className="text-4xl">👥</div>
          <h3 className="text-base font-bold text-gray-900">
            Você ainda não faz parte de nenhum grupo
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Crie sua primeira viagem e convide seus amigos por link para começarem a juntar juntos.
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="size-4" />
            Criar Viagem
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const tripMembers = (members ?? []).filter(
              (m) => m.trip_id === trip.id
            );
            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{trip.emoji ?? "✈️"}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {trip.name}
                      </h3>
                      <p className="text-xs text-gray-500">{trip.destination}</p>
                    </div>
                  </div>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Participantes ({tripMembers.length})
                  </p>
                  <div className="space-y-2">
                    {tripMembers.map((m) => (
                      <div
                        key={m.user_id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {getInitials(m.full_name)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {m.full_name ?? "Viajante"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {formatCurrency(m.contributed_amount ?? 0)}
                          </span>
                          <span className="text-xs font-semibold text-indigo-600 ml-2">
                            {m.progress_pct ?? 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
