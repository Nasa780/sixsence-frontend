import { cn } from "../../lib/cn";
import { RANKS, WIN_MAX, WIN_MIN, WIN_XP } from "../../lib/ranks";
import useSeasons from "../../hooks/useSeasons";
import { Eyebrow } from "../ui/Typography";

/**
 * Les 8 rangs du classé et le barème (identique au backend) :
 * victoire de +35 à +65 pts (+50 à niveau égal) / +500 XP, défaite de -15 (Bronze) à -50 (Maître et au-delà).
 * highlight : nom du rang à mettre en avant (celui du joueur).
 */
export function RanksGrid({ highlight = null }) {
  const ordered = [...RANKS].reverse(); // de Bronze à Champion
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

      <ol className="mt-8 grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4 lg:grid-cols-8">
        {ordered.map((rank, index) => {
          const active = rank.name === highlight;
          return (
            <li key={rank.name} className={cn("relative bg-ink-800 px-4 py-5", active && "bg-gold/10")}>
              {active ? <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gold shadow-[0_0_10px_var(--color-gold)]" /> : null}
              <span aria-hidden className="flex items-end gap-0.5">
                {ordered.map((_, bar) => (
                  <span
                    key={bar}
                    className={cn("w-1 -skew-x-[18deg]", bar <= index ? "bg-gold" : "bg-white/12")}
                    style={{ height: 5 + bar * 1.5 }}
                  />
                ))}
              </span>
              <p className={cn("mt-4 font-display text-xl font-bold uppercase leading-none tracking-wide", active && "text-gold")}>
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
