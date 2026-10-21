import { trophyLabel } from "../../lib/teams";
import { cn } from "../../lib/cn";

/** Métal d'un trophée : or (vainqueur, Coupe Horus or), argent (finaliste, argent), bronze. */
const METAL = { winner: "or", or: "or", finalist: "argent", argent: "argent", bronze: "bronze" };
const GLOW = { or: "rgba(234,192,90,0.35)", argent: "rgba(220,226,234,0.28)", bronze: "rgba(214,140,82,0.3)" };
const dateFr = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");

/**
 * Vitrine des trophées d'une équipe (fiche d'équipe) : une coupe par trophée (or, argent, bronze), sur
 * une étagère éclairée, avec le nom du tournoi et la date. Les plus récents d'abord.
 */
export function TeamTrophyCase({ trophies }) {
  if (!trophies?.length) return null;
  const list = [...trophies].sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
  const count = (metal) => list.filter((trophy) => METAL[trophy.place] === metal).length;
  return (
    <section aria-labelledby="titre-vitrine" className="relative overflow-hidden border border-[#e7c05a]/25 bg-linear-to-b from-white/[0.04] to-transparent px-5 pb-6 pt-5 [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)] sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_center,rgba(234,192,90,0.18),transparent_70%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <h2 id="titre-vitrine" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          Vitrine
        </h2>
        <p className="flex flex-wrap gap-4 font-tech text-[11px] uppercase tracking-[0.2em] text-white/55">
          <span>🥇 {count("or")}</span>
          <span>🥈 {count("argent")}</span>
          <span>🥉 {count("bronze")}</span>
        </p>
      </div>
      <ul className="relative mt-6 flex gap-5 overflow-x-auto pb-2">
        {list.map((trophy) => {
          const metal = METAL[trophy.place] ?? "or";
          return (
            <li key={`${trophy.tournamentId}-${trophy.place}`} className="group flex w-28 shrink-0 flex-col items-center text-center sm:w-32">
              <div className="relative flex h-32 w-full items-end justify-center sm:h-36">
                <span aria-hidden className="absolute bottom-1 h-6 w-20 rounded-[50%] blur-md" style={{ background: GLOW[metal] }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/trophees/horus-${metal}.png`}
                  alt={`${trophyLabel(trophy)} · ${trophy.name}`}
                  width={420}
                  height={420}
                  loading="lazy"
                  className="relative h-full w-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-105"
                />
              </div>
              <span aria-hidden className="h-1.5 w-full -skew-x-[20deg] bg-linear-to-r from-transparent via-white/25 to-transparent" />
              <p className={cn("mt-2 font-tech text-[10px] uppercase tracking-[0.2em]", metal === "or" ? "text-[#e7c05a]" : metal === "argent" ? "text-white/75" : "text-[#d6935a]")}>{trophyLabel(trophy)}</p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-white/80">{trophy.name}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{dateFr(trophy.date)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
