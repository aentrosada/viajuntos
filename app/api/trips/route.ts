import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/trips — lista viagens do usuário
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trip_summary")
    .select("*")
    .or(`trip_id.in.(${await getUserTripIds(supabase, user.id)})`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/trips — criar viagem
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name,
    destination,
    emoji,
    start_date,
    end_date,
    total_budget,
    is_public,
    members, // [{ email, target_amount }]
  } = body;

  // Criar viagem
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      owner_id: user.id,
      name,
      destination,
      emoji: emoji ?? "✈️",
      start_date: start_date || null,
      end_date: end_date || null,
      total_budget: Number(total_budget) || 0,
      is_public: is_public ?? false,
    })
    .select()
    .single();

  if (tripError) return NextResponse.json({ error: tripError.message }, { status: 500 });

  // Adicionar owner como membro
  await supabase.from("trip_members").insert({
    trip_id: trip.id,
    user_id: user.id,
    role: "owner",
    target_amount: members?.find((m: { email: string }) => m.email === user.email)?.target_amount ?? null,
  });

  // Enviar convites para outros membros
  if (members && members.length > 0) {
    const invites = members
      .filter((m: { email: string }) => m.email !== user.email)
      .map((m: { email: string; target_amount?: number }) => ({
        trip_id: trip.id,
        invited_email: m.email,
        invited_by: user.id,
        target_amount: m.target_amount ?? null,
      }));

    if (invites.length > 0) {
      await supabase.from("trip_invites").insert(invites);
    }
  }

  return NextResponse.json(trip, { status: 201 });
}

// Utilitário: busca IDs de viagens do usuário (owner + membro)
async function getUserTripIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", userId);

  if (!data || data.length === 0) return "'00000000-0000-0000-0000-000000000000'";
  return data.map((r) => `'${r.trip_id}'`).join(",");
}
