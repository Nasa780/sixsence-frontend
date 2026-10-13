import { rankLevel } from "./ranks";

/**
 * Emblèmes de rang, dessinés en SVG (aucune image à charger) : un cadre hexagonal
 * riveté aux couleurs métalliques du rang et un symbole gravé qui s'enrichit avec le niveau.
 *   Bronze, Argent, Or : 1, 2, 3 chevrons gravés (Or : étincelle)
 *   Platine : étoile à facettes · Diamant : gemme taillée
 *   Maître : épées croisées · Grand Maître : étoile dans une couronne de laurier
 *   Champion : couronne ornée · Légende : couronne ornée, laurier et flamme
 * Ailes à partir de Maître, de plus en plus grandes à chaque rang.
 *
 * Le dessin fait 90 × 64 (EMBLEM_RATIO) : l'hexagone occupe le carré central de 64 × 64
 * et les ailes débordent sur les côtés. Fourni en adresse data: (emblemDataUrl),
 * utilisable dans une balise <img> côté site comme dans les images d'aperçu (next/og).
 */

export const EMBLEM_RATIO = 90 / 64;
const VIEWBOX = "-13 0 90 64";

const OUT = `stroke="#0b0a08" stroke-width="0.7" stroke-linejoin="round"`;
const SHADE = `fill="#0b0a08" fill-opacity="0.3"`;
const SHINE = `fill="#ffffff" fill-opacity="0.22"`;
const pt = (x, y) => `${x.toFixed(2)},${y.toFixed(2)}`;

/** Chevron gravé (trait sombre au centre). */
const chevron = (y, w = 13) =>
  `<path d="M${32 - w} ${y - 5}L32 ${y + 4}L${32 + w} ${y - 5}" stroke="url(#m)" stroke-width="4.6" fill="none" stroke-linecap="square"/>` +
  `<path d="M${32 - w + 1.5} ${y - 5}L32 ${y + 2.6}L${32 + w - 1.5} ${y - 5}" stroke="#0b0a08" stroke-opacity="0.35" stroke-width="0.9" fill="none"/>`;

/** Étoile à facettes : chaque branche a un côté clair et un côté ombré. */
function star(cx, cy, R, r) {
  const outer = [];
  const inner = [];
  for (let i = 0; i < 5; i += 1) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const b = a + Math.PI / 5;
    outer.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    inner.push([cx + r * Math.cos(b), cy + r * Math.sin(b)]);
  }
  const all = outer.flatMap((p, i) => [p, inner[i]]);
  let out = `<polygon points="${all.map(([x, y]) => pt(x, y)).join(" ")}" fill="url(#m)" ${OUT}/>`;
  outer.forEach((p, i) => {
    out += `<polygon points="${pt(cx, cy)} ${pt(p[0], p[1])} ${pt(inner[i][0], inner[i][1])}" ${SHADE}/>`;
  });
  return out;
}

/** Petite étincelle à 4 branches. */
const sparkle = (x, y, s = 2.4) =>
  `<path d="M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z" fill="#ffffff" fill-opacity="0.9"/>`;

/** Gemme taillée (table, couronne, pavillon) avec facettes claires et sombres. */
function gem(cx, top, w, h) {
  const g = top + h * 0.34;
  const bottom = top + h;
  const L = cx - w / 2;
  const R = cx + w / 2;
  const tl = cx - w * 0.26;
  const tr = cx + w * 0.26;
  return (
    `<polygon points="${pt(tl, top)} ${pt(tr, top)} ${pt(R, g)} ${pt(cx, bottom)} ${pt(L, g)}" fill="url(#m)" ${OUT}/>` +
    `<polygon points="${pt(tl, top)} ${pt(cx, top)} ${pt(cx - w * 0.12, g)} ${pt(L, g)}" ${SHINE}/>` +
    `<polygon points="${pt(cx, g)} ${pt(R, g)} ${pt(cx, bottom)}" ${SHADE}/>` +
    `<path d="M${L} ${g}H${R}M${tl} ${top}L${cx - w * 0.12} ${g}L${cx} ${bottom}L${cx + w * 0.12} ${g}L${tr} ${top}M${cx} ${top}L${cx - w * 0.12} ${g}M${cx} ${top}L${cx + w * 0.12} ${g}" stroke="#0b0a08" stroke-opacity="0.45" stroke-width="0.6" fill="none"/>`
  );
}

