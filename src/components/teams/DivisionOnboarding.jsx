import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuCheck, LuSwords, LuTrophy, LuUserPlus, LuUsers, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { TacticalCard } from "../ui/TacticalCard";

const HIDDEN_KEY = "sixsence:premiers-pas-division-masques";

/**
 * « Premiers pas · Division » (page MW4, sous les premiers pas du compte et indépendants d'eux : aucun match classé
 * exigé). Une équipe, assez de joueurs pour un match, premier match de Division, première coupe (check-in fait).
 * Disparaît quand tout est fait, ou si le joueur la masque.
 */
export function DivisionOnboarding({ user }) {
  const [state, setState] = useState(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    try {
      setHidden(window.localStorage.getItem(HIDDEN_KEY) === user.id);
    } catch {
      setHidden(false);
    }
    Promise.all([api("/teams/me"), api("/teams/me/play").catch(() => null)])
      .then(async ([me, play]) => {
        const team = me.team;
        let cups = 0;
        if (team?.id) {
          const { count } = await supabase.from("tournament_teams").select("tournament_id", { count: "exact", head: true }).eq("team_id", team.id).not("checked_in_at", "is", null);
          cups = count ?? 0;
        }
        if (alive) setState({ team, rosterSize: play?.rosterSize ?? 4, cups });
      })
      .catch(() => alive && setState(null));
    return () => {
      alive = false;
    };
  }, [user?.id]);

  if (!state || hidden) return null;
  const { team, rosterSize, cups } = state;
  const members = team?.members?.length ?? 0;
  const played = team ? (team.wins ?? 0) + (team.losses ?? 0) : 0;
  const steps = [
    { key: "equipe", icon: LuUsers, title: "Une équipe", text: "Crée la tienne ou rejoins-en une (invitation ou candidature).", done: Boolean(team), action: ["Trouver une équipe", "/cod/equipes"] },
    {
      key: "joueurs",
      icon: LuUserPlus,
      title: `${rosterSize} joueurs`,
      text: team ? `Il en faut ${rosterSize} pour un match : partage le lien d'invitation. ${Math.min(members, rosterSize)}/${rosterSize} aujourd'hui.` : `Il en faut ${rosterSize} pour un match de Division.`,
      done: members >= rosterSize,
      action: ["Inviter", "/cod/equipe?onglet=recrutement"],
    },
    { key: "match", icon: LuSwords, title: "Premier match", text: "Un Leader lance la recherche ou programme un match ce soir.", done: played > 0, action: ["Jouer", "/cod/division"] },
    { key: "coupe", icon: LuTrophy, title: "Première coupe", text: "Inscris l'équipe à la prochaine Coupe Horus : points de circuit à la clé.", done: cups > 0, action: ["S'inscrire", "/cod/tournoi"] },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  if (doneCount === steps.length) return null;
  const nextKey = steps.find((step) => !step.done)?.key;

  return (
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
              <span className="text-white/30">/{steps.length}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.setItem(HIDDEN_KEY, user.id);
                } catch {
                  // Sans importance.
                }
                setHidden(true);
              }}
              className="p-1 text-white/35 transition-colors hover:text-white"
              aria-label="Masquer les premiers pas en Division"
              title="Masquer"
            >
              <LuX aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div aria-hidden className="relative mt-5 flex gap-1.5 px-6 sm:px-8">
          {steps.map((step) => (
            <span key={step.key} className={cn("h-1.5 flex-1 -skew-x-[18deg]", step.done ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-white/10")} />
          ))}
        </div>

        <ol className="relative mt-6 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const next = step.key === nextKey;
            return (
              <li
                key={step.key}
                className={cn(
                  "relative flex flex-col gap-3 border-white/10 p-6 sm:p-7",
                  index > 0 && "border-t lg:border-t-0 lg:border-l",
                  index === 1 && "sm:border-t-0",
                  index % 2 === 1 && "sm:border-l",
                  next && "bg-gold/[0.06]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("font-display text-3xl font-black leading-none tabular-nums", step.done ? "text-gold" : next ? "text-white" : "text-white/30")}>
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
                  <p className={cn("font-display text-xl font-black uppercase leading-none tracking-wide", step.done && "text-white/50")}>{step.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{step.text}</p>
                </div>
                {!step.done && next ? (
                  <div className="mt-auto pt-1">
                    <Link
                      href={step.action[1]}
                      className="clip-slant inline-flex items-center gap-1.5 bg-gold px-4 py-2 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
                    >
                      {step.action[0]} <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : null}
                <span className="sr-only">{step.done ? "Étape terminée" : "Étape à faire"}</span>
              </li>
            );
          })}
        </ol>
      </TacticalCard>
    </div>
  );
}
