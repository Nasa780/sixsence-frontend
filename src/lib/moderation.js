/**
 * Motifs des demandes d'arbitrage et des signalements (alignés sur le backend :
 * services/moderation.ts et les contraintes de la migration 0005).
 */
export const ARBITRATION_REASONS = {
  cheating: "Triche suspectée",
  afk: "Joueur absent ou AFK",
  lobby: "Problème de partie (hôte, lobby, déconnexion)",
  score: "Désaccord sur le score",
  behavior: "Comportement toxique",
  other: "Autre",
};

export const REPORT_REASONS = {
  cheating: "Triche",
  toxicity: "Insultes ou comportement toxique",
  afk: "Abandon ou AFK",
  smurf: "Compte multiple",
  name: "Pseudo ou avatar inapproprié",
  other: "Autre",
};

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Badge « MVP du mois » (« mvp-2026-09 »), ou null pour un autre badge. */
export function monthlyMvpBadge(key) {
  const match = /^mvp-(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1] ?? match[2];
  return { label: `MVP du mois · ${month} ${match[1]}`, description: `Joueur le plus élu MVP en ${month} ${match[1]}.` };
}
