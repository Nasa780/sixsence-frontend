/**
 * Maps de Modern Warfare 4 (mêmes identifiants que MAP_CATALOG de backend/src/services/maps.ts) et leurs images :
 * public/images/maps/<id>.webp (1280 x 720) et public/images/maps/og/<id>.jpg (1200 x 400, images next/og).
 */
export const MAPS = [
  { id: "cachette", name: "Cachette" },
  { id: "coal", name: "Coal" },
  { id: "lithium", name: "Lithium" },
  { id: "lotus", name: "Lotus" },
  { id: "mumbai", name: "Mumbai" },
  { id: "munition", name: "Munition" },
  { id: "nautical", name: "Nautical" },
  { id: "reactor-u92", name: "Reactor U92" },
  { id: "rooftops", name: "Rooftops" },
  { id: "secteur-lethal", name: "Secteur Léthal" },
  { id: "sentry", name: "Sentry" },
  { id: "silkworm", name: "Silkworm" },
  { id: "transit-213", name: "Transit 213" },
];

/** Modes et leur couleur (Classé vert, Division cyan, Tournoi rouge). */
export const MAP_MODES = [
  { id: "classe", label: "Classé", color: "#34d399", hint: "Une map tirée au sort par match" },
  { id: "division", label: "Division", color: "#22d3ee", hint: "Trois maps tirées au sort par BO3" },
  { id: "tournoi", label: "Tournoi", color: "#e5484d", hint: "Coupes Horus et Anubis, tournoi de saison" },
];

/** Identifiant d'une map d'après son nom (« Secteur Léthal » → « secteur-lethal »). */
export function mapId(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Image d'une map (null pour une ancienne map sans image). */
export function mapImage(name, { og = false } = {}) {
  const id = mapId(name);
  if (!MAPS.some((map) => map.id === id)) return null;
  return og ? `/images/maps/og/${id}.jpg` : `/images/maps/${id}.webp`;
}