/** Épée : lame avec arête, garde, poignée et pommeau. */
const sword = (angle) =>
  `<g transform="rotate(${angle} 32 33)">` +
  `<polygon points="32,11 34.4,15.5 34.4,39 29.6,39 29.6,15.5" fill="url(#m)" ${OUT}/>` +
  `<polygon points="32,11 34.4,15.5 34.4,39 32,39" ${SHADE}/>` +
  `<path d="M25 39.5Q32 37.5 39 39.5L38.5 42.5Q32 41 25.5 42.5Z" fill="url(#m)" ${OUT}/>` +
  `<rect x="30.7" y="42.5" width="2.6" height="6" fill="url(#m)"/><path d="M30.7 44.5h2.6M30.7 46.5h2.6" stroke="#0b0a08" stroke-opacity="0.4" stroke-width="0.6"/>` +
  `<circle cx="32" cy="50" r="2" fill="url(#m)" ${OUT}/></g>`;

/** Couronne de laurier : deux branches courbes, feuilles doubles avec nervure. */
function laurel(cx, cy, r, count = 5) {
  let out = "";
  for (const side of [-1, 1]) {
    const P0 = [cx + side * 2.5, cy + r];
    const P1 = [cx + side * (r + 5), cy + r * 0.35];
    const P2 = [cx + side * r * 0.62, cy - r * 0.78];
    out += `<path d="M${P0[0]} ${P0[1]}Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}" stroke="url(#m)" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < count; i += 1) {
      const t = 0.12 + (0.84 * i) / (count - 1);
      const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0];
      const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1];
      const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
      const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const len = Math.hypot(dx, dy);
      const nx = (-dy / len) * -side;
      const ny = (dx / len) * -side;
      for (const [k, tilt] of [[1, 38], [-1, -38]]) {
        const lx = x + nx * 2.6 * k;
        const ly = y + ny * 2.6 * k;
        const rot = angle + tilt * side * k;
        out +=
          `<g transform="rotate(${rot.toFixed(1)} ${lx.toFixed(2)} ${ly.toFixed(2)})"><ellipse cx="${lx.toFixed(2)}" cy="${ly.toFixed(2)}" rx="3.4" ry="1.4" fill="url(#m)"/>` +
          `<path d="M${(lx - 2.6).toFixed(2)} ${ly.toFixed(2)}H${(lx + 2.6).toFixed(2)}" stroke="#0b0a08" stroke-opacity="0.35" stroke-width="0.45"/></g>`;
      }
    }
  }
  return out;
}

/** Couronne ornée : pointes à perles, bandeau à 3 pierres, ombre intérieure. */
const crown = (y) =>
  `<path d="M17 ${y + 16}V${y + 1}l7.5 7 7.5-11 7.5 11 7.5-7v15Z" fill="url(#m)" ${OUT}/>` +
  `<path d="M32 ${y - 3}l7.5 11 7.5-7v15H32Z" ${SHADE}/>` +
  `<circle cx="17" cy="${y + 0.5}" r="1.8" fill="url(#m)" ${OUT}/><circle cx="47" cy="${y + 0.5}" r="1.8" fill="url(#m)" ${OUT}/><circle cx="32" cy="${y - 4.5}" r="2.1" fill="url(#m)" ${OUT}/>` +
  `<rect x="16" y="${y + 16}" width="32" height="5.5" fill="url(#m)" ${OUT}/>` +
  `<rect x="16" y="${y + 18.75}" width="32" height="2.75" ${SHADE}/>` +
  `<circle cx="24" cy="${y + 18.75}" r="1.4" fill="#0b0a08" fill-opacity="0.55"/><circle cx="32" cy="${y + 18.75}" r="1.7" fill="#ffffff" fill-opacity="0.75"/><circle cx="40" cy="${y + 18.75}" r="1.4" fill="#0b0a08" fill-opacity="0.55"/>`;

/** Flamme à trois langues. */
const flame = (y = 3) =>
  `<path d="M32 ${y}c4.5 5 6.5 9 5.4 13-.8 3-3 4.8-5.4 4.8s-4.6-1.8-5.4-4.8C25.5 ${y + 9} 27.5 ${y + 5} 32 ${y}Z" fill="url(#f)"/>` +
  `<path d="M26.5 ${y + 8}c1.8 2.4 2.4 4.4 1.8 6.4-.4 1.4-1.4 2.2-2.5 2-1.6-.3-2.2-2-1.6-3.9.5-1.6 1.2-2.8 2.3-4.5Z" fill="url(#f)"/>` +
  `<path d="M37.5 ${y + 8}c-1.8 2.4-2.4 4.4-1.8 6.4.4 1.4 1.4 2.2 2.5 2 1.6-.3 2.2-2 1.6-3.9-.5-1.6-1.2-2.8-2.3-4.5Z" fill="url(#f)"/>` +
  `<path d="M32 ${y + 9}c1.6 2 2.2 3.6 1.7 5.2-.3 1-1 1.6-1.7 1.6s-1.4-.6-1.7-1.6c-.5-1.6.1-3.2 1.7-5.2Z" fill="#fff3c4" fill-opacity="0.9"/>`;

/**
 * Plumes des ailes, de haut en bas : [départ y, longueur, montée].
 * Plus le rang est haut, plus il y a de plumes et plus elles sont longues et relevées.
 */
const WINGS = {
  6: [[17, 8, 4], [26, 9, 3], [35, 7, 1]],
  7: [[15, 10, 6], [23, 12, 5], [31, 11, 3], [39, 8, 1]],
  8: [[13, 13, 8], [21, 15, 7], [29, 14, 5], [37, 11, 3]],
  9: [[11, 17, 11], [18, 19, 9], [26, 19, 7], [34, 16, 5], [42, 12, 2]],
};

function wings(level) {
  const feathers = WINGS[Math.min(level, 9)];
  if (!feathers) return "";
  let out = "";
  for (const side of [-1, 1]) {
    const x0 = side === -1 ? 9 : 55;
    // Les plumes du bas d'abord : celles du haut passent par-dessus.
    for (const [y, len, rise] of [...feathers].reverse()) {
      const tipX = x0 + side * len;
      const tipY = y - rise;
      const c1x = x0 + side * len * 0.5;
      out +=
        `<path d="M${x0} ${y}Q${c1x} ${y - rise * 0.8 - 1} ${tipX} ${tipY}L${tipX - side * 1.8} ${tipY + 3.2}Q${x0 + side * len * 0.45} ${y + 2.4} ${x0} ${y + 5.6}Z" fill="url(#m)" ${OUT}/>` +
        `<path d="M${x0} ${y + 2.8}Q${c1x} ${y - rise * 0.4 + 1} ${tipX - side * 1.2} ${tipY + 1.6}" stroke="#0b0a08" stroke-opacity="0.35" stroke-width="0.5" fill="none"/>`;
    }
  }
  return out;
}

function symbol(level) {
  switch (level) {
    case 1:
      return chevron(34);
    case 2:
      return chevron(29) + chevron(40);
    case 3:
      return chevron(27) + chevron(37) + chevron(47) + sparkle(32, 15.5, 2.2);
    case 4:
      return star(32, 33, 15, 6.4);
    case 5:
      return gem(32, 17, 26, 30) + sparkle(45, 18, 2.6) + sparkle(19.5, 44, 1.8);
    case 6:
      return sword(-38) + sword(38) + gem(32, 28.5, 7, 8);
    case 7:
      return laurel(32, 34, 16) + star(32, 31, 9, 3.9);
    case 8:
      return crown(23) + sparkle(46, 17, 2.2);
    default:
      return laurel(32, 37, 15, 4) + crown(26) + flame(3);
  }
}

/** SVG complet d'un emblème (90 × 64). withWings={false} pour les très petites tailles. */
export function emblemSvg(rank, { withWings = true } = {}) {
  const level = rankLevel(rank);
  const hex = "32,4 56,18 56,46 32,60 8,46 8,18";
  const innerPts = [[32, 9.5], [51.3, 20.75], [51.3, 43.25], [32, 54.5], [12.7, 43.25], [12.7, 20.75]];
  const inner = innerPts.map(([x, y]) => pt(x, y)).join(" ");
  const rivets = innerPts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.25" fill="url(#m)"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="90" height="64"><defs>` +
    `<linearGradient id="m" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${rank.light}"/><stop offset="0.55" stop-color="${rank.color}"/><stop offset="1" stop-color="${rank.dark}"/></linearGradient>` +
    `<radialGradient id="c" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="${rank.color}" stop-opacity="0.32"/><stop offset="1" stop-color="#0b0a08" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="0.5" stop-color="#ffb347"/><stop offset="1" stop-color="#ff4d2e"/></linearGradient>` +
    `</defs>` +
    (withWings && level >= 6 ? wings(level) : "") +
    `<polygon points="${hex}" fill="#0b0a08"/><polygon points="${hex}" fill="url(#c)"/>` +
    `<polygon points="${hex}" fill="none" stroke="url(#m)" stroke-width="3" stroke-linejoin="round"/>` +
    (level >= 4 ? `<polygon points="32,6.8 53.6,19.4 53.6,44.6 32,57.2 10.4,44.6 10.4,19.4" fill="none" stroke="${rank.dark}" stroke-width="0.8"/>` : "") +
    `<polygon points="${inner}" fill="none" stroke="${rank.color}" stroke-opacity="0.35" stroke-width="1"/>` +
    rivets +
    (level >= 8 ? `<path d="M26 6.5L32 0.5L38 6.5L32 4Z" fill="url(#m)" ${OUT}/>` : "") +
    symbol(level) +
    `</svg>`
  );
}

/** Emblème sous forme d'adresse data: (balise <img>, next/og). */
export function emblemDataUrl(rank, options) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(emblemSvg(rank, options))}`;
}
