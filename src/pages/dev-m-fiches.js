import { LuArrowRight, LuCheck, LuCrown, LuLogIn, LuLogOut, LuShield, LuSwords, LuTrophy, LuUserPlus, LuUsers, LuX } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { TacticalCard } from "../components/ui/TacticalCard";
import { cn } from "../lib/cn";

// Maquette (non commitée) : parcours du joueur, compteur de trophées, premiers pas en Division.
const CAREER = [
  { team: "[VTX] Vortex", color: "#22d3ee", role: "Leader", from: "12 oct.", to: null, matches: 38, trophies: 2 },
  { team: "[NXR] Nexora", color: "#a78bfa", role: "Joueur", from: "21 sept.", to: "10 oct.", matches: 14, trophies: 0, left: "Parti" },
  { team: "[ORB] Orbit", color: "#f59e0b", role: "Joueur", from: "2 sept.", to: "19 sept.", matches: 6, trophies: 0, left: "Équipe dissoute" },
];
const COUNTS = [
  ["/images/trophees/horus-or.png", "Or", 3],
  ["/images/trophees/horus-argent.png", "Argent", 1],
  ["/images/trophees/horus-bronze.png", "Bronze", 2],
];
const DIV_STEPS = [
  { icon: LuUsers, title: "Une équipe", text: "Crée la tienne ou rejoins-en une (invitation ou candidature).", done: true },
  { icon: LuUserPlus, title: "4 joueurs", text: "Il en faut 4 pour un match : partage le lien d'invitation. 3/4 aujourd'hui.", done: false, action: "Inviter" },
  { icon: LuSwords, title: "Premier match", text: "Un Leader lance la recherche ou programme un match ce soir.", done: false, action: "Jouer" },
  { icon: LuTrophy, title: "Première coupe", text: "Inscris l'équipe à la prochaine Coupe Horus : points de circuit à la clé.", done: false, action: "S'inscrire" },
];

const ACTION = "clip-slant inline-flex items-center gap-1.5 bg-gold px-4 py-2 font-display text-sm font-black uppercase tracking-[0.14em] text-ink";

