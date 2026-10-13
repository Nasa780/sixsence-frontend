import { cn } from "../../lib/cn";
import { RANKS, WIN_MAX, WIN_MIN, WIN_XP } from "../../lib/ranks";
import useSeasons from "../../hooks/useSeasons";
import { RankBars, isLegend, rankLevel } from "./RankBars";
import { Eyebrow } from "../ui/Typography";

/**
 * Les 9 rangs du classé et le barème (identique au backend) :
 * victoire de +45 à +55 pts (+50 à niveau égal) / +500 XP, défaite de -15 (Bronze) à -50 (Maître et au-delà).
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
          Victoire : <span className="font-tech font-bold text-gold">+{WIN_MIN} à +{WIN_MAX} pts</span> selon l&apos;adversaire ·{" "}
          <span className="font-tech font-bold text-gold">+{WIN_XP} XP</span>
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-3 gap-px bg-white/10 lg:grid-cols-9">
        {ordered.map((rank, index) => {
          const active = rank.name === highlight;
          const legend = isLegend(rank);
          const champion = !legend && rankLevel(rank) === 8;
          return (
            <li
              key={rank.name}
              className={cn(
                "relative overflow-hidden bg-ink-800 px-4 py-5",
                active && "bg-gold/10",
                champion && "bg-linear-to-b from-gold/[0.09] to-ink-800",
                legend && "bg-linear-to-b from-[#ff6b4a]/[0.16] via-[#e8364a]/[0.05] to-ink-800",
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5",
                    legend ? "bg-[#ff6b4a] shadow-[0_0_10px_#ff6b4a]" : "bg-gold shadow-[0_0_10px_var(--color-gold)]",
                  )}
                />
              ) : null}
              <RankBars rank={rank} />
              <p
                className={cn(
                  "mt-4 font-display text-xl font-bold uppercase leading-none tracking-wide",
                  active && "text-gold",
                  champion && "text-gold-gradient",
                  legend && "bg-linear-to-b from-[#ffd36b] via-[#ff8a3d] to-[#e8364a] bg-clip-text text-transparent",
                )}
              >
                {rank.name}
                {active ? <span className="sr-only"> (ton rang)</span> : null}
              </p>
              <p className="mt-1.5 font-tech text-[11px] tabular-nums text-white/50">
                {rank.min}
                {ordered[index + 1] ? `–${ordered[index + 1].min - 1}` : "+"} pts
              </p>
              <p className="mt-3 text-xs text-white/40">
                Défaite <span className="font-tech font-bold text-loss">−{rank.loss}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
