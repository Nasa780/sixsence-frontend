import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuCalendarClock, LuChevronRight, LuCrosshair, LuGamepad2, LuShield, LuSwords, LuTrophy, LuUsers } from "react-icons/lu";
import { GoldParticles } from "../components/effects/GoldParticles";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : panneau « En direct » dans le premier écran de l'accueil (?etat=calme pour le site sans activité).
const ACTIVE = [
  { key: "classe", icon: LuCrosshair, color: "#34d399", label: "Classé", value: "2 matchs en cours", sub: "5 joueurs en file · 4v4", live: true },
  { key: "division", icon: LuShield, color: "#22d3ee", label: "Division", value: "[VTX] Vortex vs [KZN] Kaizen", sub: "Map 2 · Lotus · BO3", live: true },
  { key: "tournoi", icon: LuTrophy, color: "#e5484d", label: "Coupe Horus #4", value: "Check-in ouvert", sub: "Tirage dans 42 min · 6 équipes", live: true },
  { key: "gta", icon: LuGamepad2, color: "#ff8a3d", label: "GTA 6", value: "Course de rue · ce soir 21:00", sub: "18 inscrits", live: false },
];
const CALM = [
  { key: "tournoi", icon: LuTrophy, color: "#e5484d", label: "Prochaine coupe", value: "Coupe Horus · dim. 1 nov.", sub: "Inscriptions ouvertes · 3 équipes", live: false },
  { key: "gta", icon: LuGamepad2, color: "#ff8a3d", label: "GTA 6", value: "Course de rue · sam. 21:00", sub: "18 inscrits", live: false },
  { key: "classe", icon: LuCrosshair, color: "#34d399", label: "Classé", value: "File ouverte", sub: "2v2 à 5v5 · lance la première recherche", live: false },
];
const FEED = [
  [LuSwords, "#34d399", "Sorrow gagne en 4v4 · +52 pts", "il y a 2 min"],
  [LuShield, "#22d3ee", "[ORB] Orbit bat [NXR] Nexora 2-1", "il y a 9 min"],
  [LuUsers, "#d4af37", "Kenzo rejoint [VTX] Vortex", "il y a 14 min"],
  [LuTrophy, "#e5484d", "[HLS] Helios s'inscrit à la Coupe Horus", "il y a 21 min"],
];

function Ticker({ compact = false }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % FEED.length), 3200);
    return () => clearInterval(timer);
  }, []);
  const [Icon, color, text, when] = FEED[index];
  return (
    <div className={cn("relative h-10 overflow-hidden", compact ? "" : "border-t border-white/10")}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={index}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn("absolute inset-0 flex items-center gap-2.5 text-xs", compact ? "px-3" : "px-5")}
        >
          <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" style={{ color }} />
          <span className="min-w-0 flex-1 truncate text-white/75">{text}</span>
          <span className="shrink-0 text-white/35">{when}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Panel({ rows, calm }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="clip-tactical relative w-full max-w-sm overflow-hidden border border-gold/25 bg-ink/70 backdrop-blur-md [--cut:18px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-linear-to-b from-transparent via-gold/8 to-transparent" />
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-gold">
          <span className={cn("h-1.5 w-1.5", calm ? "bg-gold/60" : "animate-pulse bg-win shadow-[0_0_8px_#34d399]")} />
          {calm ? "À venir" : "En direct"}
        </p>
        {!calm ? <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/40">23 connectés</p> : null}
      </div>
      <ul className="mt-3 space-y-px">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <motion.li
              key={row.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
              className="group relative flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <span aria-hidden className="absolute inset-y-2 left-0 w-0.5" style={{ background: row.color }} />
              <span className="relative grid h-9 w-9 shrink-0 place-items-center border" style={{ borderColor: `${row.color}66`, background: `${row.color}14` }}>
                <Icon aria-hidden className="h-4 w-4" style={{ color: row.color }} />
                {row.live ? <span className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full" style={{ background: row.color }} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-tech text-[9px] uppercase tracking-[0.22em]" style={{ color: row.color }}>
                  {row.label}
                </span>
                <span className="block truncate font-display text-lg font-black uppercase leading-tight">{row.value}</span>
                <span className="block truncate text-[11px] text-white/45">{row.sub}</span>
              </span>
              <LuChevronRight aria-hidden className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
            </motion.li>
          );
        })}
      </ul>
      {calm ? (
        <p className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/45">
          <LuCalendarClock aria-hidden className="h-3.5 w-3.5 text-gold" /> Les matchs reprennent surtout le soir, dès 20 h.
        </p>
      ) : (
        <Ticker />
      )}
    </motion.aside>
  );
}

export default function DevLive() {
  const { query } = useRouter();
  const calm = query.etat === "calme";
  const rows = calm ? CALM : ACTIVE;
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pb-14 pt-28">
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade" />
      <GoldParticles id="particules-maquette" density={90} className="-z-20" />
      <div aria-hidden className="absolute -top-1/4 right-[12%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/14 via-gold/4 to-transparent lg:w-96" />
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 border border-gold/30 bg-gold/8 px-4 py-2">
              <span aria-hidden className="h-1.5 w-1.5 bg-gold" />
              <span className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold sm:text-[11px]">Plateforme gaming</span>
            </div>
            <h1 className="mt-6 font-display text-[clamp(4.25rem,15vw,10.5rem)] font-black uppercase leading-[0.8] tracking-tight">
              Six<span className="text-gold-gradient">Sence</span>
            </h1>
            <p className="mt-6 font-display text-2xl font-bold uppercase tracking-[0.12em] text-white/90 sm:text-3xl">Le sixième sens du jeu compétitif</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Grimpe seul au classement de Call of Duty en partie classée, monte ton équipe en Division et vise le tournoi de fin de saison. Côté GTA 6, rejoins les événements à venir
              de la communauté.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="clip-slant inline-flex items-center justify-center gap-2 bg-gold px-7 py-3.5 font-display text-lg font-black uppercase tracking-[0.14em] text-ink">
                <FaDiscord aria-hidden className="h-5 w-5" /> Se connecter avec Discord
              </span>
              <span className="clip-slant inline-flex items-center justify-center gap-2 border border-gold/40 px-7 py-3.5 font-display text-lg font-black uppercase tracking-[0.14em]">
                Découvrir <LuChevronRight aria-hidden className="h-5 w-5" />
              </span>
            </div>
            {/* Téléphone : une ligne en direct qui défile, sous les boutons. */}
            <div className="mt-8 border border-gold/25 bg-ink/70 lg:hidden">
              <p className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-tech text-[9px] uppercase tracking-[0.26em] text-gold">
                <span className={cn("h-1.5 w-1.5", calm ? "bg-gold/60" : "animate-pulse bg-win")} />
                {calm ? "À venir" : "En direct · 2 matchs, check-in Coupe Horus"}
              </p>
              <Ticker compact />
            </div>
          </div>
          <div className="hidden lg:block">
            <Panel rows={rows} calm={calm} />
          </div>
        </div>
      </Container>
    </section>
  );
}
