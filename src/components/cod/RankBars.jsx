import { cn } from "../../lib/cn";
import { rankGradient, rankLevel } from "../../lib/ranks";

/** Barres de niveau : 8 paliers de Bronze à Champion ; Légende les remplit toutes. */
const BAR_COUNT = 8;

/**
 * Chevrons de progression, dans la teinte métallique du rang (Bronze cuivré,
 * Argent argenté…). Champion et Légende : toutes remplies, avec un halo.
 *   size : "sm" (insigne) ou "md" (grille des rangs)
 */
export function RankBars({ rank, size = "md", className = "" }) {
  const level = rankLevel(rank);
  const full = level >= BAR_COUNT;
  const base = size === "sm" ? 6 : 5;
  const step = size === "sm" ? 2 : 1.6;

  return (
    <span aria-hidden className={cn("flex items-end gap-0.5", className)}>
      {Array.from({ length: BAR_COUNT }, (_, bar) => {
        const filled = bar < level;
        return (
          <span
            key={bar}
            className={cn("w-1 -skew-x-[18deg]", !filled && "bg-white/12")}
            style={{
              height: base + bar * step,
              ...(filled ? { backgroundImage: rankGradient(rank) } : null),
              ...(filled && full ? { boxShadow: `0 0 7px ${rank.color}` } : null),
            }}
          />
        );
      })}
    </span>
  );
}
