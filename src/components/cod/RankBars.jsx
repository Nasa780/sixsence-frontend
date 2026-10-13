import { cn } from "../../lib/cn";
import { RANKS } from "../../lib/ranks";

/** Barres de niveau : 8 paliers de Bronze à Champion ; Légende les remplit toutes, en couleur chaude. */
const BAR_COUNT = 8;
const LEGEND_GRADIENT = "linear-gradient(180deg, #ffd36b 0%, #ff8a3d 55%, #e8364a 100%)";

/** Niveau d'un rang : 1 = Bronze … 8 = Champion, 9 = Légende. */
export function rankLevel(rank) {
  return RANKS.length - RANKS.findIndex((item) => item.name === rank.name);
}

export function isLegend(rank) {
  return rankLevel(rank) > BAR_COUNT;
}

/**
 * Chevrons de rang, du plus petit au plus grand.
 *   size : "sm" (insigne) ou "md" (grille des rangs)
 */
export function RankBars({ rank, size = "md", className = "" }) {
  const level = rankLevel(rank);
  const legend = level > BAR_COUNT;
  const champion = level === BAR_COUNT;
  const base = size === "sm" ? 6 : 5;
  const step = size === "sm" ? 2 : 1.6;

  return (
    <span aria-hidden className={cn("flex items-end gap-0.5", className)}>
      {Array.from({ length: BAR_COUNT }, (_, bar) => {
        const filled = bar < level;
        return (
          <span
            key={bar}
            className={cn(
              "w-1 -skew-x-[18deg] transition-colors",
              !filled && "bg-white/12",
              filled && !legend && "bg-gold",
              filled && !legend && (champion || size === "sm") && "shadow-[0_0_6px_var(--color-gold)]",
              legend && "shadow-[0_0_8px_rgba(255,107,74,0.85)]",
            )}
            style={{ height: base + bar * step, ...(legend ? { backgroundImage: LEGEND_GRADIENT } : null) }}
          />
        );
      })}
    </span>
  );
}
