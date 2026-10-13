import { cn } from "../../lib/cn";
import { nextRank, RANKS, rankFor } from "../../lib/ranks";

/**
 * Insigne de rang : nom du palier et chevrons (un par niveau, de 1 = Bronze
 * à 9 = Légende). Avec `showProgress`, ajoute la barre vers le palier suivant.
 */
export function RankBadge({ points = 0, showProgress = false, className = "" }) {
  const rank = rankFor(points);
  const level = RANKS.length - RANKS.indexOf(rank);
  const upcoming = nextRank(points);
  const progress = Math.round(upcoming.progress * 100);

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="flex items-end gap-0.5">
          {RANKS.map((_, index) => (
            <span
              key={index}
              className={cn("w-1 -skew-x-[18deg]", index < level ? "bg-gold shadow-[0_0_6px_var(--color-gold)]" : "bg-white/15")}
              style={{ height: 6 + index * 2 }}
            />
          ))}
        </span>
        <span className="font-display text-xl font-bold uppercase leading-none tracking-[0.14em] text-gold">{rank.name}</span>
      </div>

      {showProgress ? (
        <div className="mt-3 w-full min-w-48">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={upcoming.rank ? `Progression vers le rang ${upcoming.rank.name}` : "Rang maximal atteint"}
            className="h-1 w-full bg-white/10"
          >
            <div className="h-full bg-gold-sheen" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-white/45">
            {upcoming.rank ? `${upcoming.rank.min - points} pts avant ${upcoming.rank.name}` : "Rang maximal atteint"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
