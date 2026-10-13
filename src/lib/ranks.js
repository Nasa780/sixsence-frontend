/**
 * Rangs du classé, identiques à la page Ranked (section « Les rangs ») et au
 * barème du backend (fonction SQL cod_loss_penalty).
 */
export const RANKS = [
  { name: "Légende", min: 3000, color: "#ff6b4a", icon: "/assets/Iconlegende.svg", loss: 50 },
  { name: "Champion", min: 2100, color: "#e8b4f8", icon: "/assets/Iconchampion.svg", loss: 50 },
  { name: "Grand Maître", min: 1800, color: "#c084fc", icon: "/assets/Icongrandmaitre.svg", loss: 50 },
  { name: "Maître", min: 1500, color: "#a78bfa", icon: "/assets/Iconmaitre.svg", loss: 50 },
  { name: "Diamant", min: 1200, color: "#38bdf8", icon: "/assets/Icondiament.svg", loss: 35 },
  { name: "Platine", min: 900, color: "#34d399", icon: "/assets/Iconplatine.svg", loss: 30 },
  { name: "Or", min: 600, color: "#c9a227", icon: "/assets/Iconor.svg", loss: 25 },
  { name: "Argent", min: 300, color: "#94a3b8", icon: "/assets/Iconargent.svg", loss: 20 },
  { name: "Bronze", min: 0, color: "#c97b4b", icon: "/assets/Iconbronze.svg", loss: 15 },
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

/**
 * Barème (calculé par le backend, fonction SQL cod_points_preview) :
 *   victoire : 50 points contre une équipe de même niveau, de +45 à +55 selon l'écart ;
 *   défaite  : pénalité du rang, réduite contre plus fort, augmentée contre plus faible,
 *              et réduite de 25 % pour un joueur seul ;
 *   placement : les 10 premiers matchs de la saison comptent double ;
 *   série : 3e victoire d'affilée +5, 4e +10, 5e et suivantes +15.
 * Les points en jeu de chaque joueur sont affichés avant le match (PointsAtStake).
 */
export const WIN_POINTS = 50;
export const WIN_MIN = 45;
export const WIN_MAX = 55;
export const WIN_XP = 500;
export const PLACEMENT_MATCHES = 10;
export const STREAK_BONUSES = [
  { streak: 3, bonus: 5 },
  { streak: 4, bonus: 10 },
  { streak: 5, bonus: 15 },
];

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
