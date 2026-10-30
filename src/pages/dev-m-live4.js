import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight, LuClock, LuCrosshair, LuCrown, LuShield, LuSwords } from "react-icons/lu";
import { GoldParticles } from "../components/effects/GoldParticles";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : 4 directions de plus. ?v=h (radar) | i (terminal) | j (constellation) | k (paquet de cartes)
const ROWS = [
  { key: "saison", icon: LuClock, color: "#d4af37", label: "Saison 1", value: "Fin dans 12 jours", sub: "Champion, Top 10, Participant" },
  { key: "classe", icon: LuCrown, color: "#34d399", label: "Leader Classé", value: "nqsq · 1 031 pts", sub: "Platine · 28 V / 14 D" },
  { key: "division", icon: LuShield, color: "#22d3ee", label: "Leader Division", value: "[VTX] Vortex", sub: "1 084 pts · 6 équipes" },
  { key: "file", icon: LuCrosshair, color: "#34d399", label: "Classé", value: "File ouverte", sub: "2v2 à 5v5" },
  { key: "match", icon: LuSwords, color: "#d4af37", label: "Dernier match", value: "Lotus 6 – 4", sub: "il y a 2 h" },
];

/** H : radar circulaire, un balayage passe et révèle les infos comme des cibles. */
function Radar() {
  const blips = [
    [0.7, -75],
    [0.85, 15],
    [0.5, 95],
    [0.8, 170],
    [0.6, 230],
  ];
  return (
    <div className="relative h-[32rem] w-[32rem]">
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full">
        {[30, 55, 80, 98].map((r) => (
          <circle key={r} r={r} fill="none" stroke="rgba(212,175,55,0.22)" strokeWidth="0.4" />
        ))}
        <line x1="-98" y1="0" x2="98" y2="0" stroke="rgba(212,175,55,0.15)" strokeWidth="0.3" />
        <line x1="0" y1="-98" x2="0" y2="98" stroke="rgba(212,175,55,0.15)" strokeWidth="0.3" />
        <defs>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(212,175,55,0)" />
            <stop offset="1" stopColor="rgba(212,175,55,0.45)" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "0 0", animation: "radar-sweep 6s linear infinite" }}>
          <path d="M0 0 L98 0 A98 98 0 0 0 69 -69 Z" fill="url(#sweep)" />
        </g>
        <circle r="2.5" fill="#d4af37" />
      </svg>
      <style>{`@keyframes radar-sweep { to { transform: rotate(-360deg); } }`}</style>
      {ROWS.map((row, i) => {
        const [d, a] = blips[i];
        const x = 50 + Math.cos((a * Math.PI) / 180) * d * 49;
        const y = 50 + Math.sin((a * Math.PI) / 180) * d * 49;
        return (
          <motion.div key={row.key} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.25 }} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="absolute -left-1.5 -top-1.5 h-3 w-3 animate-ping rounded-full" style={{ background: row.color }} />
            <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full" style={{ background: row.color }} />
            <span className="absolute left-3 top-[-0.9rem] whitespace-nowrap border-l-2 bg-ink/80 px-2 py-1 backdrop-blur-sm" style={{ borderColor: row.color }}>
              <span className="block font-tech text-[8px] uppercase tracking-[0.2em]" style={{ color: row.color }}>
                {row.label}
              </span>
              <span className="block font-display text-sm font-black uppercase leading-tight">{row.value}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** I : terminal, les lignes s'écrivent une à une avec un curseur. */
function Terminal() {
  const lines = ROWS.map((row) => ({ color: row.color, text: `${row.label.toUpperCase()} :: ${row.value}`, sub: row.sub }));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setShown((n) => Math.min(lines.length, n + 1)), 500);
    return () => clearInterval(timer);
  }, [lines.length]);
  return (
    <div className="w-[30rem] overflow-hidden border border-gold/30 bg-black/85 font-mono shadow-[0_0_60px_-20px_#d4af37] backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-gold/20 bg-gold/10 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-loss/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-win/80" />
        <span className="ml-2 text-[11px] text-gold/80">sixsence@arene:~$ statut --live</span>
      </div>
      <div className="space-y-2 p-5 text-sm">
        {lines.slice(0, shown).map((line, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-white/35">[{String(i + 1).padStart(2, "0")}]</span> <span style={{ color: line.color }}>{line.text}</span>
            <span className="block pl-9 text-xs text-white/40">› {line.sub}</span>
          </motion.p>
        ))}
        <p className="text-gold">
          &gt; <span className="inline-block h-4 w-2 animate-pulse bg-gold align-middle" />
        </p>
      </div>
    </div>
  );
}

