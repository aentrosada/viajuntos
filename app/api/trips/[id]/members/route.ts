import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/trips/[id]/members
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("member_progress")
    .select("*")
    .eq("trip_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/trips/[id]/members — atualizar meta individual
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { member_id, target_amount } = await request.json();

  // Só o owner ou o próprio membro pode alterar a meta
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", id)
    .single();

  const isOwner = trip?.owner_id === user.id;
  const isSelf = member_id === user.id;

  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("trip_members")
    .update({ target_amount: Number(target_amount) })
    .eq("trip_id", id)
    .eq("user_id", member_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/trips/[id]/members?user_id=xxx — remover membro (apenas owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const member_id = searchParams.get("user_id");

  if (!member_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  // Verificar se é owner
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (trip?.owner_id !== user.id && member_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", id)
    .eq("user_id", member_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
