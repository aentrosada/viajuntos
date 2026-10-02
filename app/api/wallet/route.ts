import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/wallet — histórico de contribuições do usuário
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("contributions")
    .select(`
      *,
      trips(name, destination, emoji),
      trip_items(name, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const contributions = (data ?? []) as any[];

  // Totais
  const approved = contributions.filter(c => c.status === "approved");
  const totalContributed = approved.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalPending = contributions
    .filter(c => c.status === "pending" || c.status === "processing")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return NextResponse.json({
    contributions,
    summary: {
      totalContributed,
      totalPending,
      totalTransactions: approved.length,
    },
  });
}
