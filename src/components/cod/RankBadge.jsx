import { cn } from "../../lib/cn";
import { nextRank, rankFor, rankGradient } from "../../lib/ranks";
import { RankBars } from "./RankBars";
import { RankEmblem } from "./RankEmblem";

/**
 * Insigne de rang : emblème (avec ses effets), nom dans la teinte du rang et barres
 * de niveau. Avec `showProgress`, ajoute la barre vers le palier suivant.
 */
export function RankBadge({ points = 0, showProgress = false, className = "" }) {
  const rank = rankFor(points);
  const upcoming = nextRank(points);
  const progress = Math.round(upcoming.progress * 100);

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div className="flex items-center gap-3">
        <RankEmblem rank={rank} size={44} />
        <div className="flex flex-col gap-1.5">
          <span
            className="bg-clip-text font-display text-xl font-bold uppercase leading-none tracking-[0.14em] text-transparent"
            style={{ backgroundImage: rankGradient(rank) }}
          >
            {rank.name}
          </span>
          <RankBars rank={rank} size="sm" />
        </div>
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
            <div
              className="h-full"
              style={{ width: `${progress}%`, backgroundImage: upcoming.rank ? rankGradient(upcoming.rank, 90) : rankGradient(rank, 90) }}
            />
          </div>
          <p className="mt-1.5 text-xs text-white/45">
            {upcoming.rank ? `${upcoming.rank.min - points} pts avant ${upcoming.rank.name}` : "Rang maximal atteint"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