/** J : constellation autour de l'œil d'Horus, les infos sont des étoiles reliées par des traits. */
function Constellation() {
  const nodes = [
    [50, 10],
    [92, 38],
    [80, 88],
    [20, 88],
    [8, 38],
  ];
  return (
    <div className="relative h-[32rem] w-[34rem]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {nodes.map(([x, y], i) => (
          <motion.line key={i} x1="50" y1="50" x2={x} y2={y} stroke="rgba(212,175,55,0.35)" strokeWidth="0.25" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }} />
        ))}
        <motion.polygon points={nodes.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="0.2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-ink/70 shadow-[0_0_80px_-10px_#d4af37]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" className="h-16 w-16 animate-[float_7s_ease-in-out_infinite] object-contain" />
      </div>
      {ROWS.map((row, i) => {
        const [x, y] = nodes[i];
        const Icon = row.icon;
        return (
          <motion.div key={row.key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.15 }} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border bg-ink/90" style={{ borderColor: row.color, boxShadow: `0 0 24px -4px ${row.color}` }}>
              <Icon aria-hidden className="h-4 w-4" style={{ color: row.color }} />
            </span>
            <span className="mt-1.5 block whitespace-nowrap font-tech text-[8px] uppercase tracking-[0.2em]" style={{ color: row.color }}>
              {row.label}
            </span>
            <span className="block whitespace-nowrap font-display text-base font-black uppercase leading-tight">{row.value}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** K : paquet de cartes, une carte devant, les autres derrière ; elles défilent toutes seules. */
function Deck() {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTop((t) => (t + 1) % ROWS.length), 4000);
    return () => clearInterval(timer);
  }, []);
  const order = ROWS.map((_, i) => ROWS[(top + i) % ROWS.length]);
  return (
    <div className="relative h-[24rem] w-[26rem]">
      <AnimatePresence initial={false}>
        {order
          .slice(0, 4)
          .reverse()
          .map((row, revIndex, arr) => {
            const depth = arr.length - 1 - revIndex;
            const Icon = row.icon;
            return (
              <motion.div
                key={row.key}
                layout
                initial={{ opacity: 0, y: -40, rotate: -8 }}
                animate={{ opacity: 1, y: depth * 22, x: depth * 18, rotate: depth * 3 - 3, scale: 1 - depth * 0.05 }}
                exit={{ opacity: 0, x: -160, rotate: -16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="clip-tactical absolute inset-x-0 top-0 h-72 overflow-hidden border bg-ink-800 p-7 [--cut:24px]"
                style={{ borderColor: `${row.color}88`, zIndex: 10 - depth, boxShadow: `0 20px 60px -20px ${row.color}` }}
              >
                <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: `${row.color}33` }} />
                {depth > 0 ? <div aria-hidden className="absolute inset-0 z-10 bg-ink/70" /> : null}
                <Icon aria-hidden className="h-10 w-10" style={{ color: row.color }} />
                <p className="mt-8 font-tech text-[11px] uppercase tracking-[0.26em]" style={{ color: row.color }}>
                  {row.label}
                </p>
                <p className="mt-2 font-display text-5xl font-black uppercase leading-[0.9]">{row.value}</p>
                <p className="mt-3 text-sm text-white/50">{row.sub}</p>
              </motion.div>
            );
          })}
      </AnimatePresence>
      <div className="absolute -bottom-2 left-0 flex gap-1.5">
        {ROWS.map((row, i) => (
          <span key={row.key} className={cn("h-1 w-6 transition-colors", i === top ? "bg-gold" : "bg-white/15")} />
        ))}
      </div>
    </div>
  );
}

export default function DevLive4() {
  const { query } = useRouter();
  const v = query.v ?? "h";
  const Visual = { h: Radar, i: Terminal, j: Constellation, k: Deck }[v] ?? Radar;
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pb-14 pt-28">
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade" />
      <GoldParticles id="particules-maquette4" density={90} className="-z-20" />
      <div aria-hidden className="absolute -top-1/4 right-[12%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/14 via-gold/4 to-transparent lg:w-96" />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 border border-gold/30 bg-gold/8 px-4 py-2">
              <span aria-hidden className="h-1.5 w-1.5 bg-gold" />
              <span className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Plateforme gaming</span>
            </div>
            <h1 className="mt-6 font-display text-[clamp(4.25rem,12vw,13rem)] font-black uppercase leading-[0.8] tracking-tight">
              Six<span className="text-gold-gradient">Sence</span>
            </h1>
            <p className="mt-6 font-display text-3xl font-bold uppercase tracking-[0.12em] text-white/90">Le sixième sens du jeu compétitif</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/60">
              Grimpe seul au classement de Call of Duty en partie classée, monte ton équipe en Division et vise le tournoi de fin de saison.
            </p>
            <div className="mt-9 flex items-center gap-4">
              <span className="clip-slant inline-flex items-center gap-2 bg-gold px-7 py-3.5 font-display text-lg font-black uppercase tracking-[0.14em] text-ink">
                <FaDiscord aria-hidden className="h-5 w-5" /> Entrer dans l&apos;arène <LuArrowRight aria-hidden className="h-5 w-5" />
              </span>
              <span className="clip-slant inline-flex items-center gap-2 border border-gold/40 px-7 py-3.5 font-display text-lg font-black uppercase tracking-[0.14em]">
                Découvrir <LuChevronRight aria-hidden className="h-5 w-5" />
              </span>
            </div>
          </div>
          <div className="hidden justify-self-end lg:block">
            <Visual />
          </div>
        </div>
      </Container>
    </section>
  );
}
