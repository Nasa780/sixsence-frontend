import { useState } from "react";
import { LuCalendarClock, LuCheck, LuCrown, LuDices, LuFlag, LuListOrdered, LuShield, LuSwords, LuTrophy, LuUsers } from "react-icons/lu";
import { SlantTab } from "../components/teams/TeamParts";
import { Container } from "../components/ui/Container";
import { StatTile } from "../components/ui/Feedback";
import { TacticalCard } from "../components/ui/TacticalCard";
import { cn } from "../lib/cn";

// Maquette (non commitée) : fiche de coupe en onglets, récompenses par place, « comment ça marche », play-in.
const TABS = ["Infos", "Tableau", "Équipes", "Récompenses", "Règles"];
const REWARDS = [
  { place: "1re place", color: "#d4af37", trophy: "Coupe Horus or", division: 150, circuit: 100 },
  { place: "2e place", color: "#c0c7d0", trophy: "Coupe Horus argent", division: 100, circuit: 70 },
  { place: "3e place", color: "#c97b4b", trophy: "Coupe Horus bronze", division: 75, circuit: 50 },
  { place: "Autres présentes", color: null, trophy: null, division: 50, circuit: 15 },
];
const STEPS = [
  [LuUsers, "Inscription", "Un Leader inscrit l'équipe, jusqu'à la fermeture du check-in."],
  [LuCheck, "Check-in", "De 2 h à 15 min avant : un joueur de l'équipe confirme sa présence."],
  [LuDices, "Tirage", "15 min avant : tableau tiré au sort, dévoilé à tous."],
  [LuSwords, "Matchs", "BO1 puis finale BO3, petite finale pour le bronze. Hôte tiré au sort."],
  [LuTrophy, "Podium", "Trophées, points de Division et de circuit, rôle Discord du vainqueur."],
];

export default function DevTournoi() {
  const [tab, setTab] = useState("Récompenses");
  return (
    <div data-univers="tournoi">
      <Container className="space-y-14 pb-20 pt-28">
        {/* ---------- 1. Fiche de coupe en onglets ---------- */}
        <section className="space-y-6">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 1 · fiche de coupe</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-white/45">Coupe Horus · samedi 7 novembre · 21:00</p>
              <h2 className="mt-1 font-display text-5xl font-black uppercase leading-none">
                Coupe Horus <span className="text-gold-gradient">#4</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                [LuListOrdered, "Min. 4 équipes"],
                [LuDices, "Tirage aléatoire"],
                [LuFlag, "Compte au circuit"],
              ].map(([Icon, label]) => (
                <span key={label} className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-1.5 font-tech uppercase tracking-[0.14em] text-gold">
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Check-in dans" value="1 j 4 h 12" accent />
            <StatTile label="Inscrites" value="6 / 8" />
            <StatTile label="Check-in" value="0 / 6" />
            <StatTile label="Format" value="BO1" hint="Finale en BO3 · petite finale" />
          </div>
          <div role="tablist" className="flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
            {TABS.map((t) => (
              <SlantTab key={t} active={tab === t} onClick={() => setTab(t)}>
                {t}
              </SlantTab>
            ))}
          </div>

          {/* Onglet Récompenses */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Ce que rapporte chaque place</p>
              <div className="mt-3 overflow-hidden border border-white/10">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-white/[0.04] px-4 py-2 font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
                  <span>Place</span>
                  <span className="text-right">Division</span>
                  <span className="text-right">Circuit</span>
                </div>
                {REWARDS.map((r) => (
                  <div key={r.place} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-t border-white/5 px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      {r.color ? <LuTrophy aria-hidden className="h-5 w-5" style={{ color: r.color }} /> : <LuShield aria-hidden className="h-5 w-5 text-white/30" />}
                      <span>
                        <span className="block font-semibold">{r.place}</span>
                        {r.trophy ? <span className="block text-[11px] text-white/45">{r.trophy} dans la vitrine</span> : <span className="block text-[11px] text-white/45">check-in fait</span>}
                      </span>
                    </span>
                    <span className="text-right font-display text-xl font-black text-[#22d3ee]">+{r.division}</span>
                    <span className="text-right font-display text-xl font-black text-gold">+{r.circuit}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/45">
                Et pour chaque joueur : <span className="text-white/70">+500 XP par match gagné, +150 XP par match perdu</span>. Le vainqueur reçoit le rôle Discord « Vainqueur — Coupe Horus ».
              </p>
            </div>
            <TacticalCard cut={18} innerClassName="p-5">
              <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Comment ça marche</p>
              <ol className="mt-4 space-y-4">
                {STEPS.map(([Icon, title, text], i) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center border border-gold/40 bg-gold/10 text-gold">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-black uppercase leading-none">
                        <span className="text-white/35">{i + 1}.</span> {title}
                      </p>
                      <p className="mt-1 text-xs text-white/55">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </TacticalCard>
          </div>
          <p className="text-xs text-white/40">
            Les autres onglets reprennent ce qui existe déjà, rangé : <b>Infos</b> (compte à rebours, inscription, check-in), <b>Tableau</b>, <b>Équipes</b> (inscrites et présentes),{" "}
            <b>Règles</b> (règles de match + format de la coupe). Même découpage pour Anubis et la fin de saison.
          </p>
        </section>

        {/* ---------- 5. Play-in ---------- */}
        <section className="space-y-6">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 5 · play-in de la grande finale (page Circuit)</p>
          <h2 className="font-display text-4xl font-black uppercase leading-none">
            Play-<span className="text-gold-gradient">in</span>
          </h2>
          <p className="max-w-2xl text-sm text-white/60">
            Le top 6 du circuit est qualifié d&apos;office. Les 7e et 8e du circuit affrontent les 2 meilleures équipes de la Division pas encore qualifiées, en BO3, la veille de la
            grande finale. Les 2 gagnants prennent les dernières places.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              [["7e circuit", "[NXR] Nexora", "#d4af37"], ["2e Division", "[ORB] Orbit", "#22d3ee"], "Vendredi 21:00"],
              [["8e circuit", "[KZN] Kaizen", "#d4af37"], ["1re Division", "[VTX] Vortex", "#22d3ee"], "Vendredi 21:00"],
            ].map(([a, b, when], i) => (
              <TacticalCard key={i} cut={18} innerClassName="p-5">
                <div className="flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
                  <span>Play-in {i + 1} · BO3</span>
                  <span className="inline-flex items-center gap-1">
                    <LuCalendarClock aria-hidden className="h-3.5 w-3.5" /> {when}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  {[a, null, b].map((side, j) =>
                    side ? (
                      <div key={j} className={cn(j === 2 && "text-right")}>
                        <p className="font-tech text-[10px] uppercase tracking-[0.2em]" style={{ color: side[2] }}>
                          {side[0]}
                        </p>
                        <p className="mt-1 font-display text-2xl font-black uppercase leading-none">{side[1]}</p>
                      </div>
                    ) : (
                      <span key={j} className="font-display text-xl font-black text-white/30">
                        VS
                      </span>
                    ),
                  )}
                </div>
                <p className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-white/50">
                  <LuCrown aria-hidden className="h-3.5 w-3.5 text-gold" /> Le gagnant entre dans la grande finale (tête de série 7 ou 8).
                </p>
              </TacticalCard>
            ))}
          </div>
          <p className="text-xs text-white/40">
            Le play-in n&apos;a lieu que s&apos;il y a assez d&apos;équipes : sinon, places directes comme aujourd&apos;hui. Les 3 étapes de la page Circuit deviennent : Coupes Horus → Play-in →
            Grande finale.
          </p>
        </section>
      </Container>
    </div>
  );
}
