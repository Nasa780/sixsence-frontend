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
        // Progression façon interface de jeu : palier suivant et pourcentage, barre fine lumineuse.
        <div className="mt-3 w-full sm:min-w-56">
          <div className="flex items-end justify-between gap-2 font-tech uppercase sm:gap-4">
            <span className="whitespace-nowrap text-[9px] tracking-[0.12em] text-white/50 sm:tracking-[0.25em]">
              {upcoming.rank ? (
                <>
                  <span className="hidden sm:inline">Prochain rang · </span>
                  <span className="sm:hidden">Vers </span>
                  <span style={{ color: upcoming.rank.text }}>{upcoming.rank.name}</span>
                </>
              ) : (
                "Rang maximal"
              )}
            </span>
            <span className="text-sm font-bold leading-none tracking-wider text-white">{upcoming.rank ? progress : 100}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={upcoming.rank ? `Progression vers le rang ${upcoming.rank.name}` : "Rang maximal atteint"}
            className="mt-1.5 h-[3px] w-full bg-white/10"
          >
            <div
              className="h-full"
              style={{
                width: `${upcoming.rank ? progress : 100}%`,
                backgroundImage: rankGradient(upcoming.rank ?? rank, 90),
                boxShadow: `0 0 8px ${(upcoming.rank ?? rank).color}`,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
