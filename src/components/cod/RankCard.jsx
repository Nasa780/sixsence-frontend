import { nextRank, rankFor, rankGradient } from "../../lib/ranks";
import { TacticalCard } from "../ui/TacticalCard";
import { RankEmblem } from "./RankEmblem";
import { RankRoad } from "./RankRoad";

/**
 * Carte de rang du profil : emblème en grand (avec ses effets), rang, points,
 * progression vers le rang suivant, pic de la saison et place en pourcentage,
 * puis la frise de progression jusqu'à Légende.
 *   position / total : place au classement et nombre de joueurs classés (facultatifs)
 */
export function RankCard({ points = 0, peak = 0, position = null, total = null, seasonLabel = "Saison 1" }) {
  const rank = rankFor(points);
  const upcoming = nextRank(points);
  const top = position && total ? Math.max(1, Math.ceil((position / total) * 100)) : null;

  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: rank.color }} />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <RankEmblem rank={rank} size={120} spread className="self-center sm:self-auto" />
        <div className="min-w-0 flex-1">
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-white/45">Rang actuel · {seasonLabel}</p>
          <p
            className="mt-1.5 bg-clip-text font-display text-5xl font-black uppercase leading-none text-transparent sm:text-6xl"
            style={{ backgroundImage: rankGradient(rank) }}
          >
            {rank.name}
          </p>
          <p className="mt-2 font-display text-4xl font-black tabular-nums leading-none">
            {points.toLocaleString("fr-FR")} <span className="text-lg text-white/40">pts</span>
          </p>

          <div className="mt-5">
            <div
              role="progressbar"
              aria-valuenow={Math.round(upcoming.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={upcoming.rank ? `Progression vers le rang ${upcoming.rank.name}` : "Rang maximal atteint"}
              className="h-1.5 w-full bg-white/10"
            >
              <div className="h-full" style={{ width: `${Math.round(upcoming.progress * 100)}%`, backgroundImage: rankGradient(upcoming.rank ?? rank, 90) }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-white/50">
              <span>{upcoming.rank ? `${upcoming.rank.min - points} pts avant ${upcoming.rank.name}` : "Rang maximal atteint"}</span>
              <span>
                Pic de la saison : <span className="font-tech font-bold text-white/75">{Math.max(peak, points)}</span>
                {top ? (
                  <>
                    {" "}
                    · <span className="font-tech font-bold text-white/75">Top {top} %</span>
                  </>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 border-t border-white/10 pt-6">
        <p className="mb-4 font-display text-xl font-black uppercase leading-none tracking-wide">Road to Légende</p>
        <RankRoad points={points} />
      </div>
    </TacticalCard>
  );
}
