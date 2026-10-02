import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// POST /api/trips/[id]/invite — convidar um membro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verificar se é membro da viagem
  const { data: member } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, target_amount } = await request.json();

  if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });

  // Verificar se já tem convite pendente
  const { data: existing } = await supabase
    .from("trip_invites")
    .select("id")
    .eq("trip_id", tripId)
    .eq("invited_email", email)
    .eq("accepted", false)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Já existe um convite pendente para este email" }, { status: 409 });
  }

  const { data: invite, error } = await supabase
    .from("trip_invites")
    .insert({
      trip_id: tripId,
      invited_email: email,
      invited_by: user.id,
      target_amount: target_amount ? Number(target_amount) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${invite.token}`;

  return NextResponse.json({ invite, inviteUrl }, { status: 201 });
}

// GET /api/trips/[id]/invite — listar convites pendentes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trip_invites")
    .select("*")
    .eq("trip_id", tripId)
    .eq("accepted", false)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
