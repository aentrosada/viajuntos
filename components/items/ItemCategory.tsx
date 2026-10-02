import { cn, CATEGORY_CONFIG, type ItemCategory } from "@/lib/utils";

interface ItemCategoryProps {
  category: ItemCategory;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ItemCategory({ category, size = "md", className }: ItemCategoryProps) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        config.color,
        className,
      )}
    >
      <span role="img" aria-label={config.label} className="leading-none">
        {config.emoji}
      </span>
      {config.label}
    </span>
  );
}
