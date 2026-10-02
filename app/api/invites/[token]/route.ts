import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/invites/[token] — verificar convite
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trip_invites")
    .select("*, trips(name, destination, emoji, total_budget, start_date, end_date)")
    .eq("token", token)
    .single();

  const invite = data as any;

  if (error || !invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (invite.accepted) {
    return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  return NextResponse.json(invite);
}

// POST /api/invites/[token] — aceitar convite
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trip_invites")
    .select("*")
    .eq("token", token)
    .single();

  const invite = data as any;

  if (error || !invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (invite.accepted) {
    return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 });
  }

  // Verificar se já é membro
  const { data: existing } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", invite.trip_id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    // Adicionar como membro
    await supabase.from("trip_members").insert({
      trip_id: invite.trip_id,
      user_id: user.id,
      role: "member",
      target_amount: invite.target_amount ?? null,
    });
  }

  // Marcar convite como aceito
  await supabase
    .from("trip_invites")
    .update({ accepted: true })
    .eq("id", invite.id);

  return NextResponse.json({ trip_id: invite.trip_id });
}
