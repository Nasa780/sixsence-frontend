import { rankLevel } from "./ranks";

/**
 * Emblèmes de rang, dessinés en SVG (aucune image à charger) : un cadre hexagonal
 * aux couleurs métalliques du rang et un symbole qui s'enrichit avec le niveau.
 *   Bronze, Argent, Or : 1, 2, 3 chevrons
 *   Platine : étoile · Diamant : gemme · Maître : étoile ailée
 *   Grand Maître : étoile cerclée ailée · Champion : couronne ailée
 *   Légende : couronne ailée surmontée d'une flamme
 *
 * Fournis sous forme d'adresse data: (emblemDataUrl), utilisable dans une balise <img>
 * côté site comme dans les images d'aperçu (next/og).
 */

/** Étoile à 5 branches centrée en (cx, cy). */
function star(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `<polygon points="${points.join(" ")}" fill="url(#m)" stroke="#0b0a08" stroke-width="0.8" stroke-linejoin="round"/>`;
}

/** Chevron pointant vers le bas, à la hauteur y. */
const chevron = (y) => `<path d="M19 ${y - 5}L32 ${y + 4}L45 ${y - 5}" stroke="url(#m)" stroke-width="5" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>`;

const crown = (y, jewel = true) =>
  `<path d="M17 ${y + 16}V${y}l7.5 7 7.5-11 7.5 11 7.5-7v${16}Z" fill="url(#m)" stroke="#0b0a08" stroke-width="0.8" stroke-linejoin="round"/>` +
  `<rect x="17" y="${y + 18}" width="30" height="4" fill="url(#m)"/>` +
  (jewel ? `<circle cx="32" cy="${y - 5.5}" r="2.2" fill="url(#m)"/>` : "");

function symbol(level) {
  switch (level) {
    case 1:
      return chevron(34);
    case 2:
      return chevron(28) + chevron(39);
    case 3:
      return chevron(23) + chevron(33) + chevron(43);
    case 4:
      return star(32, 33, 14, 6);
    case 5:
      return (
        `<polygon points="32,15 45,27 32,49 19,27" fill="url(#m)" stroke="#0b0a08" stroke-width="0.8" stroke-linejoin="round"/>` +
        `<path d="M19 27H45M26 27L32 15L38 27L32 49Z" stroke="#0b0a08" stroke-opacity="0.45" stroke-width="0.9" fill="none"/>`
      );
    case 6:
      return star(32, 33, 13, 5.6);
    case 7:
      return `<circle cx="32" cy="33" r="15" stroke="url(#m)" stroke-width="2.4" fill="none"/>` + star(32, 33, 10.5, 4.6);
    case 8:
      return crown(24);
    default:
      return (
        crown(29, false) +
        `<path d="M32 6c3.6 4.2 5.2 7.6 4.4 10.8-.6 2.6-2.4 4.2-4.4 4.2s-3.8-1.6-4.4-4.2C26.8 13.6 28.4 10.2 32 6Z" fill="url(#f)"/>`
      );
  }
}

/** Ailes de part et d'autre du cadre (Maître et au-delà). */
const wings =
  `<path d="M7 20L1 15L3 30L0 43L7 40Z" fill="url(#m)" stroke="#0b0a08" stroke-width="0.8" stroke-linejoin="round"/>` +
  `<path d="M57 20L63 15L61 30L64 43L57 40Z" fill="url(#m)" stroke="#0b0a08" stroke-width="0.8" stroke-linejoin="round"/>`;

/** SVG complet d'un emblème (64 × 64). */
export function emblemSvg(rank) {
  const level = rankLevel(rank);
  const hexagon = "32,4 56,18 56,46 32,60 8,46 8,18";
  const innerHexagon = "32,9.5 51.3,20.75 51.3,43.25 32,54.5 12.7,43.25 12.7,20.75";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
    `<defs>` +
    `<linearGradient id="m" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${rank.light}"/><stop offset="0.55" stop-color="${rank.color}"/><stop offset="1" stop-color="${rank.dark}"/></linearGradient>` +
    `<radialGradient id="c" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="${rank.color}" stop-opacity="0.32"/><stop offset="1" stop-color="#0b0a08" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="0.5" stop-color="#ffb347"/><stop offset="1" stop-color="#ff4d2e"/></linearGradient>` +
    `</defs>` +
    (level >= 6 ? wings : "") +
    `<polygon points="${hexagon}" fill="#0b0a08"/>` +
    `<polygon points="${hexagon}" fill="url(#c)"/>` +
    `<polygon points="${hexagon}" fill="none" stroke="url(#m)" stroke-width="3" stroke-linejoin="round"/>` +
    `<polygon points="${innerHexagon}" fill="none" stroke="${rank.color}" stroke-opacity="0.35" stroke-width="1"/>` +
    symbol(level) +
    `</svg>`
  );
}

/** Emblème sous forme d'adresse data: (balise <img>, next/og). */
export function emblemDataUrl(rank) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(emblemSvg(rank))}`;
}
