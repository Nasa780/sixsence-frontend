import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight, LuClock, LuCrosshair, LuCrown, LuShield, LuSwords } from "react-icons/lu";
import { GoldParticles } from "../components/effects/GoldParticles";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : panneau « En direct » v2 au calme. ?variante=b : panneau incliné posé sur le faisceau doré.
const ROWS = [
  { key: "saison", icon: LuClock, color: "#d4af37", label: "Saison 1", value: "Fin dans 12 jours", sub: "Récompenses : Champion, Top 10, Participant" },
  { key: "classe", icon: LuCrown, color: "#34d399", label: "Leader du Classé", value: "nqsq · 1 031 pts", sub: "Platine · 28 V / 14 D" },
  { key: "division", icon: LuShield, color: "#22d3ee", label: "Leader de la Division", value: "[VTX] Vortex · 1 084 pts", sub: "6 équipes actives" },
  { key: "file", icon: LuCrosshair, color: "#34d399", label: "Classé", value: "File ouverte", sub: "2v2 à 5v5 · lance la première recherche" },
];

function Panel({ tilted }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative w-[26rem] xl:w-[30rem]", tilted && "drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]")}
    >
      <div style={tilted ? { transform: "perspective(1400px) rotateY(-16deg) rotateX(5deg)", transformOrigin: "right center" } : undefined} className="relative">
      {/* Coins de viseur */}
      {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
        <span key={c} aria-hidden className={cn("absolute z-10 h-5 w-5 border-gold", c)} />
      ))}
      <div className="relative m-1.5 overflow-hidden border border-gold/20 bg-ink/80 backdrop-blur-md">
        {/* En-tête : dernier match, map en fond */}
        <div className="relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/maps/lotus.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/10" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan bg-linear-to-b from-transparent via-gold/15 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-gold">
                <span className="h-1.5 w-1.5 bg-gold/70" /> SixSence · à venir
              </p>
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/50">Dernier match · il y a 2 h</p>
            </div>
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-[#34d399]">Classé 4v4 · Lotus</p>
              <p className="mt-1 flex items-center gap-3 font-display text-3xl font-black uppercase leading-none">
                Équipe A <span className="text-gold">6 – 4</span> <span className="text-white/60">Équipe B</span>
              </p>
            </div>
          </div>
        </div>
        <ul className="divide-y divide-white/5">
          {ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <motion.li key={row.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}>
                <span className="group relative flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.04]">
                  <span aria-hidden className="absolute inset-y-3 left-0 w-0.5" style={{ background: row.color }} />
                  <span className="grid h-10 w-10 shrink-0 place-items-center border" style={{ borderColor: `${row.color}66`, background: `${row.color}14` }}>
                    <Icon aria-hidden className="h-5 w-5" style={{ color: row.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-tech text-[10px] uppercase tracking-[0.22em]" style={{ color: row.color }}>
                      {row.label}
                    </span>
                    <span className="block truncate font-display text-xl font-black uppercase leading-tight">{row.value}</span>
                    <span className="block truncate text-xs text-white/45">{row.sub}</span>
                  </span>
                  <LuChevronRight aria-hidden className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-gold" />
                </span>
              </motion.li>
            );
          })}
        </ul>
        <p className="flex items-center gap-2.5 border-t border-white/10 bg-white/[0.02] px-5 py-3 text-xs">
          <LuSwords aria-hidden className="h-3.5 w-3.5 text-white/40" />
          <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-white/40">Dernière activité</span>
          <span className="min-w-0 flex-1 truncate text-white/65">xNaaNii rejoint SixSence</span>
          <span className="text-white/35">hier</span>
        </p>
      </div>
      </div>
    </motion.aside>
  );
}

export default function DevLive2() {
  const { query } = useRouter();
  const tilted = query.variante === "b";
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pb-14 pt-28">
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade" />
      <GoldParticles id="particules-maquette2" density={90} className="-z-20" />
      <div aria-hidden className="absolute -top-1/4 right-[12%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/14 via-gold/4 to-transparent lg:w-96" />
      <div aria-hidden className="absolute -top-1/4 right-[8%] -z-10 h-[150%] w-px -skew-x-[24deg] bg-linear-to-b from-gold/70 via-gold/20 to-transparent" />
      {/* Halo doré derrière le panneau */}
      <div aria-hidden className="absolute right-[14%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <Container>
        <div className={cn("grid items-center gap-12", tilted ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-[1fr_auto] xl:gap-20")}>
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
              Grimpe seul au classement de Call of Duty en partie classée, monte ton équipe en Division et vise le tournoi de fin de saison. Côté GTA 6, rejoins les événements à venir
              de la communauté.
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
            <Panel tilted={tilted} />
          </div>
        </div>
      </Container>
    </section>
  );
}
