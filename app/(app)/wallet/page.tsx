import { createClient } from "@/lib/supabase/server";
import { PaymentHistory } from "@/components/payments/PaymentHistory";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ReceiptText,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carteira — ViaJuntos",
  description: "Histórico de pagamentos e contribuições.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ContributionStatus = "pending" | "processing" | "approved" | "failed" | "refunded";

interface WalletContribution {
  id: string;
  trip_id: string;
  user_id: string;
  item_id: string | null;
  amount: number;
  status: ContributionStatus;
  order_nsu: string | null;
  transaction_nsu: string | null;
  payment_url: string | null;
  created_at: string;
  confirmed_at: string | null;
  trips: {
    name: string;
    destination: string;
    emoji: string | null;
  } | null;
  trip_items: {
    name: string;
    category: string;
  } | null;
}

// ─── Summary stat card ────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  iconBg?: string;
}

function StatCard({ icon, label, value, sub, gradient, iconBg }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-sm ${gradient}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {label}
          </p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-white/65">{sub}</p>
          )}
        </div>
        <div
          className={`shrink-0 rounded-xl p-2.5 ${iconBg ?? "bg-white/20"}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-600">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch contributions with trip + item info
  const { data: rawContributions, error } = await supabase
    .from("contributions")
    .select(
      `
      *,
      trips(name, destination, emoji),
      trip_items(name, category)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wallet] fetch error:", error.message);
  }

  const contributions = (rawContributions ?? []) as WalletContribution[];

  // ── Summary calculations ──────────────────────────────────────────────────

  const approved = contributions.filter((c) => c.status === "approved");
  const pending = contributions.filter(
    (c) => c.status === "pending" || c.status === "processing",
  );
  const failed = contributions.filter((c) => c.status === "failed");

  const totalContributed = approved.reduce((s, c) => s + c.amount, 0);
  const totalPending = pending.reduce((s, c) => s + c.amount, 0);

  // Unique trips contributed to
  const uniqueTrips = new Set(approved.map((c) => c.trip_id)).size;

  // (No client-side pagination — all contributions are passed to PaymentHistory)

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900">
            <Wallet className="size-6 text-indigo-500" />
            Carteira
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Histórico de pagamentos e contribuições
          </p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="size-5 text-white" />}
          label="Total Contribuído"
          value={formatCurrency(totalContributed)}
          sub={`${approved.length} pagamento${approved.length !== 1 ? "s" : ""} aprovado${approved.length !== 1 ? "s" : ""}`}
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <StatCard
          icon={<Clock className="size-5 text-white" />}
          label="Pagamentos Pendentes"
          value={formatCurrency(totalPending)}
          sub={
            pending.length > 0
              ? `${pending.length} aguardando confirmação`
              : "Nenhum pendente"
          }
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
        />
        <StatCard
          icon={<ReceiptText className="size-5 text-white" />}
          label="Viagens Apoiadas"
          value={String(uniqueTrips)}
          sub={`de ${contributions.length} transaç${contributions.length !== 1 ? "ões" : "ão"} total`}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
      </div>

      {/* ── Pending payments ── */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            icon={<Clock className="size-4 text-amber-500" />}
            title="Aguardando Confirmação"
            count={pending.length}
          />
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <PaymentHistory
              contributions={pending}
              showTrip
              emptyMessage="Nenhum pagamento pendente."
            />
          </div>
        </section>
      )}

      {/* ── Approved payments ── */}
      <section className="space-y-4">
        <SectionTitle
          icon={<CheckCircle2 className="size-4 text-green-500" />}
          title="Pagamentos Confirmados"
          count={approved.length}
        />
        <PaymentHistory
          contributions={approved}
          showTrip
          emptyMessage="Nenhum pagamento confirmado ainda. Faça sua primeira contribuição!"
        />
      
      </section>

      {/* ── Failed / refunded ── */}
      {failed.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            icon={<ReceiptText className="size-4 text-rose-500" />}
            title="Falhas e Reembolsos"
            count={failed.length}
          />
          <PaymentHistory
            contributions={failed}
            showTrip
            emptyMessage="Nenhuma falha registrada."
          />
        </section>
      )}

      {/* ── Empty state (no contributions at all) ── */}
      {contributions.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-gray-50 px-6 py-16 text-center">
          <span className="text-5xl">💳</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Nenhuma contribuição ainda
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Quando você contribuir para uma viagem, os pagamentos aparecerão aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
