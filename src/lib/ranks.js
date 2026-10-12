/**
 * Rangs du classé, identiques à la page Ranked (section « Les rangs ») et au
 * barème du backend (fonction SQL cod_loss_penalty).
 */
export const RANKS = [
  { name: "Champion", min: 3500, color: "#e8b4f8", icon: "/assets/Iconchampion.svg", loss: 30 },
  { name: "Grand Maître", min: 3000, color: "#c084fc", icon: "/assets/Icongrandmaitre.svg", loss: 25 },
  { name: "Maître", min: 2500, color: "#a78bfa", icon: "/assets/Iconmaitre.svg", loss: 22 },
  { name: "Diamant", min: 2000, color: "#38bdf8", icon: "/assets/Icondiament.svg", loss: 20 },
  { name: "Platine", min: 1500, color: "#34d399", icon: "/assets/Iconplatine.svg", loss: 18 },
  { name: "Or", min: 1000, color: "#c9a227", icon: "/assets/Iconor.svg", loss: 15 },
  { name: "Argent", min: 500, color: "#94a3b8", icon: "/assets/Iconargent.svg", loss: 12 },
  { name: "Bronze", min: 0, color: "#c97b4b", icon: "/assets/Iconbronze.svg", loss: 10 },
];

/** Rang correspondant à un nombre de points. */
export function rankFor(points = 0) {
  return RANKS.find((rank) => points >= rank.min) || RANKS[RANKS.length - 1];
}

/** Rang suivant (ou null au sommet) et progression vers lui, de 0 à 1. */
export function nextRank(points = 0) {
  const index = RANKS.findIndex((rank) => points >= rank.min);
  if (index <= 0) return { rank: null, progress: 1 };
  const current = RANKS[index];
  const next = RANKS[index - 1];
  return { rank: next, progress: (points - current.min) / (next.min - current.min) };
}

/** Points gagnés par victoire, XP par victoire. */
export const WIN_POINTS = 30;
export const WIN_XP = 500;

/**
 * Barème (aligné sur cod_win_points / cod_loss_points du backend) :
 *   victoire : +30 pour tous ;
 *   défaite  : pénalité du rang, réduite de 25 % pour un joueur seul.
 */
export function lossPoints(points = 0, groupSize = 1) {
  const penalty = rankFor(points).loss;
  return Math.min(points, groupSize === 1 ? Math.round(penalty * 0.75) : penalty);
}

/** « Solo », « Duo », « Trio », « Groupe de 4 », « Équipe de 5 ». */
export function groupLabel(size = 1) {
  return ["Solo", "Solo", "Duo", "Trio", "Groupe de 4", "Équipe de 5"][size] ?? `Groupe de ${size}`;
}

/** Niveau du joueur : un niveau tous les 1 000 XP (2 victoires). */
export function levelFor(xp = 0) {
  return Math.floor(xp / 1000) + 1;
}

export const PLATFORMS = {
  pc: "PC",
  playstation: "PS",
  xbox: "XBOX",
};
