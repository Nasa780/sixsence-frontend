import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuArrowRight, LuRadio, LuTrophy } from "react-icons/lu";
import { api } from "../../lib/api";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { CountUp } from "../effects/CountUp";
import { TiltCard } from "../effects/TiltCard";
import { NavPopover } from "./NavPopover";

const REFRESH_MS = 30_000;

/**
 * Activité du site : GET /cod/status (visiteurs, files du Classé) et GET /teams/status (Division), relus toutes les 30 s
 * et à chaque ouverture du panneau (reload), pour des chiffres à jour au moment où on regarde.
 */
function useActivity() {
  const [activity, setActivity] = useState(null);
  const load = useCallback(async () => {
    try {
      const [cod, teams] = await Promise.all([api("/cod/status"), MATCH_TEAM_ENABLED ? api("/teams/status").catch(() => null) : null]);
      setActivity({
        online: cod.siteOnline ?? cod.playersOnline ?? 0,
        // Files classées ouvertes (la file 1v1 de test n'est pas montrée).
        queues: (cod.queues ?? []).filter((queue) => queue.teamSize > 1),
        rankedMatches: cod.matchesInProgress ?? 0,
        teamsSearching: teams?.teamsSearching ?? 0,
        teamMatches: teams?.matchesInProgress ?? 0,
      });
    } catch {
      // Serveur en veille : on garde le dernier chiffre connu.
    }
  }, []);
  useEffect(() => {
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [load]);
  return [activity, load];
}

/** Prochaine coupe ou prochain tournoi prévu (GET /teams/cups), lu à l'ouverture du panneau ; null s'il n'y en a pas. */
function useNextCup(open) {
  const [cup, setCup] = useState(null);
  useEffect(() => {
    if (!open || !MATCH_TEAM_ENABLED) return;
    api("/teams/cups").then((result) => setCup((result.upcoming ?? []).find((item) => item.status === "scheduled") ?? null), () => {});
  }, [open]);
  return cup;
}

/** « samedi · 21 h 00 » dans les 6 jours, sinon « 12 déc. · 21 h 00 » (heure de Paris). */
function cupDate(iso) {
  const date = new Date(iso);
  const near = date.getTime() - Date.now() < 6 * 86_400_000;
  const day = date.toLocaleDateString("fr-FR", near ? { weekday: "long", timeZone: "Europe/Paris" } : { day: "numeric", month: "short", timeZone: "Europe/Paris" });
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).replace(":", " h ");
  return `${day} · ${time}`;
}

