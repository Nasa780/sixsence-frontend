import { useMemo } from "react";
import { cn } from "../../lib/cn";
import { emblemDataUrl } from "../../lib/rankEmblem";
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
 */
export function RankEmblem({ rank, size = 48, animated = true, className = "" }) {
  const level = rankLevel(rank);
  const src = useMemo(() => emblemDataUrl(rank), [rank]);
  const sheen = animated && level >= 5;
  const glow = animated && level >= 8;
  const embers = animated && level >= 9 && size >= 40;

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size, "--rank-glow": rank.color }}
      role="img"
      aria-label={`Rang ${rank.name}`}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={cn("h-full w-full select-none", glow && "rank-glow")}
        style={!glow && level >= 5 ? { filter: `drop-shadow(0 0 ${Math.round(size / 10)}px ${rank.color}66)` } : undefined}
      />
      {sheen ? (
        <span
          aria-hidden
          className="rank-sheen pointer-events-none absolute inset-0"
          style={{ maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
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
