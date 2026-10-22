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
  return <AwardShelf id="titre-vitrine" title="Vitrine" items={items} />;
}
