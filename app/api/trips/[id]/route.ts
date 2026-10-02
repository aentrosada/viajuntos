import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/trips/[id] — detalhes da viagem
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Buscar viagem + membros + itens + contribuições
  const [tripRes, membersRes, itemsRes, contributionsRes] = await Promise.all([
    supabase.from("trips").select("*").eq("id", id).single(),
    supabase.from("member_progress").select("*").eq("trip_id", id),
    supabase.from("trip_items").select("*").eq("trip_id", id).order("created_at", { ascending: true }),
    supabase
      .from("contributions")
      .select("*, profiles(full_name, avatar_url)")
      .eq("trip_id", id)
      .eq("status", "approved")
      .order("confirmed_at", { ascending: false })
      .limit(20),
  ]);

  if (tripRes.error) return NextResponse.json({ error: tripRes.error.message }, { status: 404 });

  return NextResponse.json({
    trip: tripRes.data,
    members: membersRes.data ?? [],
    items: itemsRes.data ?? [],
    contributions: contributionsRes.data ?? [],
  });
}

// PATCH /api/trips/[id] — atualizar viagem
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("trips")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id) // apenas o owner pode editar
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/trips/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