/** Bande « prochain rendez-vous » sous les cartes, aux couleurs du Tournoi : nom, date, places prises. */
function NextCup({ cup }) {
  const unit = cup.kind === "anubis" ? "joueurs" : "équipes";
  return (
    <Link href={`/cod/tournoi?id=${cup.id}`} className="group mx-2 mb-2 flex items-center gap-3 border border-[#e5484d]/35 bg-[#e5484d]/[0.08] px-3 py-2 transition-colors hover:bg-[#e5484d]/[0.16]">
      <LuTrophy aria-hidden className="h-5 w-5 shrink-0 text-[#f87171]" style={{ filter: "drop-shadow(0 0 6px #e5484d)" }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-black uppercase tracking-[0.08em] text-white">{cup.name}</span>
        <span className="block text-[11px] text-white/60">
          {cupDate(cup.startsAt)} · {cup.registered}/{cup.capacity} {unit}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#f87171] group-hover:text-white">
        S&apos;inscrire
        <LuArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Points d'une file active : un point par place, allumés pour les joueurs (ou équipes) qui attendent. */
function QueueDots({ label, size, needed, color }) {
  return (
    <span className="flex items-center gap-1.5" title={`${label} : ${size} sur ${needed}`}>
      <span className="min-w-8 shrink-0 font-tech text-[9px] font-bold uppercase tracking-[0.12em] text-white/80">{label}</span>
      <span aria-hidden className="flex flex-wrap gap-[3px]">
        {Array.from({ length: needed }, (_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full transition-all duration-500" style={index < size ? { background: color, boxShadow: `0 0 6px ${color}` } : { background: "rgba(255,255,255,0.15)" }} />
        ))}
      </span>
      <span className="sr-only">
        {size} sur {needed}
      </span>
    </span>
  );
}

/**
 * Carte verticale d'un mode (Classé, Division), même taille pour les deux : image de sa bande d'accueil en entier,
 * nom, deux grands chiffres (en file, en cours), files actives seulement (points), bouton Jouer.
 */
function ModeCard({ mode }) {
  return (
    <Link href={mode.href} className="group relative flex h-60 flex-col overflow-hidden border border-white/10 transition-colors hover:border-white/25">
      <span aria-hidden className="absolute inset-0 bg-cover bg-top transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${mode.image})` }} />
      <span aria-hidden className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/35 to-ink/95" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5" style={{ background: mode.color, boxShadow: `0 0 12px ${mode.color}` }} />
      <span className="relative px-3 pt-2.5 text-center font-display text-base font-black uppercase tracking-[0.12em]" style={{ color: mode.color, textShadow: `0 0 14px ${mode.color}88` }}>
        {mode.label}
      </span>
      <span className="relative mt-auto block space-y-2 px-3 pb-2.5">
        <span className="grid grid-cols-2 gap-2">
          {[
            [mode.waiting, "en file"],
            [mode.matches, "en cours"],
          ].map(([value, label]) => (
            <span key={label} className="text-center">
              <span className="block font-display text-2xl font-black leading-none tabular-nums text-white" style={{ textShadow: `0 0 16px ${mode.color}66` }}>
                <CountUp value={value} duration={700} />
              </span>
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</span>
            </span>
          ))}
        </span>
        <span className="flex h-[3.4rem] flex-col items-center justify-center space-y-0.5 overflow-hidden">
          {mode.queues.length > 0 ? (
            <span className="flex flex-col items-start space-y-0.5">
              {mode.queues.map((queue) => (
                <QueueDots key={queue.label} {...queue} color={mode.color} />
              ))}
            </span>
          ) : (
            <span className="block text-center text-[11px] text-white/45">Personne en file</span>
          )}
        </span>
        <span className="flex items-center justify-center gap-1.5 border-t border-white/15 pt-2 text-xs font-semibold text-white/80 group-hover:text-white">
          {mode.cta}
          <LuArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: mode.color }} />
        </span>
      </span>
    </Link>
  );
}

/** Antenne « N » (personnes en ligne) de la barre du haut ; au clic, ce qui se passe en ce moment avec des liens. */
export function OnlinePill() {
  const [activity, reload] = useActivity();
  const [open, setOpen] = useState(false);
  const nextCup = useNextCup(open);
  const close = useCallback(() => setOpen(false), []);
  const { asPath } = useRouter();
  useEffect(close, [asPath, close]);

  if (!activity) return null;
  const modes = [
    {
      key: "classe",
      label: "Classé",
      color: "#34d399",
      image: "/images/accueil/mw4-valeria.webp",
      href: "/cod/ranked",
      cta: "Jouer en Classé",
      waiting: activity.queues.reduce((sum, queue) => sum + queue.size, 0),
      matches: activity.rankedMatches,
      // Seulement les files où quelqu'un attend.
      queues: activity.queues.filter((queue) => queue.size > 0).map((queue) => ({ label: queue.label, size: queue.size, needed: queue.needed })),
    },
    ...(MATCH_TEAM_ENABLED
      ? [
          {
            key: "division",
            label: "Division",
            color: "#22d3ee",
            image: "/images/accueil/mw4-price.webp",
            href: "/cod/division",
            cta: "Jouer en Division",
            waiting: activity.teamsSearching,
            matches: activity.teamMatches,
            // Deux équipes en recherche suffisent pour un match.
            queues: activity.teamsSearching > 0 ? [{ label: "Équipes", size: activity.teamsSearching, needed: 2 }] : [],
          },
        ]
      : []),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          // Chiffres relus à l'ouverture : à jour au moment où on regarde.
          if (!open) reload();
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-label={`${activity.online} en ligne : voir l'activité du site`}
        title="Personnes sur le site"
        className="flex h-9 items-center gap-1.5 border-b border-transparent px-2 transition-colors hover:border-gold"
      >
        {/* Antenne verte qui émet et chiffre, sur ordinateur comme sur téléphone. */}
        <span aria-hidden className="relative grid place-items-center">
          <LuRadio className="h-[18px] w-[18px] text-win" />
          <span className="absolute inset-0 animate-ping rounded-full bg-win/20 motion-reduce:animate-none" />
        </span>
        <span className="font-display text-lg font-black tabular-nums text-white">{activity.online.toLocaleString("fr-FR")}</span>
      </button>

      <NavPopover open={open} onClose={close} label="Activité du site" className="sm:w-[23rem]">
        {/* En-tête : personnes en ligne en grand, antenne qui pulse. */}
        <div className="border-b border-white/10 px-4 py-2.5 text-center">
          <span className="block font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">En ce moment</span>
          <span className="mt-0.5 flex items-center justify-center gap-2">
            <span aria-hidden className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-win/10">
              <span className="absolute inset-0 animate-ping rounded-full bg-win/15 motion-reduce:animate-none" />
              <LuRadio className="relative h-4 w-4 text-win" />
            </span>
            <span className="font-display text-2xl font-black leading-none tabular-nums text-white">
              <CountUp value={activity.online} duration={700} />
            </span>
            <span className="text-sm text-white/60">{activity.online > 1 ? "personnes sur le site" : "personne sur le site"}</span>
          </span>
        </div>
        {/* Les deux modes à égalité, côte à côte. */}
        <ul className="grid grid-cols-2 gap-2 p-2">
          {modes.map((mode) => (
            <li key={mode.key}>
              {/* Légère inclinaison vers la souris, avec reflet (ordinateur ; immobile si animations réduites). */}
              <TiltCard max={5}>
                <ModeCard mode={mode} />
              </TiltCard>
            </li>
          ))}
        </ul>
        {/* Prochain rendez-vous (coupe ou tournoi prévu), seulement s'il y en a un. */}
        {nextCup ? <NextCup cup={nextCup} /> : null}
      </NavPopover>
    </div>
  );
}
