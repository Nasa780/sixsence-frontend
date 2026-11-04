import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

const MARGIN = { top: 22, right: 8, bottom: 22, left: 30 };

/** Graduation ronde au-dessus de la valeur la plus haute (1, 2 ou 5 × 10ⁿ par intervalle), en nombres entiers. */
function scaleOf(max) {
  const wanted = Math.max(1, max) / 3;
  const power = 10 ** Math.floor(Math.log10(wanted));
  const step = Math.max(1, [1, 2, 5, 10].map((n) => n * power).find((n) => n >= wanted));
  const top = Math.ceil(Math.max(1, max) / step) * step;
  const ticks = [];
  for (let value = 0; value <= top; value += step) ticks.push(value);
  return { top, ticks };
}

/** Largeur réelle du conteneur : le graphique se dessine en vrais pixels, le texte garde sa taille. */
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/** Barre à sommet arrondi, posée sur la ligne de base. */
function barPath(x, y, width, base) {
  const radius = Math.min(4, width / 2, base - y);
  return `M${x},${base}V${y + radius}Q${x},${y} ${x + radius},${y}H${x + width - radius}Q${x + width},${y} ${x + width},${y + radius}V${base}Z`;
}

/**
 * Graphique d'une seule série : courbe (`type="area"`, pour ce qui se suit dans le temps) ou barres. Échelle à partir
 * de zéro, graduations discrètes, moyenne en pointillés (`average`), pic écrit sur le graphique, ligne de repère et
 * infobulle sous la souris ou le doigt. `points` : [{ key, tick, label, value }].
 */
export function ActivityChart({ title, summary, points, color, unit, type = "bar", height = 170, average = false, empty = "Rien sur cette période." }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const reduced = useReducedMotion();
  const gradient = useId();

  const values = points.map((point) => point.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const peak = Math.max(...values);
  const mean = points.length ? total / points.length : 0;
  const { top, ticks } = scaleOf(peak);

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const base = MARGIN.top + innerHeight;
  const band = points.length ? innerWidth / points.length : 0;
  const xOf = (index) => MARGIN.left + band * (index + 0.5);
  const yOf = (value) => base - (value / top) * innerHeight;
  const barWidth = Math.min(28, Math.max(3, band * 0.68));

  const tickEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerWidth / 62))));
  const peakIndex = values.indexOf(peak);
  const line = points.map((point, index) => `${index ? "L" : "M"}${xOf(index)},${yOf(point.value)}`).join("");
  const area = `${line}L${xOf(points.length - 1)},${base}L${xOf(0)},${base}Z`;
  const active = hover === null ? null : points[hover];

  /** Point le plus proche du pointeur : toute la hauteur de la colonne réagit, pas seulement la barre. */
  const track = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const index = Math.floor(((event.clientX - box.left - MARGIN.left) / innerWidth) * points.length);
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <figure className="border border-white/10 bg-white/[0.02] p-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-display text-lg font-bold uppercase tracking-wide">{title}</span>
        {summary ? <span className="text-xs text-white/50">{summary}</span> : null}
      </figcaption>

      <div ref={ref} className="relative mt-3 touch-pan-y" style={{ height }}>
        {width > 0 ? (
          <svg width={width} height={height} role="img" aria-label={`${title} : ${total} ${unit}, ${peak} au plus haut`} onPointerMove={track} onPointerDown={track} onPointerLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={width - MARGIN.right} y1={yOf(tick)} y2={yOf(tick)} stroke="white" strokeOpacity={tick === 0 ? 0.2 : 0.06} />
                <text x={MARGIN.left - 6} y={yOf(tick) + 3.5} textAnchor="end" fontSize="10" fill="white" fillOpacity="0.4" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {tick}
                </text>
              </g>
            ))}

            {active ? <rect x={xOf(hover) - band / 2} y={MARGIN.top} width={band} height={innerHeight} fill="white" fillOpacity="0.04" /> : null}

            {total > 0 && type === "area" ? (
              <>
                <motion.path d={area} fill={`url(#${gradient})`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
                <motion.path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
              </>
            ) : null}

            {type === "bar"
              ? points.map((point, index) =>
                  point.value > 0 ? (
                    <motion.path
                      key={point.key}
                      d={barPath(xOf(index) - barWidth / 2, Math.min(yOf(point.value), base - 3), barWidth, base)}
                      fill={color}
                      fillOpacity={hover === null || hover === index ? 1 : 0.4}
                      style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                      initial={reduced ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.45, delay: reduced ? 0 : index * 0.015, ease: "easeOut" }}
                    />
                  ) : null,
                )
              : null}

            {average && total > 0 ? (
              <>
                <line x1={MARGIN.left} x2={width - MARGIN.right} y1={yOf(mean)} y2={yOf(mean)} stroke="white" strokeOpacity="0.35" strokeDasharray="3 4" />
                <text x={width - MARGIN.right} y={yOf(mean) - 5} textAnchor="end" fontSize="10" fill="white" fillOpacity="0.5">
                  moyenne {Math.round(mean)}
                </text>
              </>
            ) : null}

            {total > 0 && !active ? (
              <text
                x={Math.min(width - MARGIN.right - 12, Math.max(MARGIN.left + 12, xOf(peakIndex)))}
                y={yOf(peak) - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="white"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {peak}
              </text>
            ) : null}

            {active && type === "area" ? (
              <>
                <line x1={xOf(hover)} x2={xOf(hover)} y1={MARGIN.top} y2={base} stroke="white" strokeOpacity="0.25" />
                <circle cx={xOf(hover)} cy={yOf(active.value)} r="5" fill={color} stroke="#0a0a0a" strokeWidth="2" />
              </>
            ) : null}

            {points.map((point, index) =>
              (points.length - 1 - index) % tickEvery === 0 ? (
                <text key={point.key} x={xOf(index)} y={height - 6} textAnchor="middle" fontSize="10" fill="white" fillOpacity="0.4">
                  {point.tick}
                </text>
              ) : null,
            )}
          </svg>
        ) : null}

        {total === 0 && width > 0 ? <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 pl-8 text-center text-sm text-white/40">{empty}</p> : null}

        {active ? (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max max-w-[220px] -translate-x-1/2 border border-white/15 bg-ink/95 px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: Math.min(width - 90, Math.max(90, xOf(hover))) }}
          >
            <p className="text-white/55">{active.label}</p>
            <p className="font-semibold tabular-nums">
              {active.value} {unit}
            </p>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
