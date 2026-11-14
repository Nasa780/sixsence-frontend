import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { api } from "../../lib/api";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { NavPopover } from "./NavPopover";

const REFRESH_MS = 30_000;
const plural = (count, word) => `${count.toLocaleString("fr-FR")} ${word}${count > 1 ? "s" : ""}`;

/** Activité du site : GET /cod/status (visiteurs, Classé) et GET /teams/status (Division), relus toutes les 30 s. */
function useActivity() {
  const [activity, setActivity] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [cod, teams] = await Promise.all([api("/cod/status"), MATCH_TEAM_ENABLED ? api("/teams/status").catch(() => null) : null]);
        if (!alive) return;
        setActivity({
          online: cod.siteOnline ?? cod.playersOnline ?? 0,
          rankedQueue: cod.playersInQueue ?? 0,
          rankedMatches: cod.matchesInProgress ?? 0,
          teamsSearching: teams?.teamsSearching ?? 0,
          teamMatches: teams?.matchesInProgress ?? 0,
        });
      } catch {
        // Serveur en veille : on garde le dernier chiffre connu.
      }
    };
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);
  return activity;
}

/** Pastille « N en ligne » de la barre du haut ; au clic, ce qui se passe en ce moment (file, matchs) avec des liens. */
export function OnlinePill() {
  const activity = useActivity();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { asPath } = useRouter();
  useEffect(close, [asPath, close]);

  if (!activity) return null;
  const rows = [
    {
      key: "classe",
      label: "Classé",
      color: "text-emerald-400",
      text: `${plural(activity.rankedQueue, "joueur")} en file · ${plural(activity.rankedMatches, "match")} en cours`,
      href: "/cod/ranked",
      cta: "Rejoindre la file",
    },
    ...(MATCH_TEAM_ENABLED
      ? [
          {
            key: "division",
            label: "Division",
            color: "text-cyan-300",
            text: `${plural(activity.teamsSearching, "équipe")} en recherche · ${plural(activity.teamMatches, "match")} en cours`,
            href: "/cod/division",
            cta: "Lancer un match",
          },
        ]
      : []),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`${activity.online} en ligne : voir l'activité du site`}
        className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm transition-colors hover:border-win/40 hover:bg-white/[0.08]"
      >
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
        </span>
        <span className="font-semibold tabular-nums">{activity.online.toLocaleString("fr-FR")}</span>
        <span className="hidden text-white/60 lg:inline">en ligne</span>
      </button>

      <NavPopover open={open} onClose={close} label="Activité du site" className="sm:w-80">
        <div className="border-b border-white/10 px-4 py-3">
          <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">En ce moment</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black leading-none tabular-nums text-white">{activity.online.toLocaleString("fr-FR")}</span>
            <span className="text-sm text-white/60">{activity.online > 1 ? "personnes sur le site" : "personne sur le site"}</span>
          </p>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {rows.map((row) => (
            <li key={row.key}>
              <Link href={row.href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05]">
                <span className="min-w-0 flex-1">
                  <span className={`block font-display text-sm font-bold uppercase tracking-[0.14em] ${row.color}`}>{row.label}</span>
                  <span className="block text-xs tabular-nums text-white/60">{row.text}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-white/45 group-hover:text-white">
                  {row.cta}
                  <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </NavPopover>
    </div>
  );
}
