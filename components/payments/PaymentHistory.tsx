import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Receipt,
} from "lucide-react";
import { cn, formatCurrency, getStatusLabel, timeAgo } from "@/lib/utils";
import type { Database } from "@/types/database";

type Contribution = Database["public"]["Tables"]["contributions"]["Row"];

type ContributionWithTrip = Contribution & {
  trips?: {
    name: string;
    destination: string;
    emoji: string | null;
  } | null;
  trip_items?: {
    name: string;
    category: string;
  } | null;
};

interface PaymentHistoryProps {
  contributions: ContributionWithTrip[];
  emptyMessage?: string;
  showTrip?: boolean;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  approved: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    dot: "bg-green-500",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    dot: "bg-amber-400",
  },
  processing: {
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    dot: "bg-blue-400",
  },
  failed: {
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    dot: "bg-rose-500",
  },
  refunded: {
    icon: RefreshCw,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    dot: "bg-purple-400",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.pending;
}

// ─── Payment row ──────────────────────────────────────────────────────────────

function PaymentRow({
  contribution,
  showTrip,
}: {
  contribution: ContributionWithTrip;
  showTrip: boolean;
}) {
  const sc = getStatusConfig(contribution.status);
  const Icon = sc.icon;
  const tripEmoji = contribution.trips?.emoji ?? "✈️";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-50",
        sc.border,
      )}
    >
      {/* Emoji / icon */}
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl text-xl",
          sc.bg,
        )}
      >
        {showTrip ? (
          <span role="img" aria-label={contribution.trips?.name}>
            {tripEmoji}
          </span>
        ) : (
          <Receipt className={cn("size-5", sc.color)} />
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        {showTrip && contribution.trips && (
          <p className="truncate text-xs font-medium text-gray-400">
            {contribution.trips.name} · {contribution.trips.destination}
          </p>
        )}
        {contribution.trip_items && (
          <p className="truncate text-sm font-semibold text-gray-800">
            {contribution.trip_items.name}
          </p>
        )}
        {!contribution.trip_items && (
          <p className="truncate text-sm font-semibold text-gray-800">
            Contribuição geral
          </p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">
          {timeAgo(contribution.created_at)}
        </p>
      </div>

      {/* Amount + status */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-base font-bold text-gray-900 tabular-nums">
          {formatCurrency(contribution.amount)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            sc.bg,
            sc.color,
          )}
        >
          <Icon
            className={cn(
              "size-3",
              contribution.status === "processing" && "animate-spin",
            )}
          />
          {getStatusLabel(contribution.status)}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PaymentHistory({
  contributions,
  emptyMessage = "Nenhum pagamento encontrado.",
  showTrip = true,
}: PaymentHistoryProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-6 py-10 text-center">
        <span className="text-4xl">💳</span>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {contributions.map((c) => (
        <PaymentRow key={c.id} contribution={c} showTrip={showTrip} />
      ))}
    </div>
  );
}
