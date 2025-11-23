import { ALLERGEN_COLORS, ALLERGEN_LABELS, type AllergenType } from "@/lib/constants/allergens";
import { cn } from "@/lib/utils/cn";

interface AllergenBadgeProps {
  allergen: AllergenType;
  size?: "sm" | "md";
  className?: string;
}

export function AllergenBadge({ allergen, size = "sm", className }: AllergenBadgeProps) {
  const colorClass = ALLERGEN_COLORS[allergen];
  const label = ALLERGEN_LABELS[allergen];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        colorClass,
        className
      )}
      title={`Contains ${label}`}
      aria-label={`Allergen: ${label}`}
    >
      {label}
    </span>
  );
}

interface AllergenBadgeListProps {
  allergens: AllergenType[];
  maxVisible?: number;
  size?: "sm" | "md";
  className?: string;
}

export function AllergenBadgeList({
  allergens,
  maxVisible = 3,
  size = "sm",
  className,
}: AllergenBadgeListProps) {
  if (allergens.length === 0) {
    return null;
  }

  const visibleAllergens = allergens.slice(0, maxVisible);
  const hiddenCount = allergens.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visibleAllergens.map((allergen) => (
        <AllergenBadge key={allergen} allergen={allergen} size={size} />
      ))}
      {hiddenCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full font-medium bg-muted text-muted-foreground",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
          )}
          title={`${hiddenCount} more allergen${hiddenCount > 1 ? "s" : ""}`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
