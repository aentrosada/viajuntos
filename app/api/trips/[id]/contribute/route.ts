import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// POST /api/trips/[id]/contribute — criar cobrança InfinitePay
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { amount, item_id } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  // Buscar dados da viagem
  const { data: trip } = await supabase
    .from("trips")
    .select("name, destination")
    .eq("id", tripId)
    .single();

  if (!trip) return NextResponse.json({ error: "Viagem não encontrada" }, { status: 404 });

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const order_nsu = `vj_${tripId.slice(0, 8)}_${Date.now()}`;

  // Criar contribuição como pending
  const { data: contribution, error: contribError } = await supabase
    .from("contributions")
    .insert({
      trip_id: tripId,
      user_id: user.id,
      item_id: item_id ?? null,
      amount: Number(amount),
      status: "pending",
      order_nsu,
    })
    .select()
    .single();

  if (contribError) {
    return NextResponse.json({ error: contribError.message }, { status: 500 });
  }

  // Chamar InfinitePay Checkout API
  const apiKey = process.env.INFINITEPAY_API_KEY;

  if (!apiKey) {
    // Modo simulação (desenvolvimento sem InfinitePay)
    const mockPaymentUrl = `${appUrl}/payment/mock?contribution_id=${contribution.id}&amount=${amount}&order_nsu=${order_nsu}`;

    await supabase
      .from("contributions")
      .update({ payment_url: mockPaymentUrl })
      .eq("id", contribution.id);

    return NextResponse.json({
      contribution_id: contribution.id,
      payment_url: mockPaymentUrl,
      mock: true,
    });
  }

  try {
    const infinitePayRes = await fetch("https://api.infinitepay.io/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // centavos
        currency: "BRL",
        description: `ViaJuntos — ${trip.name} para ${trip.destination}`,
        customer_name: profile?.full_name ?? undefined,
        order_nsu,
        redirect_url: `${appUrl}/trips/${tripId}?payment=success`,
        webhook_url: `${appUrl}/api/webhooks/infinitepay`,
      }),
    });

    if (!infinitePayRes.ok) {
      const errBody = await infinitePayRes.text();
      console.error("InfinitePay error:", errBody);
      return NextResponse.json({ error: "Erro ao criar cobrança" }, { status: 502 });
    }

    const ipData = await infinitePayRes.json();
    const paymentUrl = ipData.payment_url ?? ipData.checkout_url;

    await supabase
      .from("contributions")
      .update({ payment_url: paymentUrl, status: "processing" })
      .eq("id", contribution.id);

    return NextResponse.json({
      contribution_id: contribution.id,
      payment_url: paymentUrl,
    });
  } catch (err) {
    console.error("InfinitePay fetch error:", err);
    return NextResponse.json({ error: "Erro de comunicação com gateway" }, { status: 502 });
  }
}
