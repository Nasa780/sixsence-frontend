import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuBell, LuCheck, LuCrosshair, LuIdCard, LuLoaderCircle, LuShield, LuSwords, LuTrophy, LuUserCheck, LuUserPlus, LuUsers, LuX } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { DISCORD_INVITE_URL, MATCH_TEAM_ENABLED } from "../../lib/config";
import { enablePush, isPushEnabled, pushSupport } from "../../lib/push";
import { supabase } from "../../lib/supabase";
import { TacticalCard } from "../ui/TacticalCard";

const DISCORD_KEY = "sixsence:discord-rejoint";
const HIDDEN_KEY = "sixsence:premiers-pas-masques";

const read = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sans importance.
  }
};

/** Chaque parcours : couleur du mode (data-univers) et titre. */
const PATHS = {
  classe: { label: "Classé", icon: LuCrosshair, univers: "classe", title: "Prêt pour le classé" },
  division: { label: "Division", icon: LuShield, univers: "division", title: "Prêt pour la Division" },
};

/**
 * « Premiers pas » (page MW4) : un seul bloc, deux onglets Classé et Division. Les étapes du compte (Discord,
 * identifiant Activision, notifications, serveur Discord) sont communes et ne se font qu'une fois ; Classé ajoute le
 * premier match classé, Division l'équipe, les joueurs, le premier match et la première coupe (aucun match classé
 * exigé). Onglet Division d'office si le joueur a une équipe. Disparaît quand les deux parcours sont finis, ou si le
 * joueur le masque. Division en pause : seulement le Classé, sans onglets.
 */
