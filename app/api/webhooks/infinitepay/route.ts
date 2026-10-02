import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

// POST /api/webhooks/infinitepay
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-infinitepay-signature") ?? "";

    // Verificar assinatura HMAC
    const expectedSig = crypto
      .createHmac("sha256", process.env.INFINITEPAY_WEBHOOK_SECRET ?? "")
      .update(body)
      .digest("hex");

    if (
      process.env.INFINITEPAY_WEBHOOK_SECRET &&
      signature !== expectedSig
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { order_nsu, transaction_nsu, status, amount, payment_method } = payload;

    if (!order_nsu) {
      return NextResponse.json({ error: "Missing order_nsu" }, { status: 400 });
    }

    const supabase = await createClient();

    // Buscar contribuição pelo order_nsu
    const { data: contribution, error: findError } = await supabase
      .from("contributions")
      .select("*")
      .eq("order_nsu", order_nsu)
      .single();

    if (findError || !contribution) {
      console.error("Contribution not found for order_nsu:", order_nsu);
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    // Idempotência: se já está aprovado, ignorar
    if (contribution.status === "approved") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    const newStatus =
      status === "approved" || status === "succeeded"
        ? "approved"
        : status === "failed" || status === "declined"
        ? "failed"
        : "processing";

    // Usar service role para atualizar (bypass RLS)
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(serviceUrl, serviceKey);

    // Atualizar contribution
    await serviceSupabase
      .from("contributions")
      .update({
        status: newStatus,
        transaction_nsu,
        confirmed_at: newStatus === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", contribution.id);

    // Registrar payment
    await serviceSupabase.from("payments").insert({
      contribution_id: contribution.id,
      amount: amount ?? contribution.amount,
      payment_method: payment_method ?? null,
      status: newStatus,
      gateway_response: payload,
    });

    // Se aprovado e vinculado a um item, atualizar paid_amount do item
    if (newStatus === "approved" && contribution.item_id) {
      const { data: item } = await serviceSupabase
        .from("trip_items")
        .select("amount, paid_amount")
        .eq("id", contribution.item_id)
        .single();

      if (item) {
        const newPaid = Math.min(
          (item.paid_amount ?? 0) + contribution.amount,
          item.amount
        );
        const newItemStatus =
          newPaid >= item.amount
            ? "paid"
            : newPaid > 0
            ? "partial"
            : "pending";

        await serviceSupabase
          .from("trip_items")
          .update({
            paid_amount: newPaid,
            status: newItemStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contribution.item_id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
