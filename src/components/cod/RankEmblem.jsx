import { useMemo } from "react";
import { cn } from "../../lib/cn";
import { EMBLEM_RATIO, emblemDataUrl } from "../../lib/rankEmblem";
import { rankLevel } from "../../lib/ranks";

/** Braises de Légende : position de départ, dérive et décalage de chaque particule. */
const EMBERS = [
  { left: "22%", drift: -6, delay: 0 },
  { left: "38%", drift: 4, delay: 0.9 },
  { left: "52%", drift: -3, delay: 1.7 },
  { left: "66%", drift: 6, delay: 0.4 },
  { left: "78%", drift: -4, delay: 2.2 },
  { left: "45%", drift: 2, delay: 1.3 },
];

/**
 * Emblème de rang, avec des effets qui montent avec le niveau :
 *   Diamant et au-delà : reflet qui balaie l'emblème
 *   Champion et Légende : halo qui respire
 *   Légende : braises qui s'élèvent
 * animated={false} pour les petites tailles répétées (listes) : emblème seul.
 * size est la taille de l'hexagone : les ailes (Maître et au-delà) débordent sur les côtés
 * sans changer la place occupée (spread : réserve aussi leur place, à côté d'un texte) ;
 * sous 40 px, l'emblème est affiché sans ailes.
 */
export function RankEmblem({ rank, size = 48, animated = true, spread = false, className = "" }) {
  const level = rankLevel(rank);
  const withWings = size >= 40;
  const src = useMemo(() => emblemDataUrl(rank, { withWings }), [rank, withWings]);
  const width = Math.round(size * EMBLEM_RATIO);
  // Le dessin est plus large que l'hexagone : on le centre sur la place réservée.
  const drawing = { width, height: size, left: (size - width) / 2, top: 0 };
  const sheen = animated && level >= 5;
  const glow = animated && level >= 8;
  const embers = animated && level >= 9 && size >= 40;

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size, "--rank-glow": rank.color, ...(spread && withWings && level >= 6 ? { marginInline: (width - size) / 2 } : null) }}
      role="img"
      aria-label={`Rang ${rank.name}`}
    >
      <img
        src={src}
        alt=""
        width={width}
        height={size}
        draggable={false}
        className={cn("pointer-events-none absolute max-w-none select-none", glow && "rank-glow")}
        style={{ ...drawing, ...(!glow && level >= 5 ? { filter: `drop-shadow(0 0 ${Math.round(size / 10)}px ${rank.color}66)` } : null) }}
      />
      {sheen ? (
        <span
          aria-hidden
          className="rank-sheen pointer-events-none absolute"
          style={{ ...drawing, maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
        />
      ) : null}
      {embers
        ? EMBERS.map((ember, index) => (
            <span
              key={index}
              aria-hidden
              className="rank-ember"
              style={{ left: ember.left, animationDelay: `${ember.delay}s`, "--ember-drift": `${ember.drift}px`, "--ember-rise": `${-Math.round(size * 0.85)}px` }}
            />
          ))
        : null}
    </span>
  );
}
