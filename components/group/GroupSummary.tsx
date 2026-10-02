import { calcProgress, formatCurrency, getProgressColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface GroupSummaryProps {
  totalContributed: number;
  totalBudget: number;
  memberCount: number;
  className?: string;
}

export function GroupSummary({
  totalContributed,
  totalBudget,
  memberCount,
  className,
}: GroupSummaryProps) {
  const pct = calcProgress(totalContributed, totalBudget);
  const barColor = getProgressColor(pct);
  const remaining = Math.max(totalBudget - totalContributed, 0);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-zinc-800">
            Progresso do grupo
          </span>
        </div>
        <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
          {memberCount} {memberCount === 1 ? "membro" : "membros"}
        </span>
      </div>

      {/* Big percentage + bar */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span
            className={cn(
              "text-3xl font-extrabold tabular-nums",
              pct >= 100
                ? "text-green-600"
                : pct >= 66
                  ? "text-emerald-600"
                  : pct >= 33
                    ? "text-amber-600"
                    : "text-rose-600"
            )}
          >
            {pct}%
          </span>
          <span className="text-xs text-zinc-500 font-medium">financiada</span>
        </div>

        {/* Bar track */}
        <div className="h-4 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              barColor
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Amounts */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-800">
            {formatCurrency(totalContributed)}
          </span>
          <span className="text-zinc-400">de {formatCurrency(totalBudget)}</span>
        </div>
      </div>

      {/* Contextual message */}
      {pct >= 100 ? (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5">
          <span className="text-base">🎉</span>
          <p className="text-sm font-semibold text-green-700">
            Meta atingida! Hora de viajar!
          </p>
        </div>
      ) : pct >= 50 ? (
        <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-2.5">
          <span className="text-base">🎉</span>
          <p className="text-sm font-medium text-emerald-700">
            O grupo já financiou <strong>{pct}%</strong> da viagem!
          </p>
        </div>
      ) : remaining > 0 ? (
        <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2.5">
          <span className="text-base">💰</span>
          <p className="text-sm text-amber-700">
            Faltam <strong>{formatCurrency(remaining)}</strong> para completar o
            orçamento.
          </p>
        </div>
      ) : null}
    </div>
  );
}
