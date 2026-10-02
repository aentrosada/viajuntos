"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  calcProgress,
  formatCurrency,
  formatDateRange,
  calcSavingNeeds,
  getProgressColor,
  getProgressTextColor,
  CATEGORY_CONFIG,
  getInitials,
  timeAgo,
  type ItemCategory,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  Clock,
  TrendingUp,
  PiggyBank,
  Plus,
  ExternalLink,
  CircleCheck,
  CircleDashed,
  CircleAlert,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Trip {
  id: string;
  name: string;
  destination: string;
  emoji: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  total_budget: number;
  status: string;
}

interface TripItem {
  id: string;
  name: string;
  category: ItemCategory;
  amount: number;
  paid_amount: number;
  description: string | null;
  external_url: string | null;
  status: "pending" | "partial" | "paid";
  item_date: string | null;
}

interface Contribution {
  id: string;
  amount: number;
  confirmed_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface MemberProgressItem {
  user_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  contributed_amount: number | null;
  target_amount: number | null;
  progress_pct: number | null;
}

interface TripPanelProps {
  trip: Trip;
  items: TripItem[];
  contributions: Contribution[];
  members: MemberProgressItem[];
  totalContributed: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: "pending" | "partial" | "paid" }) {
  if (status === "paid")
    return <CircleCheck className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "partial")
    return <CircleAlert className="w-4 h-4 text-amber-500 shrink-0" />;
  return <CircleDashed className="w-4 h-4 text-zinc-400 shrink-0" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TripPanel({
  trip,
  items,
  contributions,
  members,
  totalContributed,
}: TripPanelProps) {
  const router = useRouter();
  const [monthlySaving, setMonthlySaving] = useState<number>(500);

  const pct = calcProgress(totalContributed, trip.total_budget);
  const barColor = getProgressColor(pct);
  const textColor = getProgressTextColor(pct);
  const remaining = Math.max(trip.total_budget - totalContributed, 0);
  const savings = calcSavingNeeds(
    trip.total_budget,
    totalContributed,
    trip.start_date
  );

  // Group items by category
  const grouped = items.reduce<Record<string, TripItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const monthsToReach =
    remaining > 0 && monthlySaving > 0
      ? Math.ceil(remaining / monthlySaving)
      : 0;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* ── Cover Header ────────────────────────────────────────────── */}
      <div className="relative">
        {trip.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image_url}
            alt={trip.destination}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-end p-5">
            <span className="text-6xl drop-shadow-lg select-none">
              {trip.emoji ?? "✈️"}
            </span>
          </div>
        )}

        {/* Back button overlay */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Emoji badge (if has cover image) */}
        {trip.cover_image_url && trip.emoji && (
          <div className="absolute bottom-4 left-5 text-5xl drop-shadow-md select-none">
            {trip.emoji}
          </div>
        )}
      </div>

      {/* ── Title section ─────────────────────────────────────────────── */}
      <div className="bg-white px-5 pt-5 pb-4 shadow-sm">
        <h1 className="text-2xl font-extrabold text-zinc-900 leading-tight">
          {trip.name}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">{trip.destination}</p>

        <div className="flex flex-wrap gap-3 mt-3">
          {(trip.start_date || trip.end_date) && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateRange(trip.start_date, trip.end_date)}
            </div>
          )}
          {savings.daysLeft != null && savings.daysLeft > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5" />
              {savings.daysLeft} dias restantes
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Progress Card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Financiamento
            </span>
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-full",
                pct >= 100
                  ? "bg-green-100 text-green-700"
                  : pct >= 66
                    ? "bg-emerald-100 text-emerald-700"
                    : pct >= 33
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-600"
              )}
            >
              {pct}% financiada
            </span>
          </div>

          {/* Big progress bar */}
          <div className="space-y-1.5">
            <div className="h-5 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={cn("font-bold", textColor)}>
                {formatCurrency(totalContributed)}{" "}
                <span className="font-normal text-zinc-400 text-xs">guardado</span>
              </span>
              <span className="text-zinc-500">
                de{" "}
                <span className="font-semibold text-zinc-700">
                  {formatCurrency(trip.total_budget)}
                </span>
              </span>
            </div>
          </div>

          {/* Remaining */}
          {remaining > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-2.5">
              <PiggyBank className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-700">
                Faltam{" "}
                <strong className="font-bold">{formatCurrency(remaining)}</strong>
              </p>
            </div>
          )}
        </div>

        {/* ── Savings Calculator ──────────────────────────────────────────── */}
        {remaining > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-800">
                Calculadora de poupança
              </span>
            </div>

            {/* Slider / input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-indigo-700 font-medium">
                  Guardar por mês:
                </label>
                <span className="text-sm font-bold text-indigo-900">
                  {formatCurrency(monthlySaving)}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={5000}
                step={50}
                value={monthlySaving}
                onChange={(e) => setMonthlySaving(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-indigo-400">
                <span>R$ 50</span>
                <span>R$ 5.000</span>
              </div>
            </div>

            {/* Result */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-xs text-zinc-500">Você atinge a meta em:</p>
                <p className="text-lg font-extrabold text-indigo-800">
                  {monthsToReach}{" "}
                  {monthsToReach === 1 ? "mês" : "meses"}
                </p>
              </div>
            </div>

            {/* Quick presets */}
            {savings.perMonth != null && (
              <p className="text-xs text-indigo-600 text-center">
                Necessário guardar:{" "}
                <button
                  onClick={() => setMonthlySaving(savings.perMonth!)}
                  className="font-bold underline decoration-dashed hover:no-underline"
                >
                  {formatCurrency(savings.perMonth)}/mês
                </button>{" "}
                para atingir até a viagem
              </p>
            )}
          </div>
        )}

        {/* ── Trip Items by Category ──────────────────────────────────────── */}
        {Object.entries(grouped).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Despesas da viagem
            </h2>

            {Object.entries(grouped).map(([cat, catItems]) => {
              const config = CATEGORY_CONFIG[cat as ItemCategory];
              const catTotal = catItems.reduce((s, i) => s + i.amount, 0);
              const catPaid = catItems.reduce((s, i) => s + i.paid_amount, 0);
              const catPct = calcProgress(catPaid, catTotal);

              return (
                <div
                  key={cat}
                  className="rounded-2xl bg-white shadow-sm border border-zinc-100 overflow-hidden"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-base w-7 h-7 flex items-center justify-center rounded-lg",
                          config?.color
                        )}
                      >
                        {config?.emoji}
                      </span>
                      <span className="text-sm font-semibold text-zinc-800">
                        {config?.label ?? cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">
                        {formatCurrency(catPaid)} /{" "}
                        {formatCurrency(catTotal)}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          catPct >= 100
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {catPct}%
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <ul className="divide-y divide-zinc-50">
                    {catItems.map((item) => {
                      const itemPct = calcProgress(item.paid_amount, item.amount);
                      return (
                        <li key={item.id} className="px-4 py-3 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <StatusIcon status={item.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-zinc-800 truncate">
                                  {item.name}
                                </span>
                                <span className="text-sm font-semibold text-zinc-700 shrink-0">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                  {item.description}
                                </p>
                              )}
                              {/* Mini progress */}
                              {item.paid_amount > 0 && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        getProgressColor(itemPct)
                                      )}
                                      style={{ width: `${itemPct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-zinc-400 shrink-0">
                                    {formatCurrency(item.paid_amount)} pago
                                  </span>
                                </div>
                              )}
                            </div>
                            {item.external_url && (
                              <a
                                href={item.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-zinc-400 hover:text-indigo-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add expense placeholder ─────────────────────────────────────── */}
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
          <Plus className="w-4 h-4" />
          Adicionar despesa
        </button>

        {/* ── Recent Contributions ────────────────────────────────────────── */}
        {contributions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Contribuições recentes
            </h2>

            <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 overflow-hidden">
              <ul className="divide-y divide-zinc-50">
                {contributions.slice(0, 10).map((c) => {
                  const name = c.profiles?.full_name;
                  const initials = getInitials(name);
                  const date = c.confirmed_at ?? c.created_at;
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                      {c.profiles?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.profiles.avatar_url}
                          alt={name ?? "membro"}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600">
                            {initials}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">
                          {name ?? "Membro"}
                        </p>
                        <p className="text-xs text-zinc-500">{timeAgo(date)}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600 shrink-0">
                        +{formatCurrency(c.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Contribute Button ──────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => toast.info("Pagamentos em breve!")}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-6 py-3.5 rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200"
        >
          <PiggyBank className="w-4 h-4" />
          Contribuir agora
        </button>
      </div>
    </div>
  );
}
