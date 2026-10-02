"use client";

import Image from "next/image";
import {
  ExternalLink,
  Flame,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  cn,
  formatCurrency,
  calcProgress,
  getStatusLabel,
  getProgressColor,
  getProgressTextColor,
  type ItemCategory,
} from "@/lib/utils";
import { ItemCategory as ItemCategoryBadge } from "./ItemCategory";
import type { Database } from "@/types/database";

type TripItem = Database["public"]["Tables"]["trip_items"]["Row"];

interface ItemCardProps {
  item: TripItem;
  tripId: string;
  tripName?: string;
  memberCount?: number;
  onContribute?: (item: TripItem) => void;
  className?: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TripItem["status"] }) {
  const config = {
    pending: {
      icon: Clock,
      color: "bg-rose-50 text-rose-600 border border-rose-100",
    },
    partial: {
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    paid: {
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600 border border-green-100",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.color,
      )}
    >
      <Icon className="size-3" />
      {getStatusLabel(status)}
    </span>
  );
}

// ─── Priority indicator ────────────────────────────────────────────────────────

function PriorityIndicator({ priority }: { priority: number }) {
  if (priority <= 0) return null;

  const flames = Math.min(priority, 3);

  return (
    <span
      title={`Prioridade ${priority}`}
      className="inline-flex items-center gap-0.5"
    >
      {Array.from({ length: flames }).map((_, i) => (
        <Flame
          key={i}
          className={cn(
            "size-3.5",
            priority >= 3 ? "text-rose-500" : priority === 2 ? "text-amber-500" : "text-yellow-400",
          )}
          fill="currentColor"
        />
      ))}
    </span>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function ItemCard({
  item,
  tripId: _tripId,
  tripName,
  memberCount = 1,
  onContribute,
  className,
}: ItemCardProps) {
  const progress = calcProgress(item.paid_amount, item.amount);
  const remaining = Math.max(item.amount - item.paid_amount, 0);
  const perPerson =
    item.split_equally && memberCount > 0
      ? item.amount / memberCount
      : null;
  const isPaid = item.status === "paid";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md",
        isPaid && "opacity-90",
        className,
      )}
    >
      {/* ── Cover image ── */}
      {item.image_url && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Status badge overlaid on image */}
          <div className="absolute bottom-3 left-3">
            <StatusBadge status={item.status} />
          </div>
        </div>
      )}

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Row: category + status (if no image) + priority */}
        <div className="flex items-center justify-between gap-2">
          <ItemCategoryBadge category={item.category as ItemCategory} />
          <div className="flex items-center gap-2">
            <PriorityIndicator priority={item.priority} />
            {!item.image_url && <StatusBadge status={item.status} />}
          </div>
        </div>

        {/* Item name */}
        <div className="space-y-0.5">
          <h3 className="text-base font-bold leading-snug text-gray-900">
            {item.name}
          </h3>
          {tripName && (
            <p className="text-xs text-gray-400">{tripName}</p>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {item.description}
          </p>
        )}

        {/* External link */}
        {item.external_url && (
          <a
            href={item.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
          >
            <ExternalLink className="size-3" />
            Ver no site
          </a>
        )}

        {/* ── Progress section ── */}
        <div className="space-y-2">
          {/* Bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                getProgressColor(progress),
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Guardado:{" "}
              <span className={cn("font-semibold", getProgressTextColor(progress))}>
                {formatCurrency(item.paid_amount)}
              </span>
            </span>
            <span className={cn("font-bold tabular-nums", getProgressTextColor(progress))}>
              {progress}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Falta:{" "}
              <span className="font-medium text-gray-600">
                {formatCurrency(remaining)}
              </span>
            </span>
            <span className="font-semibold text-gray-700">
              Total: {formatCurrency(item.amount)}
            </span>
          </div>
        </div>

        {/* Per-person split */}
        {perPerson !== null && !isPaid && (
          <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            <Users className="size-3.5 shrink-0" />
            <span>
              <span className="font-bold">{formatCurrency(perPerson)}</span>
              {" "}por pessoa
              {memberCount > 1 && (
                <span className="text-indigo-500"> ({memberCount} participantes)</span>
              )}
            </span>
          </div>
        )}

        {/* Date */}
        {item.item_date && (
          <p className="text-xs text-gray-400">
            📅{" "}
            {new Date(item.item_date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}

        {/* ── Action button ── */}
        {!isPaid && onContribute && (
          <button
            type="button"
            onClick={() => onContribute(item)}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:from-indigo-600 hover:to-violet-600 hover:shadow-md active:scale-[0.98]"
          >
            <CreditCard className="size-4" />
            Pagar {perPerson ? formatCurrency(perPerson) : formatCurrency(remaining)}
          </button>
        )}

        {isPaid && (
          <div className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
            <CheckCircle2 className="size-4" />
            Item totalmente pago!
          </div>
        )}
      </div>
    </article>
  );
}
