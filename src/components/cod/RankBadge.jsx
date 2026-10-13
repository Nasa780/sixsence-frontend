import { cn } from "../../lib/cn";
import { nextRank, rankFor } from "../../lib/ranks";
import { RankBars, isLegend } from "./RankBars";

/**
 * Insigne de rang : nom du palier et chevrons (8 paliers de Bronze à Champion ;
 * Légende les remplit tous en couleur chaude). Avec `showProgress`, ajoute la barre
 * vers le palier suivant.
 */
export function RankBadge({ points = 0, showProgress = false, className = "" }) {
  const rank = rankFor(points);
  const legend = isLegend(rank);
  const upcoming = nextRank(points);
  const progress = Math.round(upcoming.progress * 100);

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div className="flex items-center gap-2.5">
        <RankBars rank={rank} size="sm" />
        <span
          className={cn(
            "font-display text-xl font-bold uppercase leading-none tracking-[0.14em]",
            legend ? "bg-linear-to-b from-[#ffd36b] via-[#ff8a3d] to-[#e8364a] bg-clip-text text-transparent" : "text-gold",
          )}
        >
          {rank.name}
        </span>
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
