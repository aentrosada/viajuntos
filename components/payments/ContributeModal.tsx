"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Loader2,
  CreditCard,
  Users,
  Info,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database";

type TripItem = Database["public"]["Tables"]["trip_items"]["Row"];

interface ContributeModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  item: TripItem | null;
  memberCount?: number;
}

export function ContributeModal({
  open,
  onClose,
  tripId,
  tripName,
  item,
  memberCount = 1,
}: ContributeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>("");

  // Pre-fill with per-person split or remaining
  const suggested =
    item && item.split_equally && memberCount > 0
      ? +(item.amount / memberCount).toFixed(2)
      : item
      ? +Math.max(item.amount - item.paid_amount, 0).toFixed(2)
      : 0;

  // Sync suggestion when item changes
  if (open && amount === "" && suggested > 0) {
    setAmount(suggested.toFixed(2));
  }

  function handleClose() {
    setAmount("");
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/contribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: numAmount, item_id: item.id }),
        });

        const json = await res.json();

        if (!res.ok) {
          toast.error(json.error ?? "Erro ao criar cobrança.");
          return;
        }

        toast.success("Redirecionando para pagamento…");
        handleClose();

        if (json.payment_url) {
          // Give the toast a moment to show
          await new Promise((r) => setTimeout(r, 600));
          window.location.href = json.payment_url;
        } else {
          router.refresh();
        }
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
      }
    });
  }

  if (!open || !item) return null;

  const numAmount = parseFloat(amount) || 0;
  const remaining = Math.max(item.amount - item.paid_amount, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribute-title"
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white pb-safe shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-4">
          <div>
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">
              {tripName}
            </p>
            <h2
              id="contribute-title"
              className="mt-0.5 text-xl font-bold text-gray-900"
            >
              {item.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-3 shrink-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Info strip */}
        <div className="mx-6 mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total do item</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(item.amount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Já guardado</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(item.paid_amount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Falta</span>
            <span className="font-semibold text-rose-500">
              {formatCurrency(remaining)}
            </span>
          </div>
          {item.split_equally && memberCount > 1 && (
            <div className="mt-2 flex items-center gap-1.5 border-t border-gray-200 pt-2 text-indigo-600">
              <Users className="size-3.5" />
              <span className="text-xs">
                Sugestão por pessoa:{" "}
                <span className="font-bold">
                  {formatCurrency(suggested)}
                </span>{" "}
                ({memberCount} participantes)
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label
              htmlFor="contribute-amount"
              className="block text-sm font-semibold text-gray-700"
            >
              Valor a pagar
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                R$
              </span>
              <input
                id="contribute-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                max={remaining > 0 ? remaining : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-xl font-bold text-gray-900 outline-none transition-all",
                  "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                )}
                placeholder={suggested.toFixed(2)}
                required
              />
            </div>

            {numAmount > 0 && numAmount > remaining && remaining > 0 && (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <Info className="size-3" />
                Valor maior que o saldo pendente ({formatCurrency(remaining)})
              </p>
            )}
          </div>

          {/* Quick amount chips */}
          {suggested > 0 && (
            <div className="flex flex-wrap gap-2">
              {[suggested, suggested / 2, remaining]
                .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
                .map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toFixed(2))}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                      parseFloat(amount) === v
                        ? "border-indigo-400 bg-indigo-500 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600",
                    )}
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !amount || parseFloat(amount) <= 0}
            className={cn(
              "flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all",
              "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-200",
              "hover:from-indigo-600 hover:to-violet-600 hover:shadow-indigo-300 hover:shadow-xl",
              "active:scale-[0.98]",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processando…
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                Continuar para pagamento
                {numAmount > 0 && (
                  <span className="ml-1 opacity-90">
                    · {formatCurrency(numAmount)}
                  </span>
                )}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Pagamento processado com segurança via InfinitePay
          </p>
        </form>
      </div>
    </>
  );
}
