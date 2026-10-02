import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatação de moeda ─────────────────────────────────────────────────────

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

// ─── Formatação de datas ─────────────────────────────────────────────────────

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd 'de' MMM yyyy", { locale: ptBR });
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM", { locale: ptBR });
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start) return "Datas a definir";
  if (!end) return formatDate(start);
  return `${formatDateShort(start)} – ${formatDateShort(end)} ${format(new Date(end), "yyyy")}`;
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  return differenceInDays(new Date(date), new Date());
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

// ─── Cálculos financeiros ────────────────────────────────────────────────────

export function calcProgress(paid: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((paid / total) * 100), 100);
}

export function calcSavingNeeds(
  target: number,
  alreadySaved: number,
  targetDate: string | null | undefined
): {
  remaining: number;
  daysLeft: number | null;
  perMonth: number | null;
  perWeek: number | null;
  perDay: number | null;
  monthsLeft: number | null;
} {
  const remaining = Math.max(target - alreadySaved, 0);
  const days = daysUntil(targetDate);

  if (!days || days <= 0) {
    return {
      remaining,
      daysLeft: days,
      perMonth: null,
      perWeek: null,
      perDay: null,
      monthsLeft: null,
    };
  }

  const months = days / 30;
  const weeks = days / 7;

  return {
    remaining,
    daysLeft: days,
    perMonth: months > 0 ? Math.ceil(remaining / months) : null,
    perWeek: weeks > 0 ? Math.ceil(remaining / weeks) : null,
    perDay: days > 0 ? Math.ceil(remaining / days) : null,
    monthsLeft: Math.ceil(months),
  };
}

export function calcSavingScenario(
  remaining: number,
  monthlySaving: number
): { months: number; willReach: boolean } {
  if (monthlySaving <= 0) return { months: 999, willReach: false };
  const months = Math.ceil(remaining / monthlySaving);
  return { months, willReach: true };
}

// ─── Categorias ─────────────────────────────────────────────────────────────

export type ItemCategory =
  | "flight"
  | "hotel"
  | "transport"
  | "food"
  | "activity"
  | "shopping"
  | "insurance"
  | "other";

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; emoji: string; color: string }
> = {
  flight:    { label: "Passagem",    emoji: "✈️",  color: "bg-blue-500/10 text-blue-600" },
  hotel:     { label: "Hospedagem",  emoji: "🏨",  color: "bg-purple-500/10 text-purple-600" },
  transport: { label: "Transporte",  emoji: "🚐",  color: "bg-yellow-500/10 text-yellow-600" },
  food:      { label: "Alimentação", emoji: "🍽️", color: "bg-orange-500/10 text-orange-600" },
  activity:  { label: "Passeio",     emoji: "🏔️", color: "bg-green-500/10 text-green-600" },
  shopping:  { label: "Compras",     emoji: "🛍️", color: "bg-pink-500/10 text-pink-600" },
  insurance: { label: "Seguro",      emoji: "🛡️", color: "bg-gray-500/10 text-gray-600" },
  other:     { label: "Outros",      emoji: "📌",  color: "bg-zinc-500/10 text-zinc-600" },
};

// ─── Helpers de status ───────────────────────────────────────────────────────

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendente",
    partial: "Parcial",
    paid: "Pago",
    planning: "Planejando",
    active: "Ativa",
    completed: "Concluída",
    archived: "Arquivada",
    approved: "Aprovado",
    failed: "Falhou",
    refunded: "Reembolsado",
    processing: "Processando",
  };
  return map[status] ?? status;
}

export function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 66) return "bg-emerald-500";
  if (pct >= 33) return "bg-amber-500";
  return "bg-rose-500";
}

export function getProgressTextColor(pct: number): string {
  if (pct >= 100) return "text-green-600";
  if (pct >= 66) return "text-emerald-600";
  if (pct >= 33) return "text-amber-600";
  return "text-rose-600";
}

// ─── Iniciais do avatar ───────────────────────────────────────────────────────

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
