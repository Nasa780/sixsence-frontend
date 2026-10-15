/**
 * Cartes de visite : rareté et dessin de chaque carte (mêmes clés que src/cards.ts du
 * backend, qui décide des cartes obtenues). Les règles d'obtention viennent de GET /cod/cards.
 *
 * Dessin (art) :
 *   default   carte « SixSence » (motif or et emblème du site)
 *   rank      emblème du rang sur ses teintes ; avec hud { neon, deep } : interface « HUD » (cadre fin,
 *             coins néon, hachures, nom du rang en haut à droite sur le profil), image de fond possible
 *   glyph     chiffre ou sigle (Communes et Rares)
 *   sunset    cartes GTA 6 : coucher de soleil rétro (palette sunset), ville et palmiers ; glyph facultatif
 *   illustration  visuel provisoire des Épiques et Légendaires, remplacé par une image :
 *             ajouter { image: "/images/cartes/<clé>.webp", position, mobilePosition } quand
 *             l'illustration existe (bannière 2400 x 900, sujet vers 45 % de la largeur ;
 *             mobilePosition décale le sujet sur le bord droit du profil sur téléphone).
 *   mobileImage  image verticale propre au profil sur téléphone (remplace la bannière recadrée)
 *   light     voile du profil allégé (illustration sombre)
 *   og        bannière JPEG 1200 x 260 pour l'aperçu partagé (images et vidéos ; sinon dessin simplifié)
 *   video     fond animé : { video: "/images/cartes/<clé>.mp4", poster } (boucle courte sans son,
 *             moins de 1 Mo, vidéo verticale nette au centre et floutée derrière ; image fixe
 *             pour ceux qui ont demandé moins d'animations).
 */

export const RARITY = {
  commune: { label: "Commune", frame: "linear-gradient(135deg,#6b6b6b,#3a3a3a,#6b6b6b)", text: "#a3a3a3" },
  rare: { label: "Rare", frame: "linear-gradient(135deg,#93c5fd,#1d4ed8,#93c5fd)", text: "#93c5fd" },
  epique: { label: "Épique", frame: "linear-gradient(135deg,#d8b4fe,#7c3aed,#d8b4fe)", text: "#d8b4fe" },
  legendaire: { label: "Légendaire", frame: "linear-gradient(135deg,#fde68a,#b8860b,#fde68a)", text: "#fde68a" },
};

export const DEFAULT_CARD = "sixsence";

const CARDS = {
  sixsence: { rarity: "commune", art: { type: "default", og: "/images/cartes/og/sixsence.jpg" } },
  "rang-argent": { rarity: "commune", art: { type: "rank", rank: "Argent", hud: { neon: "#7cc8ff", deep: "#0b1520" } } },
  "rang-or": { rarity: "commune", art: { type: "rank", rank: "Or", hud: { neon: "#ffb43a", deep: "#1c1306" } } },
  "rang-platine": { rarity: "rare", art: { type: "rank", rank: "Platine", hud: { neon: "#2ff3e0", deep: "#041a1a" } } },
  "rang-diamant": { rarity: "rare", art: { type: "rank", rank: "Diamant" } },
  "rang-maitre": { rarity: "epique", art: { type: "rank", rank: "Maître", image: "/images/cartes/maitre.webp", og: "/images/cartes/og/maitre.jpg", position: "45% center", mobilePosition: "24% center", light: true } },
  "rang-grand-maitre": { rarity: "epique", art: { type: "rank", rank: "Grand Maître", image: "/images/cartes/grand-maitre.webp", og: "/images/cartes/og/grand-maitre.jpg", position: "45% center", mobilePosition: "24% center" } },
  "rang-champion": { rarity: "legendaire", art: { type: "rank", rank: "Champion" } },
  "rang-legende": { rarity: "legendaire", art: { type: "rank", rank: "Légende", video: "/images/cartes/legende.mp4", poster: "/images/cartes/legende-poster.webp", cover: true, position: "center", mobilePosition: "40% center", og: "/images/cartes/og/legende.jpg", light: true } },
  "premier-sang": { rarity: "commune", art: { type: "glyph", glyph: "1", color: "#f87171" } },
  domination: { rarity: "commune", art: { type: "glyph", glyph: "10", color: "#d4af37" } },
  veteran: { rarity: "commune", art: { type: "glyph", glyph: "50", color: "#b8c2cf" } },
  indestructible: { rarity: "rare", art: { type: "glyph", glyph: "×5", color: "#5cc8ff" } },
  "esprit-equipe": { rarity: "rare", art: { type: "glyph", glyph: "25", color: "#4fd1b0" } },
  "loup-solitaire": { rarity: "rare", art: { type: "glyph", glyph: "25", color: "#cbd5e1" } },
  polyvalent: { rarity: "rare", art: { type: "glyph", glyph: "4F", color: "#93c5fd" } },
  centurion: { rarity: "epique", art: { type: "illustration", glyph: "100", hue: "#a855f7", video: "/images/cartes/centurion.mp4", poster: "/images/cartes/centurion-poster.webp", cover: true, position: "center", mobilePosition: "41% center", og: "/images/cartes/og/centurion.jpg" } },
  invaincu: { rarity: "epique", art: { type: "illustration", glyph: "×10", hue: "#c084fc", image: "/images/cartes/invaincu.webp", og: "/images/cartes/og/invaincu.jpg", position: "45% center", mobilePosition: "36% center" } },
  "mvp-du-mois": { rarity: "legendaire", art: { type: "illustration", glyph: "MVP", hue: "#facc15" } },
  "mvp-10": { rarity: "rare", art: { type: "glyph", glyph: "MVP", color: "#facc15" } },
  fondateur: { rarity: "legendaire", art: { type: "illustration", glyph: "F", hue: "#e8c26a", video: "/images/cartes/fondateur.mp4", og: "/images/cartes/og/fondateur.jpg", poster: "/images/cartes/fondateur-poster.webp", aspect: "480/546" } },
  beta: { rarity: "rare", art: { type: "glyph", glyph: "β", color: "#5cc8ff", video: "/images/cartes/beta.mp4", og: "/images/cartes/og/beta.jpg", poster: "/images/cartes/beta-poster.webp" } },
  partenaire: { rarity: "rare", art: { type: "glyph", glyph: "P", color: "#ff9a5c" } },
  "staff-6": { rarity: "rare", art: { type: "glyph", glyph: "6", color: "#d4af37" } },
  "premiere-viree": { rarity: "commune", art: { type: "sunset", color: "#ff9a5c" } },
  habitue: { rarity: "rare", art: { type: "sunset", glyph: "×5", color: "#ff5f8a" } },
};

/** Illustrations propres à une saison (même clé que la carte, ex. « s1-champion »). */
const SEASON_ART = {};

/** Rareté et dessin d'une carte (cartes de saison « s<id>-… » comprises). */
export function cardInfo(key) {
  if (CARDS[key]) return { key, ...CARDS[key] };
  const season = /^s(\d+)-(participant|top10|champion)$/.exec(key ?? "");
  if (season) {
    const [, id, kind] = season;
    const extra = SEASON_ART[key];
    if (kind === "participant") return { key, rarity: "commune", art: { type: "glyph", glyph: `S${id}`, color: "#d4af37", ...extra } };
    if (kind === "top10") return { key, rarity: "epique", art: { type: "illustration", glyph: "10", hue: "#8b5cf6", ...extra } };
    return { key, rarity: "legendaire", art: { type: "illustration", glyph: "N°1", hue: "#f5b83d", ...extra } };
  }
  return { key: DEFAULT_CARD, ...CARDS[DEFAULT_CARD] };
}
