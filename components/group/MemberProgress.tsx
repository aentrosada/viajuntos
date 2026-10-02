import {
  calcProgress,
  formatCurrency,
  getInitials,
  getProgressColor,
  getProgressTextColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MemberProgressItem {
  user_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  target_amount: number | null;
  contributed_amount: number | null;
  progress_pct: number | null;
}

interface MemberProgressProps {
  members: MemberProgressItem[];
  className?: string;
}

export function MemberProgress({ members, className }: MemberProgressProps) {
  if (members.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl bg-white shadow-sm border border-zinc-100 p-5",
          className
        )}
      >
        <p className="text-sm text-zinc-500 text-center py-4">
          Nenhum membro ainda.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-zinc-800">Membros</h3>

      <ul className="space-y-4">
        {members.map((m) => {
          const contributed = m.contributed_amount ?? 0;
          const target = m.target_amount ?? 0;
          const pct =
            m.progress_pct != null
              ? Math.min(Math.round(m.progress_pct), 100)
              : calcProgress(contributed, target);
          const barColor = getProgressColor(pct);
          const textColor = getProgressTextColor(pct);
          const remaining = Math.max(target - contributed, 0);
          const initials = getInitials(m.full_name);
          const achieved = pct >= 100;

          return (
            <li key={m.user_id} className="space-y-2">
              {/* Member row */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.avatar_url}
                    alt={m.full_name ?? "membro"}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-600">
                      {initials}
                    </span>
                  </div>
                )}

                {/* Name + amounts */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-800 truncate">
                      {m.full_name ?? "Membro"}
                    </span>
                    <span className={cn("text-xs font-semibold shrink-0", textColor)}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1 h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        barColor
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Amounts below bar */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-500">
                      {formatCurrency(contributed)}
                      {target > 0 && (
                        <> / {formatCurrency(target)}</>
                      )}
                    </span>
                    {achieved ? (
                      <span className="text-xs font-semibold text-green-600">
                        Meta atingida! 🎉
                      </span>
                    ) : target > 0 ? (
                      <span className="text-xs text-zinc-400">
                        Falta {formatCurrency(remaining)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
