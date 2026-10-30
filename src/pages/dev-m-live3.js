import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight, LuClock, LuCrosshair, LuCrown, LuShield, LuSwords } from "react-icons/lu";
import { GoldParticles } from "../components/effects/GoldParticles";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : 4 directions esthétiques pour le panneau « En direct ». ?v=c|d|e|g
const ROWS = [
  { key: "saison", icon: LuClock, color: "#d4af37", label: "Saison 1", value: "Fin dans 12 jours", sub: "Champion, Top 10, Participant" },
  { key: "classe", icon: LuCrown, color: "#34d399", label: "Leader Classé", value: "nqsq · 1 031 pts", sub: "Platine · 28 V / 14 D" },
  { key: "division", icon: LuShield, color: "#22d3ee", label: "Leader Division", value: "[VTX] Vortex · 1 084", sub: "6 équipes actives" },
  { key: "file", icon: LuCrosshair, color: "#34d399", label: "Classé", value: "File ouverte", sub: "2v2 à 5v5" },
];

/** C : carte holographique verticale (comme une carte de visite), reflet qui passe. */
function Holo() {
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ duration: 1 }} className="relative w-[24rem] xl:w-[27rem]">
      <div className="clip-tactical relative overflow-hidden bg-linear-to-br from-gold via-gold/40 to-gold/10 p-px [--cut:28px]">
        <div className="clip-tactical relative overflow-hidden bg-ink-800 [--cut:28px]">
          <div aria-hidden className="absolute inset-0 holo opacity-60" />
          <div aria-hidden className="pointer-events-none absolute -inset-x-20 -top-full h-[300%] w-24 rotate-[25deg] animate-[sheen_5s_linear_infinite] bg-white/10 blur-md" />
          <div className="relative h-44 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/maps/lotus.webp" alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-linear-to-t from-ink-800 to-transparent" />
            <p className="absolute left-5 top-4 font-tech text-[10px] uppercase tracking-[0.3em] text-gold">SixSence · Saison 1</p>
            <p className="absolute bottom-3 left-5 font-display text-4xl font-black uppercase leading-none">
              Fin dans <span className="text-gold-gradient">12 j</span>
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-px bg-white/10">
            {ROWS.slice(1).concat([{ key: "match", icon: LuSwords, color: "#d4af37", label: "Dernier match", value: "6 – 4 · Lotus", sub: "il y a 2 h" }]).map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.key} className="bg-ink-800/95 p-4">
                  <Icon aria-hidden className="h-5 w-5" style={{ color: row.color }} />
                  <p className="mt-2 font-tech text-[9px] uppercase tracking-[0.2em]" style={{ color: row.color }}>
                    {row.label}
                  </p>
                  <p className="font-display text-lg font-black uppercase leading-tight">{row.value}</p>
                  <p className="text-[11px] text-white/45">{row.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** E : cartes flottantes séparées, à des profondeurs différentes, qui flottent doucement. */
function Floating() {
  const pos = ["translate-x-10", "-translate-x-6", "translate-x-16", "translate-x-0"];
  return (
    <div className="relative w-[28rem] space-y-4">
      {ROWS.map((row, i) => {
        const Icon = row.icon;
        return (
          <motion.div
            key={row.key}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0, y: [0, i % 2 ? 6 : -6, 0] }}
            transition={{ opacity: { delay: 0.3 + i * 0.15 }, x: { delay: 0.3 + i * 0.15, duration: 0.7 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" } }}
            className={cn("clip-slant flex items-center gap-4 border-l-4 bg-ink/85 py-3 pl-5 pr-10 shadow-2xl shadow-black/60 backdrop-blur-md", pos[i], i === 0 && "scale-105")}
            style={{ borderColor: row.color, boxShadow: `0 0 40px -12px ${row.color}` }}
          >
            <Icon aria-hidden className="h-6 w-6 shrink-0" style={{ color: row.color }} />
            <span>
              <span className="block font-tech text-[9px] uppercase tracking-[0.22em]" style={{ color: row.color }}>
                {row.label}
              </span>
              <span className="block font-display text-2xl font-black uppercase leading-tight">{row.value}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** G : tableau façon diffusion e-sport (bandeau titre doré, lignes numérotées, horloge). */
function Broadcast() {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-[27rem] xl:w-[30rem]">
      <div className="flex items-stretch">
        <span className="clip-slant flex items-center bg-gold px-5 py-2 font-display text-xl font-black uppercase tracking-[0.12em] text-ink">SixSence</span>
        <span className="-ml-2 flex flex-1 items-center justify-between bg-white/10 px-5 font-tech text-[10px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
          <span>Tableau de bord</span>
          <span className="text-gold">21:47</span>
        </span>
      </div>
      <div className="border-x border-b border-white/10 bg-ink/85 backdrop-blur-md">
        {ROWS.map((row, i) => (
          <motion.div
            key={row.key}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
            className="grid grid-cols-[3rem_1fr_auto] items-center border-b border-white/5"
          >
            <span className="grid h-full place-items-center self-stretch font-display text-2xl font-black text-ink" style={{ background: row.color }}>
              {i + 1}
            </span>
            <span className="min-w-0 px-4 py-3">
              <span className="block font-tech text-[9px] uppercase tracking-[0.22em] text-white/45">{row.label}</span>
              <span className="block truncate font-display text-xl font-black uppercase leading-tight">{row.value}</span>
            </span>
            <span className="px-4 text-right text-xs text-white/45">{row.sub}</span>
          </motion.div>
        ))}
        <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2.5 text-xs">
          <span className="bg-loss/80 px-1.5 py-0.5 font-tech text-[9px] uppercase tracking-[0.2em] text-white">Info</span>
          <span className="truncate text-white/65">Dernier match : Lotus 6 – 4 · il y a 2 h · xNaaNii rejoint SixSence</span>
        </div>
      </div>
    </motion.div>
  );
}

/** D : bande « télé » pleine largeur en bas du premier écran, qui défile. */
function Band() {
  const items = [...ROWS, { key: "match", icon: LuSwords, color: "#d4af37", label: "Dernier match", value: "Lotus 6 – 4", sub: "il y a 2 h" }];
  return (
    <div className="absolute inset-x-0 bottom-0 border-y border-gold/25 bg-ink/85 backdrop-blur-md">
      <div className="flex items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-gold px-6 font-display text-lg font-black uppercase tracking-[0.14em] text-ink">
          <span className="h-2 w-2 bg-ink" /> À venir
        </span>
        <div className="relative flex-1 overflow-hidden">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex w-max">
            {[...items, ...items].map((row, i) => {
              const Icon = row.icon;
              return (
                <span key={i} className="flex items-center gap-3 border-r border-white/10 px-8 py-4">
                  <Icon aria-hidden className="h-5 w-5" style={{ color: row.color }} />
                  <span className="font-tech text-[10px] uppercase tracking-[0.22em]" style={{ color: row.color }}>
                    {row.label}
                  </span>
                  <span className="font-display text-xl font-black uppercase">{row.value}</span>
                  <span className="text-xs text-white/40">{row.sub}</span>
                </span>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function DevLive3() {
  const { query } = useRouter();
  const v = query.v ?? "c";
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pb-14 pt-28">
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade" />
      <GoldParticles id="particules-maquette3" density={90} className="-z-20" />
      <div aria-hidden className="absolute -top-1/4 right-[12%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/14 via-gold/4 to-transparent lg:w-96" />
      <div aria-hidden className="absolute right-[14%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
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
          <div className="hidden justify-self-end lg:block">{v === "c" ? <Holo /> : v === "e" ? <Floating /> : v === "g" ? <Broadcast /> : null}</div>
        </div>
      </Container>
      {v === "d" ? <Band /> : null}
    </section>
  );
}
