"use client";

import { cn, calcProgress, getProgressColor, getProgressTextColor, formatCurrency } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TripProgressProps {
  /** Valor já pago / economizado */
  current: number;
  /** Valor total da meta */
  total: number;
  /** Exibir label de porcentagem e valores */
  showLabel?: boolean;
  /** Tamanho da barra */
  size?: "sm" | "md" | "lg";
  /** Classe extra para o container */
  className?: string;
  /** Animar entrada */
  animate?: boolean;
}

const sizeConfig = {
  sm: { bar: "h-1.5", label: "text-xs", gap: "gap-1" },
  md: { bar: "h-2.5", label: "text-sm", gap: "gap-1.5" },
  lg: { bar: "h-4", label: "text-base", gap: "gap-2" },
};

export function TripProgress({
  current,
  total,
  showLabel = true,
  size = "md",
  className,
  animate = true,
}: TripProgressProps) {
  const pct = calcProgress(current, total);
  const barColor = getProgressColor(pct);
  const textColor = getProgressTextColor(pct);
  const { bar, label, gap } = sizeConfig[size];

  // Animate width from 0 → pct on mount
  const [width, setWidth] = useState(animate ? 0 : pct);
  const started = useRef(false);

  useEffect(() => {
    if (!animate || started.current) return;
    started.current = true;
    const raf = requestAnimationFrame(() => {
      setWidth(pct);
    });
    return () => cancelAnimationFrame(raf);
  }, [animate, pct]);

  return (
    <div className={cn("w-full flex flex-col", gap, className)}>
      {/* Track */}
      <div
        className={cn(
          "w-full rounded-full bg-gray-100 overflow-hidden",
          bar
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
            barColor,
          )}
          style={{ width: `${width}%` }}
        >
          {size === "lg" && (
            <span className="absolute inset-0 bg-white/20 rounded-full" />
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className={cn("flex items-center justify-between", label)}>
          <span className={cn("font-semibold tabular-nums", textColor)}>
            {pct}%
          </span>
          <span className="text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">
              {formatCurrency(current)}
            </span>{" "}
            / {formatCurrency(total)}
          </span>
        </div>
      )}
    </div>
  );
}
