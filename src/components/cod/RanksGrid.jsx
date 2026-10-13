import { RANKS, WIN_POINTS, WIN_XP, rankGradient } from "../../lib/ranks";
import useSeasons from "../../hooks/useSeasons";
import { RankBars } from "./RankBars";
import { RankEmblem } from "./RankEmblem";
import { Eyebrow } from "../ui/Typography";

/**
 * Les 9 rangs du classé et le barème (identique au backend) :
 * victoire +50 pts / +500 XP, défaite de -15 (Bronze) à -50 (Maître et au-delà).
 * highlight : nom du rang à mettre en avant (celui du joueur).
 */
export function RanksGrid({ highlight = null }) {
  const ordered = [...RANKS].reverse(); // de Bronze à Légende
  const { label } = useSeasons();

  return (
    <section aria-labelledby="titre-rangs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <h2 id="titre-rangs" className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            Les rangs
          </h2>
        </div>
        <p className="text-sm text-white/60">
          Victoire : <span className="font-tech font-bold text-gold">+{WIN_POINTS} pts</span> ·{" "}
          <span className="font-tech font-bold text-gold">+{WIN_XP} XP</span>
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-3 gap-px bg-white/10 lg:grid-cols-9">
        {ordered.map((rank, index) => {
          const active = rank.name === highlight;
          return (
            <li
              key={rank.name}
              className="relative overflow-hidden bg-ink-800 px-4 pb-5 pt-4"
            >
              {active ? (
                <span aria-hidden className="absolute inset-x-0 top-0 h-0.5" style={{ background: rank.color, boxShadow: `0 0 10px ${rank.color}` }} />
              ) : null}
              <RankEmblem rank={rank} size={52} />
              {/* Place pour deux lignes (« Grand Maître ») : toutes les cartes restent alignées. */}
              <div className="mt-3 flex h-10 items-end">
                <p
                  className="bg-clip-text font-display text-xl font-bold uppercase leading-none tracking-wide text-transparent"
                  style={{ backgroundImage: rankGradient(rank) }}
                >
                  {rank.name}
                  {active ? <span className="sr-only"> (ton rang)</span> : null}
                </p>
              </div>
              <RankBars rank={rank} className="mt-2.5" />
              <p className="mt-2.5 font-tech text-[11px] tabular-nums text-white/50">
                {rank.min}
                {ordered[index + 1] ? `–${ordered[index + 1].min - 1}` : "+"} pts
              </p>
              <p className="mt-2 text-xs text-white/40">
                Défaite <span className="font-tech font-bold text-loss">−{rank.loss}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
