// Mock InfinitePay payment page (development only)
// In production, this route is never hit — real InfinitePay checkout is used

"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "processing" | "done" | "failed">("pending");

  const amount = Number(searchParams.get("amount") ?? 0);
  const order_nsu = searchParams.get("order_nsu");

  async function handleApprove() {
    setStatus("processing");
    const res = await fetch("/api/webhooks/infinitepay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_nsu,
        transaction_nsu: `mock_txn_${Date.now()}`,
        status: "approved",
        amount,
        payment_method: "pix",
      }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("failed");
    }
  }

  async function handleFail() {
    setStatus("processing");
    await fetch("/api/webhooks/infinitepay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_nsu,
        transaction_nsu: `mock_txn_${Date.now()}`,
        status: "failed",
        amount,
        payment_method: "pix",
      }),
    });
    setStatus("failed");
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-green-50">
        <CheckCircle className="w-20 h-20 text-green-500" />
        <h1 className="text-2xl font-bold text-green-700">Pagamento aprovado!</h1>
        <p className="text-green-600">{formatCurrency(amount)} adicionado à sua viagem.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
        >
          Voltar à viagem
        </button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-red-50">
        <XCircle className="w-20 h-20 text-red-500" />
        <h1 className="text-2xl font-bold text-red-700">Pagamento recusado</h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🏦</div>
          <h1 className="text-xl font-bold text-gray-900">Checkout Mock</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ambiente de desenvolvimento — simula InfinitePay
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Valor a pagar</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(amount)}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-mono">NSU: {order_nsu}</p>
        </div>

        {status === "processing" ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-gray-600">Processando...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleApprove}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
            >
              ✅ Simular pagamento aprovado
            </button>
            <button
              onClick={handleFail}
              className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition"
            >
              ❌ Simular pagamento recusado
            </button>
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          Esta página só aparece em desenvolvimento.
          <br />
          Em produção, o InfinitePay real é usado.
        </p>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <MockPaymentContent />
    </Suspense>
  );
}
