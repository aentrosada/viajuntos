import Link from "next/link";
import { cn, formatCurrency, formatDateRange, daysUntil, calcProgress, getProgressColor, getInitials } from "@/lib/utils";
import { TripProgress } from "@/components/trips/TripProgress";
import { Calendar, Users, Clock } from "lucide-react";

// Shape returned from trip_summary view
export interface TripSummaryRow {
  trip_id: string | null;
  name: string | null;
  destination: string | null;
  total_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  cover_image_url: string | null;
  emoji: string | null;
  total_contributed: number | null;
  progress_pct: number | null;
  member_count: number | null;
}

interface TripCardProps {
  trip: TripSummaryRow;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  planning:  { label: "Planejando",  className: "bg-blue-50 text-blue-700 ring-blue-200" },
  active:    { label: "Ativa",       className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  completed: { label: "Concluída",   className: "bg-gray-50 text-gray-600 ring-gray-200" },
  archived:  { label: "Arquivada",   className: "bg-zinc-50 text-zinc-500 ring-zinc-200" },
};

export function TripCard({ trip }: TripCardProps) {
  const {
    trip_id,
    name,
    destination,
    emoji,
    start_date,
    end_date,
    total_budget,
    total_contributed,
    progress_pct,
    member_count,
    status,
  } = trip;

  if (!trip_id) return null;

  const current = total_contributed ?? 0;
  const total = total_budget ?? 0;
  const pct = progress_pct ?? calcProgress(current, total);
  const barColor = getProgressColor(pct);
  const days = daysUntil(start_date);
  const statusCfg = statusConfig[status ?? "planning"] ?? statusConfig.planning;

  // Dummy member initials for avatar stack (real data would come from member_progress view)
  const memberCount = member_count ?? 1;

  return (
    <Link
      href={`/trips/${trip_id}`}
      className="group block bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 hover:shadow-md hover:shadow-indigo-100/40 hover:border-indigo-100 transition-all duration-200 overflow-hidden"
    >
      {/* Cover / Emoji header */}
      <div className="relative h-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 flex items-center justify-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-4 -right-4 size-20 rounded-full bg-indigo-100/60 blur-xl" />
        <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-blue-100/60 blur-xl" />
        <span className="relative text-4xl drop-shadow-sm select-none" role="img" aria-label={destination ?? "viagem"}>
          {emoji ?? "✈️"}
        </span>

        {/* Status badge */}
        <span
          className={cn(
            "absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1",
            statusCfg.className
          )}
        >
          {statusCfg.label}
        </span>

        {/* Days remaining badge */}
        {days !== null && days > 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 ring-1 ring-gray-200">
            <Clock className="size-2.5" />
            {days}d
          </span>
        )}
        {days !== null && days <= 0 && status === "active" && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-200">
            🚀 Em viagem!
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title + destination */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-indigo-700 transition-colors">
            {name ?? "Viagem sem nome"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{destination}</p>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="size-3 shrink-0 text-gray-400" />
          <span>{formatDateRange(start_date, end_date)}</span>
        </div>

        {/* Progress bar */}
        <TripProgress
          current={current}
          total={total}
          showLabel={false}
          size="sm"
          animate
        />

        {/* Amounts row */}
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-bold tabular-nums", barColor.replace("bg-", "text-").replace("-500", "-600"))}>
            {formatCurrency(current)}
          </span>
          <span className="text-gray-400 tabular-nums">
            de {formatCurrency(total)}
          </span>
        </div>

        {/* Footer: members + percentage */}
        <div className="flex items-center justify-between pt-0.5 border-t border-gray-50">
          {/* Member avatar stack */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="size-5 rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 ring-1.5 ring-white flex items-center justify-center text-[8px] font-bold text-white"
                >
                  {getInitials(null)}
                </div>
              ))}
              {memberCount > 3 && (
                <div className="size-5 rounded-full bg-gray-100 ring-1.5 ring-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                  +{memberCount - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400">
              <Users className="size-2.5 inline mr-0.5" />
              {memberCount}
            </span>
          </div>

          {/* Percentage pill */}
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              pct >= 100 ? "bg-green-50 text-green-700" :
              pct >= 66  ? "bg-emerald-50 text-emerald-700" :
              pct >= 33  ? "bg-amber-50 text-amber-700" :
                           "bg-rose-50 text-rose-700"
            )}
          >
            {pct}%
          </span>
        </div>
      </div>
    </Link>
  );
}
