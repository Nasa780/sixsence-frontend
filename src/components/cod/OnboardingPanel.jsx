import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuBell, LuCheck, LuCrosshair, LuIdCard, LuLoaderCircle, LuUserCheck, LuX } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import { cn } from "../../lib/cn";
import { DISCORD_INVITE_URL } from "../../lib/config";
import { enablePush, isPushEnabled, pushSupport } from "../../lib/push";
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

/**
 * « Premiers pas » : la mise en route d'un nouveau joueur, étape par étape
 * (identifiant Activision, notifications, Discord, premier match).
 * Disparaît quand tout est fait, ou si le joueur la masque.
 */
export function OnboardingPanel({ user }) {
  const profile = user?.profile;
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [push, setPush] = useState({ support: null, enabled: false });
  const [discordJoined, setDiscordJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [pushError, setPushError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setHidden(read(HIDDEN_KEY) === user.id);
    setDiscordJoined(read(DISCORD_KEY) === "1");
    const support = pushSupport();
    // Le service worker peut tarder (ou manquer) : on n'attend pas plus de 3 s.
    const timeout = new Promise((resolve) => setTimeout(() => resolve(false), 3000));
    Promise.race([isPushEnabled(), timeout]).then((enabled) => {
      setPush({ support, enabled });
      setReady(true);
    });
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
  const steps = [
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
          ? "Sur iPhone, installe d'abord l'appli SixSence (bouton « Installer l'appli »)."
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
    {
      key: "match",
      icon: LuCrosshair,
      title: "Premier match classé",
      text: "Lance une recherche : la saison commence pour toi.",
      done: profile.wins + profile.losses > 0,
      action: (
        <Link href="/cod/ranked" className={ACTION}>
          Jouer <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  const total = steps.length;
  if (doneCount === total) return null;
  const nextKey = steps.find((step) => !step.done)?.key;

  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
      <div aria-hidden className="absolute -right-16 top-0 h-full w-64 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />

      <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pt-6 sm:px-8">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Premiers pas</p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">Prêt pour le classé</h2>
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

      {/* Barre de progression segmentée */}
      <div aria-hidden className="relative mt-5 flex gap-1.5 px-6 sm:px-8">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={cn("h-1.5 flex-1 -skew-x-[18deg]", index < doneCount ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-white/10")} />
        ))}
      </div>

      <ol className="relative mt-6 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-5">
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
                {step.error ? <p className="mt-2 text-xs text-loss">{step.error}</p> : null}
              </div>
              {!step.done && step.action ? <div className="mt-auto pt-1">{step.action}</div> : null}
              <span className="sr-only">{step.done ? "Étape terminée" : "Étape à faire"}</span>
            </li>
          );
        })}
      </ol>
    </TacticalCard>
  );
}

const ACTION =
  "clip-slant inline-flex items-center gap-1.5 bg-gold px-4 py-2 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60";
