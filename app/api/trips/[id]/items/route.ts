import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/trips/[id]/items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trip_items")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/trips/[id]/items — adicionar item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name,
    category,
    amount,
    image_url,
    external_url,
    description,
    priority,
    quantity,
    split_equally,
    item_date,
    splits, // [{ user_id, amount }] para divisão customizada
  } = body;

  const { data: item, error } = await supabase
    .from("trip_items")
    .insert({
      trip_id: id,
      created_by: user.id,
      name,
      category: category ?? "other",
      amount: Number(amount) || 0,
      image_url: image_url ?? null,
      external_url: external_url ?? null,
      description: description ?? null,
      priority: priority ?? 0,
      quantity: quantity ?? 1,
      split_equally: split_equally !== false,
      item_date: item_date ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Inserir divisões customizadas
  if (!split_equally && splits && splits.length > 0) {
    await supabase.from("item_splits").insert(
      splits.map((s: { user_id: string; amount: number }) => ({
        item_id: item.id,
        user_id: s.user_id,
        amount: s.amount,
      }))
    );
  }

  return NextResponse.json(item, { status: 201 });
}

// PATCH /api/trips/[id]/items — atualizar item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { item_id, ...updates } = body;

  const { data, error } = await supabase
    .from("trip_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", item_id)
    .eq("trip_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/trips/[id]/items?item_id=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const item_id = searchParams.get("item_id");

  if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

  const { error } = await supabase
    .from("trip_items")
    .delete()
    .eq("id", item_id)
    .eq("trip_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
