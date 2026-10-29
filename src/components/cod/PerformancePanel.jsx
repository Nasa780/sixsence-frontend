import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { buildSeries, summarize } from "../../lib/performance";
import { RANKS, rankFor } from "../../lib/ranks";
import { TacticalCard } from "../ui/TacticalCard";
import { CountUp } from "../effects/CountUp";

const RANGES = [
  { id: 10, label: "10 matchs" },
  { id: 25, label: "25 matchs" },
  { id: "saison", label: "Saison" },
];

const signed = (value) => (value > 0 ? `+${value}` : value === 0 ? "±0" : `${value}`);
const shortDate = (date) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

/**
 * Panneau « Performance » façon diffusion e-sport : chiffres clés de la période,
 * courbe des points avec les paliers de rang, détail de chaque match au survol
 * (ou au toucher) et forme récente. Animé à l'apparition : chiffres qui défilent, courbe qui se dessine de gauche
 * à droite (et à chaque changement de période), forme qui s'allume match par match.
 *
 * Pour une équipe (Division) : series déjà construite, eyebrow « Saison · Division », sans paliers de rang
 * (ranks=false), pointsHint sous les points, emptyText si aucun match.
 */
export function PerformancePanel({ history, userId, points, seasonId, seasonLabel, series: given = null, eyebrow = null, ranks = true, pointsHint = null, emptyText = null }) {
  const [range, setRange] = useState(10);
  const [hover, setHover] = useState(null);
  const chartRef = useRef(null);
  const reduce = useReducedMotion();

  const series = useMemo(() => given ?? buildSeries({ history, userId, points, seasonId }), [given, history, userId, points, seasonId]);

  // Portion affichée : les N derniers matchs, ou toute la saison.
  const view = useMemo(() => {
    const entries = range === "saison" ? series.entries : series.entries.slice(-range);
    const skipped = series.entries.length - entries.length;
    const start = skipped > 0 ? series.entries[skipped - 1].points : series.start;
    return { start, entries, stats: summarize(start, entries) };
  }, [series, range]);

  const { start, entries, stats } = view;

  if (!stats) {
    return (
      <TacticalCard cut={24} innerClassName="relative overflow-hidden p-8 sm:p-10">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-40 mask-fade" />
        <div className="relative text-center">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Performance · {seasonLabel}</p>
          <p className="mt-4 font-display text-3xl font-black uppercase leading-none">Aucun match terminé cette saison</p>
          <p className="mt-3 text-sm text-white/50">{emptyText ?? "La courbe, la forme et les chiffres clés apparaîtront après le premier match classé."}</p>
        </div>
      </TacticalCard>
    );
  }

  // --- Géométrie de la courbe (en % pour rester nette à toutes les tailles) ---
  const values = [start, ...entries.map((entry) => entry.points)];
  const padding = Math.max(25, (stats.peak - stats.low) * 0.18);
  const top = stats.peak + padding;
  const bottom = Math.max(0, stats.low - padding);
  const span = Math.max(1, top - bottom);
  const x = (index) => (values.length === 1 ? 50 : (index / (values.length - 1)) * 100);
  const y = (value) => ((top - value) / span) * 100;
  const line = values.map((value, index) => `${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(" ");
  const peakIndex = values.lastIndexOf(stats.peak);
  const thresholds = ranks ? RANKS.filter((rank) => rank.min > bottom && rank.min < top) : [];
  const lastIndex = values.length - 1;
  const current = rankFor(values[lastIndex]);
  const active = hover ?? null;
  const activeEntry = active !== null && active > 0 ? entries[active - 1] : null;

  function pick(event) {
    const box = chartRef.current?.getBoundingClientRect();
    if (!box) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const index = Math.round(ratio * lastIndex);
    setHover(index === 0 ? null : index);
  }

  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
      <div aria-hidden className="absolute -left-16 top-0 h-full w-56 -skew-x-[24deg] bg-linear-to-b from-gold/10 to-transparent" />

      {/* --- Bandeau : titre et période ----------------------------------- */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 border-b border-white/10 px-6 pb-5 pt-6 sm:px-8">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">{eyebrow ?? `${seasonLabel} · classé`}</p>
          <h3 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">Performance</h3>
        </div>
        <div role="tablist" aria-label="Période" className="flex gap-1.5">
          {RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={range === item.id}
              onClick={() => {
                setRange(item.id);
                setHover(null);
              }}
              className={cn(
                "clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors",
                range === item.id ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Chiffres clés ------------------------------------------------- */}
      <dl className="relative grid grid-cols-2 border-b border-white/10 sm:grid-cols-4 [&>div]:border-white/10 [&>div:nth-child(even)]:border-l [&>div:nth-child(n+3)]:border-t sm:[&>div:nth-child(n+2)]:border-l sm:[&>div:nth-child(n+3)]:border-t-0">
        <Kpi label="Points" value={<CountUp value={values[lastIndex]} />} hint={pointsHint ?? current.name} hintColor={ranks ? current.color : undefined} accent />
        <Kpi
          label="Variation"
          value={<CountUp value={stats.change} format={signed} delay={150} />}
          tone={stats.change > 0 ? "win" : stats.change < 0 ? "loss" : null}
          icon={stats.change >= 0 ? LuTrendingUp : LuTrendingDown}
          hint={`sur ${entries.length} match${entries.length > 1 ? "s" : ""}`}
        />
        <Kpi label="Pic" value={<CountUp value={stats.peak} delay={300} />} hint={`creux ${stats.low}`} />
        <Kpi label="Bilan" value={`${stats.wins}V – ${stats.losses}D`} hint={stats.ratio === null ? "invaincu" : `ratio ${stats.ratio.toFixed(2)}`} />
      </dl>

      {/* --- Courbe ---------------------------------------------------------- */}
      <div className="relative px-6 pb-3 pt-8 sm:px-8">
        <motion.div
          key={range}
          ref={chartRef}
          initial={reduce ? false : { clipPath: "inset(-40% 100% -40% -5%)" }}
          whileInView={{ clipPath: "inset(-40% -5% -40% -5%)", transitionEnd: { clipPath: "none" } }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
          className="relative h-56 touch-none select-none sm:h-64"
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={(event) => event.pointerType === "mouse" && setHover(null)}
          role="img"
          aria-label={`Points sur la période : de ${start} à ${values[lastIndex]}, pic à ${stats.peak}.`}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="perf-aire" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 50, 75].map((level) => (
              <line key={level} x1="0" x2="100" y1={level} y2={level} stroke="white" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
            ))}
            {thresholds.map((rank) => (
              <line
                key={rank.name}
                x1="0"
                x2="100"
                y1={y(rank.min)}
                y2={y(rank.min)}
                stroke={rank.color}
                strokeOpacity="0.55"
                strokeDasharray="4 5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <polygon points={`0,100 ${line} 100,100`} fill="url(#perf-aire)" />
            <polyline points={line} fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {active !== null ? (
              <line x1={x(active)} x2={x(active)} y1="0" y2="100" stroke="white" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
            ) : null}
          </svg>

          {/* Paliers de rang */}
          {thresholds.map((rank) => (
            <span
              key={rank.name}
              className="absolute right-0 -translate-y-full pb-0.5 font-tech text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ top: `${y(rank.min)}%`, color: rank.color }}
            >
              {rank.name} · {rank.min}
            </span>
          ))}

          {/* Un point par match : vert victoire, rouge défaite */}
          {entries.map((entry, index) => (
            <span
              key={entry.id}
              aria-hidden
              className={cn(
                "absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-ink transition-transform",
                entry.bonus ? "bg-gold" : entry.won ? "bg-win" : "bg-loss",
                active === index + 1 && "scale-150",
                entries.length > 40 && active !== index + 1 && "opacity-0",
              )}
              style={{ left: `${x(index + 1)}%`, top: `${y(entry.points)}%` }}
            />
          ))}

          {/* Pic de la période */}
          {peakIndex > 0 && peakIndex !== lastIndex ? (
            <span
              className="absolute -translate-x-1/2 -translate-y-[160%] font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-gold-light"
              style={{ left: `${x(peakIndex)}%`, top: `${y(stats.peak)}%` }}
            >
              Pic
            </span>
          ) : null}

          {/* Dernier point : valeur actuelle */}
          <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x(lastIndex)}%`, top: `${y(values[lastIndex])}%` }}>
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />
            <span className="relative block h-3 w-3 rounded-full border-2 border-ink bg-gold shadow-[0_0_14px_var(--color-gold)]" />
          </span>

          {/* Détail du match survolé */}
          {activeEntry ? (
            <div
              className={cn(
                "pointer-events-none absolute top-0 z-10 w-48 border border-white/15 bg-ink-800/95 p-3 shadow-2xl shadow-black/60 backdrop-blur",
                x(active) > 60 ? "-translate-x-[calc(100%+12px)]" : "translate-x-3",
              )}
              style={{ left: `${x(active)}%` }}
            >
              <p className="flex items-center justify-between gap-2">
                <span className={cn("font-display text-lg font-black uppercase leading-none", activeEntry.bonus ? "text-gold" : activeEntry.won ? "text-win" : "text-loss")}>
                  {activeEntry.bonus ? "Bonus" : activeEntry.won ? "Victoire" : "Défaite"}
                </span>
                <span className={cn("font-tech text-sm font-bold tabular-nums", activeEntry.delta > 0 ? "text-win" : activeEntry.delta < 0 ? "text-loss" : "text-white/40")}>
                  {signed(activeEntry.delta)}
                </span>
              </p>
              <p className="mt-1.5 truncate text-xs text-white/60">
                {activeEntry.map} · {activeEntry.format} · {shortDate(activeEntry.date)}
              </p>
              <p className="mt-2 font-tech text-xs font-bold tabular-nums text-white">{activeEntry.points} pts</p>
            </div>
          ) : null}
        </motion.div>

        <div className="mt-3 flex justify-between font-tech text-[10px] uppercase tracking-[0.2em] text-white/35">
          <span>{entries.length > 0 ? shortDate(entries[0].date) : ""}</span>
          <span className="hidden sm:inline">Survole la courbe pour le détail</span>
          <span>{entries.length > 0 ? shortDate(entries[entries.length - 1].date) : ""}</span>
        </div>
      </div>

      {/* --- Forme récente --------------------------------------------------- */}
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 px-6 py-5 sm:px-8">
        <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-white/45">Forme · {stats.form.length} derniers</p>
        <ol className="flex gap-1.5">
          {stats.form.map((won, index) => (
            <motion.li
              key={`${range}-${index}`}
              initial={reduce ? false : { opacity: 0, scale: 0.4, y: 6 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.3 + index * 0.07 }}
              aria-label={won ? "Victoire" : "Défaite"}
              className={cn(
                "clip-slant flex h-7 w-8 items-center justify-center font-display text-sm font-black text-ink",
                won ? "bg-win/90" : "bg-loss/85",
                index === stats.form.length - 1 && "outline-2 outline-offset-2 outline-white/70",
              )}
            >
              <span aria-hidden>{won ? "V" : "D"}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </TacticalCard>
  );
}

/** Un chiffre clé, style bandeau de diffusion. */
function Kpi({ label, value, hint, hintColor, tone = null, accent = false, icon: Icon = null }) {
  return (
    <div className="px-6 py-5 sm:px-8">
      <dt className="font-tech text-[10px] uppercase tracking-[0.28em] text-white/45">{label}</dt>
      <dd
        className={cn(
          "mt-2 flex items-center gap-2 font-display text-4xl font-black leading-none tabular-nums",
          accent && "text-gold-gradient",
          tone === "win" && "text-win",
          tone === "loss" && "text-loss",
        )}
      >
        {Icon ? <Icon aria-hidden className="h-6 w-6 shrink-0" /> : null}
        {value}
      </dd>
      {hint ? (
        <dd className="mt-1.5 text-xs uppercase tracking-wide text-white/45" style={hintColor ? { color: hintColor } : undefined}>
          {hint}
        </dd>
      ) : null}
    </div>
  );
}
