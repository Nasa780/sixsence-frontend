import { Fragment } from "react";
import { LuChevronRight, LuCrown, LuFlag, LuShield, LuTrophy } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : circuit de saison (coupes → points → grande finale).
const STEPS = [
  { icon: LuShield, color: "#d4af37", title: "Coupes Horus", when: "Chaque semaine", text: "Chaque coupe rapporte des points de circuit selon la place. Les points restent acquis toute la saison." },
  { icon: LuFlag, color: "#22d3ee", title: "Play-in", when: "Dernière semaine", text: "Les 7e et 8e du circuit affrontent les 2 premières équipes de la Division. Les vainqueurs vont en finale." },
  { icon: LuCrown, color: "#e5484d", title: "Grande finale", when: "Fin de saison", text: "Le top 6 du circuit et les 2 qualifiés du play-in : double élimination, finale en BO5." },
];
const POINTS = [
  ["1re place", 100],
  ["2e place", 70],
  ["3e place", 50],
  ["Autres présentes", 15],
];
const STANDINGS = [
  ["VTX", "Vortex", 285, 4],
  ["KZN", "Kaizen", 240, 4],
  ["NXR", "Nexora", 205, 3],
  ["RNN", "Ronin", 170, 4],
  ["SPH", "Sphinx", 135, 3],
  ["OSR", "Osiris", 115, 2],
  ["APX", "Apex", 85, 3],
  ["LGN", "Legion", 70, 2],
  ["ECL", "Eclipse", 45, 3],
  ["HRZ", "Horizon", 30, 2],
];

export default function DevCircuit() {
  return (
    <Container className="space-y-10 pb-16 pt-28">
      <div>
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · circuit de saison</p>
        <h1 className="mt-3 font-display text-6xl font-black uppercase leading-[0.9]">
          Circuit <span className="text-gold-gradient">SixSence</span>
        </h1>
        <p className="mt-3 max-w-2xl text-white/60">Toute la saison mène à la grande finale : chaque coupe compte, la Division offre une seconde chance.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["Coupes jouées", "4 / 8"],
            ["Finale dans", "26 j 07 h"],
            ["Équipes classées", "14"],
          ].map(([l, v]) => (
            <div key={l} className="border border-white/10 bg-white/[0.03] px-4 py-2">
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{l}</p>
              <p className="font-display text-2xl font-black">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Les étapes */}
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
        {STEPS.map(({ icon: Icon, color, title, when, text }, i) => (
          <Fragment key={title}>
            <div className="clip-tactical relative overflow-hidden border bg-white/[0.02] p-5 [--cut:16px]" style={{ borderColor: `${color}66` }}>
              <div aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl" style={{ background: `${color}33` }} />
              <p className="font-tech text-[10px] uppercase tracking-[0.24em]" style={{ color }}>
                Étape {i + 1} · {when}
              </p>
              <p className="mt-2 flex items-center gap-2 font-display text-2xl font-black uppercase">
                <Icon aria-hidden className="h-6 w-6" style={{ color }} />
                {title}
              </p>
              <p className="mt-2 text-sm text-white/60">{text}</p>
            </div>
            {i < STEPS.length - 1 ? <LuChevronRight aria-hidden className="hidden h-8 w-8 self-center text-white/25 lg:block" /> : null}
          </Fragment>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* Barème */}
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Points par coupe</p>
          <div className="mt-3 space-y-2">
            {POINTS.map(([l, p], i) => (
              <div key={l} className="flex items-center justify-between bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2">
                  {i < 3 ? <LuTrophy aria-hidden className="h-4 w-4" style={{ color: ["#d4af37", "#c0c7d0", "#c97b4b"][i] }} /> : null}
                  {l}
                </span>
                <span className="font-display text-xl font-black text-gold">+{p}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/45">Coupes de fin de saison comptées ×1,5. Les bonus de Division des coupes restent inchangés.</p>
        </div>

        {/* Classement du circuit */}
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Classement du circuit · top 6 qualifiées</p>
          <div className="mt-3 border border-white/10">
            {STANDINGS.map(([tag, name, pts, cups], i) => (
              <div key={tag}>
                {i === 6 ? <Zone color="#22d3ee" label="Play-in" /> : null}
                {i === 8 ? <Zone color="#ffffff55" label="Éliminées" /> : null}
                <div className={cn("flex items-center gap-3 px-4 py-2.5", i < 6 ? "bg-gold/[0.04]" : i < 8 ? "bg-cyan-400/[0.04]" : "opacity-60")}>
                  <span className={cn("w-6 font-display text-lg font-black", i < 3 ? "text-gold" : "text-white/50")}>{i + 1}</span>
                  <span className="grid h-8 w-8 place-items-center border border-white/20 font-display text-[10px] font-black">{tag}</span>
                  <span className="flex-1 font-semibold">{name}</span>
                  <span className="text-xs text-white/45">{cups} coupes</span>
                  <span className="w-20 text-right font-display text-xl font-black">{pts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

function Zone({ color, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1" style={{ background: `${color}22` }}>
      <span aria-hidden className="h-px flex-1" style={{ background: color }} />
      <span className="font-tech text-[9px] uppercase tracking-[0.24em]" style={{ color }}>
        {label}
      </span>
      <span aria-hidden className="h-px flex-1" style={{ background: color }} />
    </div>
  );
}