export default function DevFiches() {
  const doneCount = DIV_STEPS.filter((s) => s.done).length;
  const nextIndex = DIV_STEPS.findIndex((s) => !s.done);
  return (
    <Container className="space-y-14 pb-20 pt-28">
      {/* ---------- 4a. Parcours du joueur ---------- */}
      <section className="space-y-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 4 · profil · parcours en Division</p>
        <h2 className="font-display text-3xl font-black uppercase leading-none">Parcours</h2>
        <ol className="relative space-y-3 border-l border-white/15 pl-6">
          {CAREER.map((c) => (
            <li key={c.team} className="relative">
              <span aria-hidden className="absolute -left-[31px] top-4 h-3 w-3 rotate-45 border-2" style={{ borderColor: c.color, background: c.to ? "transparent" : c.color }} />
              <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 bg-white/[0.03] px-4 py-3", c.to && "opacity-70")}>
                <span className="grid h-10 w-10 place-items-center font-display text-sm font-black text-ink" style={{ background: c.color }}>
                  {c.team.slice(1, 4)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-black uppercase leading-none">{c.team}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                    {c.role === "Leader" ? <LuCrown aria-hidden className="h-3.5 w-3.5 text-gold" /> : null}
                    {c.role} · <LuLogIn aria-hidden className="h-3.5 w-3.5" /> {c.from}
                    {c.to ? (
                      <>
                        {" "}
                        · <LuLogOut aria-hidden className="h-3.5 w-3.5" /> {c.to} ({c.left})
                      </>
                    ) : (
                      <span className="ml-1 bg-win/15 px-1.5 py-0.5 font-tech text-[9px] uppercase text-win">Actuelle</span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-white/60">
                  <span className="font-display text-xl font-black text-white">{c.matches}</span> matchs
                </p>
                {c.trophies ? (
                  <p className="inline-flex items-center gap-1 text-sm text-gold">
                    <LuTrophy aria-hidden className="h-4 w-4" />×{c.trophies}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-white/40">Remplace la liste « équipes jouées » de l&apos;Analyse. Matchs et trophées comptés pendant le passage du joueur dans l&apos;équipe.</p>
      </section>

      {/* ---------- 4b. Trophées par type ---------- */}
      <section className="space-y-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 4 · fiche d&apos;équipe · compteur de trophées (au-dessus de la vitrine)</p>
        <div className="flex flex-wrap gap-3">
          {COUNTS.map(([src, label, n]) => (
            <div key={label} className="clip-tactical flex items-center gap-3 border border-white/10 bg-white/[0.03] py-2 pl-2 pr-5 [--cut:10px]">
              <img src={src} alt="" className="h-12 w-12 object-contain" />
              <div>
                <p className="font-display text-3xl font-black leading-none">×{n}</p>
                <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Horus {label}</p>
              </div>
            </div>
          ))}
          <div className="clip-tactical flex items-center gap-3 border border-gold/40 bg-gold/10 px-5 py-2 [--cut:10px]">
            <LuShield aria-hidden className="h-7 w-7 text-gold" />
            <div>
              <p className="font-display text-3xl font-black leading-none text-gold">6</p>
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Podiums</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 7. Premiers pas en Division ---------- */}
      <section className="space-y-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 7 · premiers pas en Division (suite du parcours existant)</p>
        <div data-univers="division">
          <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
            <div aria-hidden className="absolute -right-16 top-0 h-full w-64 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />
            <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pt-6 sm:px-8">
              <div>
                <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Premiers pas · Division</p>
                <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">Prêt pour la Division</h2>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display text-4xl font-black leading-none tabular-nums">
                  <span className="text-gold-gradient">{doneCount}</span>
                  <span className="text-white/30">/{DIV_STEPS.length}</span>
                </p>
                <LuX aria-hidden className="h-5 w-5 text-white/35" />
              </div>
            </div>
            <div aria-hidden className="relative mt-5 flex gap-1.5 px-6 sm:px-8">
              {DIV_STEPS.map((s, i) => (
                <span key={i} className={cn("h-1.5 flex-1 -skew-x-[18deg]", s.done ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-white/10")} />
              ))}
            </div>
            <ol className="relative mt-6 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {DIV_STEPS.map((step, index) => {
                const Icon = step.icon;
                const next = index === nextIndex;
                return (
                  <li key={step.title} className={cn("flex flex-col gap-3 border-white/10 p-6 sm:p-7", index > 0 && "border-t lg:border-l lg:border-t-0", next && "bg-gold/[0.06]")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("font-display text-3xl font-black leading-none", step.done ? "text-gold" : next ? "text-white" : "text-white/30")}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.done ? (
                        <span className="clip-slant inline-flex items-center gap-1 bg-gold px-2.5 py-1 font-display text-xs font-black uppercase tracking-[0.14em] text-ink">
                          <LuCheck aria-hidden className="h-3.5 w-3.5" /> Fait
                        </span>
                      ) : (
                        <Icon aria-hidden className={cn("h-5 w-5", next ? "text-gold" : "text-white/30")} />
                      )}
                    </div>
                    <div>
                      <p className={cn("font-display text-xl font-black uppercase leading-none", step.done && "text-white/50")}>{step.title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-white/50">{step.text}</p>
                    </div>
                    {!step.done ? (
                      <span className={cn(ACTION, "mt-auto self-start")}>
                        {step.action} <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </TacticalCard>
        </div>
        <p className="text-xs text-white/40">
          Même carte que les « Premiers pas » actuels, en cyan. Elle n&apos;apparaît qu&apos;une fois les premiers pas du compte terminés (jamais les deux en même temps), sur le hub MW4 et
          /cod/division, se masque avec la croix et disparaît quand tout est fait.
        </p>
      </section>
    </Container>
  );
}