export function OnboardingPanel({ user }) {
  const profile = user?.profile;
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [push, setPush] = useState({ support: null, enabled: false });
  const [discordJoined, setDiscordJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [pushError, setPushError] = useState(null);
  const [division, setDivision] = useState(null);
  const [tab, setTab] = useState(null);

  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    setHidden(read(HIDDEN_KEY) === user.id);
    setDiscordJoined(read(DISCORD_KEY) === "1");
    const support = pushSupport();
    // Le service worker peut tarder (ou manquer) : on n'attend pas plus de 3 s.
    const timeout = new Promise((resolve) => setTimeout(() => resolve(false), 3000));
    const teamState = MATCH_TEAM_ENABLED
      ? Promise.all([api("/teams/me"), api("/teams/me/play").catch(() => null)])
          .then(async ([me, play]) => {
            const team = me.team;
            let cups = 0;
            if (team?.id) {
              const { count } = await supabase.from("tournament_teams").select("tournament_id", { count: "exact", head: true }).eq("team_id", team.id).not("checked_in_at", "is", null);
              cups = count ?? 0;
            }
            return { team, rosterSize: play?.rosterSize ?? 4, cups };
          })
          .catch(() => null)
      : Promise.resolve(null);
    Promise.all([Promise.race([isPushEnabled(), timeout]), teamState]).then(([enabled, team]) => {
      if (!alive) return;
      setPush({ support, enabled });
      setDivision(team);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  if (!ready || !profile || hidden) return null;

  async function activatePush() {
    setPending(true);
    setPushError(null);
    try {
      await enablePush();
      setPush((prev) => ({ ...prev, enabled: true }));
    } catch (caught) {
      setPushError(caught.message);
    } finally {
      setPending(false);
    }
  }

  const pushUnavailable = push.support === "unsupported";
  const common = [
    {
      key: "compte",
      icon: LuUserCheck,
      title: "Compte Discord",
      text: "Connecté : ton pseudo et ton avatar viennent de Discord.",
      done: true,
      action: null,
    },
    {
      key: "activision",
      icon: LuIdCard,
      title: "Identifiant Activision",
      text: "Indispensable pour que tes coéquipiers t'invitent en partie privée.",
      done: Boolean(profile.activision_id),
      action: (
        <Link href="/cod/profile#titre-compte" className={ACTION}>
          Renseigner <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      ),
    },
    {
      key: "notifications",
      icon: LuBell,
      title: "Notifications",
      text:
        push.support === "ios-needs-install"
          ? "Sur iPhone, installe d'abord l'appli SixSence (bouton « Installer l'application »)."
          : push.support === "denied"
            ? "Bloquées : autorise-les dans les réglages du navigateur, puis recharge la page."
            : "Sois prévenu du match trouvé, même site fermé.",
      done: push.enabled || pushUnavailable,
      action:
        push.support === "ok" ? (
          <button type="button" onClick={activatePush} disabled={pending} className={ACTION}>
            {pending ? <LuLoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
            Activer
          </button>
        ) : null,
      error: pushError,
    },
    {
      key: "discord",
      icon: FaDiscord,
      title: "Serveur Discord",
      text: "Annonces, salons vocaux des matchs et rôles de rang automatiques.",
      done: discordJoined,
      action: DISCORD_INVITE_URL ? (
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            write(DISCORD_KEY, "1");
            setDiscordJoined(true);
          }}
          className={ACTION}
        >
          Rejoindre <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      ) : null,
    },
  ];

  const link = (label, href) => (
    <Link href={href} className={ACTION}>
      {label} <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
    </Link>
  );
  const steps = {
    classe: [
      ...common,
      {
        key: "match",
        icon: LuCrosshair,
        title: "Premier match classé",
        text: "Lance une recherche : la saison commence pour toi.",
        done: profile.wins + profile.losses > 0,
        action: link("Jouer", "/cod/ranked"),
      },
    ],
  };
  if (division) {
    const { team, rosterSize, cups } = division;
    const members = team?.members?.length ?? 0;
    const played = team ? (team.wins ?? 0) + (team.losses ?? 0) : 0;
    steps.division = [
      ...common,
      { key: "equipe", icon: LuUsers, title: "Une équipe", text: "Crée la tienne ou rejoins-en une (invitation ou candidature).", done: Boolean(team), action: link("Trouver une équipe", "/cod/equipes") },
      {
        key: "joueurs",
        icon: LuUserPlus,
        title: `${rosterSize} joueur${rosterSize > 1 ? "s" : ""}`,
        text: "Invite tes amis à rejoindre ton équipe.",
        done: members >= rosterSize,
        action: team ? link("Inviter", "/cod/equipe?onglet=recrutement") : null,
      },
      { key: "division-match", icon: LuSwords, title: "Premier match", text: "Un Leader lance la recherche ou programme un match ce soir.", done: played > 0, action: team ? link("Jouer", "/cod/division") : null },
      { key: "coupe", icon: LuTrophy, title: "Première coupe", text: "Inscris l'équipe à la prochaine Coupe Horus : points de circuit à la clé.", done: cups > 0, action: team ? link("S'inscrire", "/cod/tournoi") : null },
    ];
  }

  const paths = Object.keys(steps);
  const finished = (key) => steps[key].every((step) => step.done);
  if (paths.every(finished)) return null;
  // Onglet ouvert : celui choisi, sinon Division pour un joueur qui a une équipe, sinon le premier parcours pas fini.
  const current = tab && steps[tab] ? tab : division?.team && !finished("division") ? "division" : paths.find((key) => !finished(key)) ?? paths[0];
  const list = steps[current];
  const doneCount = list.filter((step) => step.done).length;
  const total = list.length;
  const nextKey = list.find((step) => !step.done)?.key;

  return (
    <div data-univers={paths.length > 1 ? PATHS[current].univers : undefined}>
      <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
        <div aria-hidden className="absolute -right-16 top-0 h-full w-64 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />

        <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pt-6 sm:px-8">
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Premiers pas</p>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">{PATHS[current].title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-display text-4xl font-black leading-none tabular-nums">
              <span className="text-gold-gradient">{doneCount}</span>
              <span className="text-white/30">/{total}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                write(HIDDEN_KEY, user.id);
                setHidden(true);
              }}
              className="p-1 text-white/35 transition-colors hover:text-white"
              aria-label="Masquer les premiers pas"
              title="Masquer"
            >
              <LuX aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Onglets : un parcours par mode, avec son avancement */}
        {paths.length > 1 ? (
          <div role="tablist" aria-label="Parcours" className="relative mt-5 flex gap-2 px-6 sm:px-8">
            {paths.map((key) => {
              const path = PATHS[key];
              const Icon = path.icon;
              const done = steps[key].filter((step) => step.done).length;
              const active = key === current;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  data-univers={path.univers}
                  className={cn(
                    "clip-slant inline-flex items-center gap-2 px-4 py-2 font-display text-sm font-black uppercase tracking-[0.14em] transition-colors",
                    active ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:text-gold",
                  )}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {path.label}
                  <span className={cn("font-tech text-[10px]", active ? "text-ink/70" : "text-white/35")}>
                    {finished(key) ? <LuCheck aria-hidden className="h-3.5 w-3.5" /> : `${done}/${steps[key].length}`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Barre de progression segmentée */}
        <div aria-hidden className="relative mt-5 flex gap-1.5 px-6 sm:px-8">
          {list.map((step) => (
            <span key={step.key} className={cn("h-1.5 flex-1 -skew-x-[18deg]", step.done ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-white/10")} />
          ))}
        </div>

        <ol className={cn("relative mt-6 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2", total > 5 ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
          {list.map((step, index) => {
            const Icon = step.icon;
            const next = step.key === nextKey;
            const cols = total > 5 ? 4 : 5;
            return (
              <li
                key={step.key}
                className={cn(
                  "relative flex flex-col gap-3 border-white/10 p-6 sm:p-7",
                  index > 0 && "border-t",
                  index === 1 && "sm:border-t-0",
                  index % 2 === 1 && "sm:border-l",
                  index % cols !== 0 && "lg:border-l",
                  index < cols ? "lg:border-t-0" : "lg:border-t",
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
                  {step.error ? <p className="mt-2 text-xs text-loss">{step.error}</p> : null}
                </div>
                {!step.done && step.action ? <div className="mt-auto pt-1">{step.action}</div> : null}
                <span className="sr-only">{step.done ? "Étape terminée" : "Étape à faire"}</span>
              </li>
            );
          })}
        </ol>
      </TacticalCard>
    </div>
  );
}

const ACTION =
  "clip-slant inline-flex items-center gap-1.5 bg-gold px-4 py-2 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60";
