import { trophyLabel } from "../../lib/teams";
import { AwardShelf } from "../ui/AwardShelf";

/** Métal d'un trophée : or (vainqueur, Coupe Horus or), argent (finaliste, argent), bronze. */
const METAL = { winner: "or", or: "or", finalist: "argent", argent: "argent", bronze: "bronze" };
const dateFr = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");

/**
 * Vitrine des trophées d'une équipe (fiche d'équipe) : une coupe par trophée (or, argent, bronze), les plus
 * récents d'abord ; au-delà de 8, palmarès regroupé par métal (vitrine commune AwardShelf).
 */
export function TeamTrophyCase({ trophies }) {
  if (!trophies?.length) return null;
  const items = [...trophies]
    .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0))
    .map((trophy) => {
      const metal = METAL[trophy.place] ?? "or";
      return { key: `${trophy.tournamentId}-${trophy.place}`, metal, image: `/images/trophees/horus-${metal}.png`, label: trophyLabel(trophy), title: trophy.name, sub: dateFr(trophy.date) };
    });
  const counts = ["or", "argent", "bronze"].map((metal) => [metal, items.filter((item) => item.metal === metal).length]).filter(([, n]) => n > 0);
  return (
    <div className="space-y-4">
      <ul aria-label="Trophées par type" className="flex flex-wrap gap-3">
        {counts.map(([metal, n]) => (
          <li key={metal} className="clip-tactical flex items-center gap-3 border border-white/10 bg-white/[0.03] py-2 pl-2 pr-5 [--cut:10px]">
            <img src={`/images/trophees/horus-${metal}.png`} alt="" className="h-12 w-12 object-contain" />
            <span>
              <span className="block font-display text-3xl font-black leading-none">×{n}</span>
              <span className="block font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{metal === "or" ? "Or" : metal === "argent" ? "Argent" : "Bronze"}</span>
            </span>
          </li>
        ))}
        <li className="clip-tactical flex items-center gap-3 border border-gold/40 bg-gold/10 px-5 py-2 [--cut:10px]">
          <span>
            <span className="block font-display text-3xl font-black leading-none text-gold">{items.length}</span>
            <span className="block font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Podium{items.length > 1 ? "s" : ""}</span>
          </span>
        </li>
      </ul>
      <AwardShelf id="titre-vitrine" title="Vitrine" items={items} />
    </div>
  );
}
