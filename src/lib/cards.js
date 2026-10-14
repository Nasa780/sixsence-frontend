/**
 * Cartes de visite : rareté et dessin de chaque carte (mêmes clés que src/cards.ts du
 * backend, qui décide des cartes obtenues). Les règles d'obtention viennent de GET /cod/cards.
 *
 * Dessin (art) :
 *   default   carte « SixSence » (motif or et emblème du site)
 *   rank      emblème du rang sur ses teintes
 *   glyph     chiffre ou sigle (Communes et Rares)
 *   illustration  visuel provisoire des Épiques et Légendaires, remplacé par une image :
 *             ajouter { image: "/images/cartes/<clé>.webp" } quand l'illustration existe.
 */

export const RARITY = {
  commune: { label: "Commune", frame: "linear-gradient(135deg,#6b6b6b,#3a3a3a,#6b6b6b)", text: "#a3a3a3" },
  rare: { label: "Rare", frame: "linear-gradient(135deg,#93c5fd,#1d4ed8,#93c5fd)", text: "#93c5fd" },
  epique: { label: "Épique", frame: "linear-gradient(135deg,#d8b4fe,#7c3aed,#d8b4fe)", text: "#d8b4fe" },
  legendaire: { label: "Légendaire", frame: "linear-gradient(135deg,#fde68a,#b8860b,#fde68a)", text: "#fde68a" },
};

export const DEFAULT_CARD = "sixsence";

const CARDS = {
  sixsence: { rarity: "commune", art: { type: "default" } },
  "rang-argent": { rarity: "commune", art: { type: "rank", rank: "Argent" } },
  "rang-or": { rarity: "commune", art: { type: "rank", rank: "Or" } },
  "rang-platine": { rarity: "rare", art: { type: "rank", rank: "Platine" } },
  "rang-diamant": { rarity: "rare", art: { type: "rank", rank: "Diamant" } },
  "rang-maitre": { rarity: "epique", art: { type: "rank", rank: "Maître" } },
  "rang-grand-maitre": { rarity: "epique", art: { type: "rank", rank: "Grand Maître" } },
  "rang-champion": { rarity: "legendaire", art: { type: "rank", rank: "Champion" } },
  "rang-legende": { rarity: "legendaire", art: { type: "rank", rank: "Légende" } },
  "premier-sang": { rarity: "commune", art: { type: "glyph", glyph: "1", color: "#f87171" } },
  domination: { rarity: "commune", art: { type: "glyph", glyph: "10", color: "#d4af37" } },
  veteran: { rarity: "commune", art: { type: "glyph", glyph: "50", color: "#b8c2cf" } },
  indestructible: { rarity: "rare", art: { type: "glyph", glyph: "×5", color: "#5cc8ff" } },
  "esprit-equipe": { rarity: "rare", art: { type: "glyph", glyph: "25", color: "#4fd1b0" } },
  "loup-solitaire": { rarity: "rare", art: { type: "glyph", glyph: "25", color: "#cbd5e1" } },
  polyvalent: { rarity: "rare", art: { type: "glyph", glyph: "4F", color: "#93c5fd" } },
  centurion: { rarity: "epique", art: { type: "illustration", glyph: "100", hue: "#a855f7" } },
  invaincu: { rarity: "epique", art: { type: "illustration", glyph: "×10", hue: "#c084fc" } },
  "mvp-du-mois": { rarity: "legendaire", art: { type: "illustration", glyph: "MVP", hue: "#facc15" } },
  "mvp-10": { rarity: "rare", art: { type: "glyph", glyph: "MVP", color: "#facc15" } },
  fondateur: { rarity: "legendaire", art: { type: "illustration", glyph: "F", hue: "#e8c26a" } },
  beta: { rarity: "rare", art: { type: "glyph", glyph: "β", color: "#94a3b8" } },
  partenaire: { rarity: "rare", art: { type: "glyph", glyph: "P", color: "#ff9a5c" } },
  "staff-6": { rarity: "rare", art: { type: "glyph", glyph: "6", color: "#d4af37" } },
  "premiere-viree": { rarity: "commune", art: { type: "glyph", glyph: "GTA", color: "#ff9a5c" } },
  habitue: { rarity: "rare", art: { type: "glyph", glyph: "×5", color: "#ff7a59" } },
};

/** Rareté et dessin d'une carte (cartes de saison « s<id>-… » comprises). */
export function cardInfo(key) {
  if (CARDS[key]) return { key, ...CARDS[key] };
  const season = /^s(\d+)-(participant|top10|champion)$/.exec(key ?? "");
  if (season) {
    const [, id, kind] = season;
    if (kind === "participant") return { key, rarity: "commune", art: { type: "glyph", glyph: `S${id}`, color: "#d4af37" } };
    if (kind === "top10") return { key, rarity: "epique", art: { type: "illustration", glyph: "10", hue: "#8b5cf6" } };
    return { key, rarity: "legendaire", art: { type: "illustration", glyph: "N°1", hue: "#f5b83d" } };
  }
  return { key: DEFAULT_CARD, ...CARDS[DEFAULT_CARD] };
}

/** Couleur dominante d'une carte (fond de l'aperçu partagé). */
export function cardTint(key, ranks) {
  const { art } = cardInfo(key);
  if (art.type === "rank") return ranks.find((rank) => rank.name === art.rank)?.color ?? "#d4af37";
  if (art.type === "glyph") return art.color;
  if (art.type === "illustration") return art.hue;
  return "#d4af37";
}
