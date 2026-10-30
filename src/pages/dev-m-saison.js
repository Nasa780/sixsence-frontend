import { LuClock, LuFlame, LuLock } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : bandeau de saison sur les classements, scores des maps dans l'historique.
const HISTORY = [
  { win: true, opp: "[KZN] Kaizen", maps: [["Lotus", 6, 3], ["Coal", 4, 6], ["Transit 213", 6, 2]], pts: "+27", when: "Hier · 22:14" },
  { win: false, opp: "[VTX] Vortex", maps: [["Mumbai", 2, 6], ["Sentry", 5, 6]], pts: "-24", when: "Hier · 21:30" },
  { win: true, opp: "[ORB] Orbit", maps: [["Rooftops", 6, 1], ["Lithium", 6, 4]], pts: "+22", when: "Lun. · 21:05", tag: "Coupe Horus" },
];

function SeasonBar({ color, matches, label }) {
  return (
    <div className="clip-tactical relative overflow-hidden border bg-white/[0.02] [--cut:16px]" style={{ borderColor: `${color}55` }}>
      <div aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.24em]" style={{ color }}>
            {label} · Saison 1
          </p>
          <p className="mt-1 font-display text-2xl font-black uppercase leading-none">Fin de saison dans</p>
        </div>
        <div className="flex gap-2">
          {[
            ["12", "jours"],
            ["07", "h"],
            ["41", "min"],
          ].map(([v, u]) => (
            <div key={u} className="min-w-14 border border-white/10 bg-ink/60 px-2 py-1.5 text-center">
              <p className="font-tech text-2xl font-black tabular-nums leading-none">{v}</p>
              <p className="mt-1 font-tech text-[9px] uppercase tracking-[0.2em] text-white/40">{u}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Matchs joués cette saison</p>
          <p className="font-display text-3xl font-black leading-none tabular-nums">{matches}</p>
        </div>
        <p className="ml-auto inline-flex items-center gap-2 text-xs text-white/50">
          <LuClock aria-hidden className="h-4 w-4" /> Clôture le jeudi 8 novembre à 23:59
        </p>
      </div>
      {label === "Division" ? (
        <p className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] px-6 py-2 text-xs text-white/55">
          <LuLock aria-hidden className="h-3.5 w-3.5" style={{ color }} /> Transferts verrouillés dans 5 jours (7 derniers jours de la saison).
        </p>
      ) : null}
    </div>
  );
}

export default function DevSaison() {
  return (
    <Container className="space-y-14 pb-20 pt-28">
      <section className="space-y-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 2 · en tête des classements</p>
        <SeasonBar color="#34d399" label="Classé" matches="1 284" />
        <SeasonBar color="#22d3ee" label="Division" matches="312" />
        <p className="text-xs text-white/40">
          Sous le titre de /cod/leaderboard et /cod/equipes. Les 3 derniers jours, le compte à rebours passe en rouge et pulse. Sans date de fin fixée dans l&apos;admin : seulement les
          matchs joués.
        </p>
      </section>

      <section className="space-y-5" data-univers="division">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 3 · historique Division avec le score des maps</p>
        <ul className="space-y-2">
          {HISTORY.map((m) => (
            <li key={m.when} className={cn("grid gap-3 border-l-2 bg-white/[0.03] px-4 py-3 sm:grid-cols-[6rem_1fr_auto] sm:items-center", m.win ? "border-win" : "border-loss")}>
              <div>
                <p className={cn("font-display text-xl font-black uppercase leading-none", m.win ? "text-win" : "text-loss")}>{m.win ? "Victoire" : "Défaite"}</p>
                <p className="mt-1 text-[11px] text-white/40">{m.when}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  contre {m.opp} {m.tag ? <span className="ml-1 bg-[#e5484d]/15 px-1.5 py-0.5 font-tech text-[9px] uppercase text-[#e5484d]">{m.tag}</span> : null}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.maps.map(([map, a, b]) => (
                    <span key={map} className={cn("inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs", a > b ? "border-win/40 bg-win/10" : "border-loss/40 bg-loss/10")}>
                      <span className="text-white/60">{map}</span>
                      <span className="font-tech font-bold tabular-nums">
                        {a}-{b}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <p className={cn("font-display text-2xl font-black tabular-nums", m.win ? "text-win" : "text-loss")}>{m.pts}</p>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 text-xs text-white/40">
          <LuFlame aria-hidden className="h-3.5 w-3.5 text-gold" /> Chaque map en pastille verte ou rouge avec ses manches. Profil (onglet Division), fiche d&apos;équipe et Mon équipe.
        </p>
      </section>
    </Container>
  );
}
