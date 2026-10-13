/**
 * Rangs du classé, identiques à la page Ranked (section « Les rangs ») et au
 * barème du backend (fonction SQL cod_loss_penalty).
 *
 * Chaque rang a sa teinte métallique, utilisée par l'emblème, les barres, le nom et
 * le contour des avatars : light (reflet), color (teinte principale), dark (ombre),
 * text (couleur lisible pour un pseudo ou un libellé sur fond noir).
 */
export const RANKS = [
  { name: "Légende", min: 3000, light: "#ffd36b", color: "#ff8a3d", dark: "#e8364a", text: "#ffa063", loss: 50 },
  { name: "Champion", min: 2100, light: "#ffe3f8", color: "#f0a6e8", dark: "#9b7bff", text: "#f7bdef", loss: 50 },
  { name: "Grand Maître", min: 1800, light: "#ffc8f1", color: "#e05cc6", dark: "#8a2479", text: "#ef8ad9", loss: 50 },
  { name: "Maître", min: 1500, light: "#e6dcff", color: "#a78bfa", dark: "#5b3fc4", text: "#c4b2ff", loss: 50 },
  { name: "Diamant", min: 1200, light: "#e0f7ff", color: "#5cc8ff", dark: "#1f6fb2", text: "#93daff", loss: 35 },
  { name: "Platine", min: 900, light: "#cdfbea", color: "#4fd1b0", dark: "#1e7d68", text: "#83e6cc", loss: 30 },
  { name: "Or", min: 600, light: "#fbe7a1", color: "#d4af37", dark: "#8a6d12", text: "#f1d77a", loss: 25 },
  { name: "Argent", min: 300, light: "#f5f8fb", color: "#b8c2cf", dark: "#5f6a78", text: "#dde3ea", loss: 20 },
  { name: "Bronze", min: 0, light: "#f3bf95", color: "#c97b4b", dark: "#74401f", text: "#e9a77a", loss: 15 },
];

/** Dégradé métallique d'un rang (CSS), du reflet à l'ombre. */
export function rankGradient(rank, angle = 180) {
  return `linear-gradient(${angle}deg, ${rank.light} 0%, ${rank.color} 55%, ${rank.dark} 100%)`;
}

/** Niveau d'un rang : 1 = Bronze … 8 = Champion, 9 = Légende. */
export function rankLevel(rank) {
  return RANKS.length - RANKS.findIndex((item) => item.name === rank.name);
}

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
 * Barème (calculé par le backend, fonctions SQL cod_points_preview et cod_loss_penalty) :
 *   victoire : +50 pour tout le monde ;
 *   défaite  : Bronze -15, Argent -20, Or -25, Platine -30, Diamant -35, -50 dès Maître
 *              (champ loss de chaque rang), réduite de 25 % pour un joueur seul ;
 *   placement : pendant les 10 premiers matchs de la saison, victoires doublées (+100).
 * Les points en jeu de chaque joueur sont affichés avant le match (PointsAtStake).
 */
export const WIN_POINTS = 50;
export const WIN_XP = 500;
export const PLACEMENT_MATCHES = 10;

/** Réduction de la défaite pour un joueur seul (sans groupe), en %. */
export const SOLO_LOSS_REDUCTION = 25;

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
