/**
 * Rôles de l'équipe SixSence (alignés sur src/roles.ts du backend) :
 *   admin   : tout (gestion du site, rôles, événements, saison…)
 *   staff   : contestations, demandes d'arbitrage, signalements et sanctions
 *   arbitre : contestations et demandes d'arbitrage
 */
export const ROLE_LABELS = { member: "Membre", arbitre: "Arbitre", staff: "Staff", admin: "Admin" };

/** Couleur et étiquette des messages de l'équipe dans les tchats de match (rôle envoyé par le backend). */
export const STAFF_CHAT = {
  admin: { label: "Admin", color: "#f472b6" },
  staff: { label: "Staff", color: "#a78bfa" },
  arbitre: { label: "Arbitre", color: "#fb923c" },
};

/** Tranche les matchs (contestations, demandes d'arbitrage). */
export const isReferee = (role) => ["admin", "staff", "arbitre"].includes(role);
/** Modère les joueurs (signalements, sanctions). */
export const isModerator = (role) => ["admin", "staff"].includes(role);

/** Exclusion définitive : le backend enregistre une fin au 31/12/9999. */
export const isPermanentBan = (until) => Boolean(until) && new Date(until).getUTCFullYear() >= 9000;
