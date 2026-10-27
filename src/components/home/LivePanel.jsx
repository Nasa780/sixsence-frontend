import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuChevronRight, LuCrosshair, LuGamepad2, LuShield, LuTrophy } from "react-icons/lu";
import useLive from "../../hooks/useLive";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { MAPS } from "../../lib/maps";
import { FEED, ago } from "../cod/HubHighlights";

/**
 * « En direct » de l'accueil (GET /live) : sur ordinateur, un panneau à droite du titre (LivePanel) ; sur
 * téléphone, une bande sous les boutons (LiveStrip). N'affiche que ce qui se passe (Classé, Division, coupe, GTA 6),
 * sinon « À venir » ; jamais de compteur à zéro. Fil des dernières actions qui défile.
 */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d", gta: "#ff6a3d" };
const CUP_PAGE = { horus: "/cod/tournoi", anubis: "/cod/tournoi?coupe=anubis", saison: "/cod/tournoi?coupe=saison", playin: "/cod/tournoi?coupe=playin" };
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
const hour = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const day = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  if (date.toDateString() === today.toDateString()) return `ce soir ${hour(iso)}`;
  if (date.toDateString() === tomorrow.toDateString()) return `demain ${hour(iso)}`;
  return `${date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · ${hour(iso)}`;
};
const mapName = (map) => MAPS.find((m) => m.id === map)?.name ?? map;

/** Lignes à afficher, de la plus « chaude » à la plus calme. */
function rowsOf(live) {
  const rows = [];
  if (live?.classe) {
    const { inProgress, inQueue, format } = live.classe;
    rows.push({
      key: "classe",
      icon: LuCrosshair,
      color: COLORS.classe,
      label: "Classé",
      value: inProgress ? `${plural(inProgress, "match")} en cours` : `${plural(inQueue, "joueur")} en file`,
      sub: inProgress && inQueue ? `${plural(inQueue, "joueur")} en file` : format ? `Format ${format}` : "Rejoins la file",
      href: "/cod/ranked",
      live: true,
    });
  }
  if (MATCH_TEAM_ENABLED && live?.division) {
    const { match, searching, inProgress } = live.division;
    rows.push(
      match
        ? {
            key: "division",
            icon: LuShield,
            color: COLORS.division,
            label: match.tournament ? "Match de tournoi" : inProgress > 1 ? `Division · ${inProgress} matchs` : "Division",
            value: `[${match.teamA?.tag ?? "?"}] vs [${match.teamB?.tag ?? "?"}]`,
            sub: [`Map ${match.mapNumber}`, match.map ? mapName(match.map) : null, `BO${match.bestOf}`].filter(Boolean).join(" · "),
            href: `/cod/equipes/match/${match.id}`,
            live: true,
          }
        : { key: "division", icon: LuShield, color: COLORS.division, label: "Division", value: `${plural(searching, "équipe")} en recherche`, sub: "Un adversaire t'attend", href: "/cod/division", live: true },
    );
  }
  if (MATCH_TEAM_ENABLED && live?.cup) {
    const { name, phase, startsAt, drawAt, registered, capacity, kind } = live.cup;
    const value = { registration: "Inscriptions ouvertes", checkin: "Check-in ouvert", drawn: "Tirage effectué", running: "En cours" }[phase];
    const sub =
      phase === "registration"
        ? `${day(startsAt)} · ${registered}/${capacity} ${kind === "anubis" ? "joueurs" : "équipes"}`
        : phase === "checkin"
          ? `Tirage à ${hour(drawAt)} · ${plural(registered, kind === "anubis" ? "inscrit" : "équipe")}`
          : phase === "drawn"
            ? `Premiers matchs à ${hour(startsAt)}`
            : "Tableau en direct";
    rows.push({ key: "tournoi", icon: LuTrophy, color: COLORS.tournoi, label: name, value, sub, href: CUP_PAGE[kind] ?? "/cod/tournoi", live: phase !== "registration" });
  }
  if (live?.gta) {
    const { id, title, startsAt, live: now, registered } = live.gta;
    rows.push({
      key: "gta",
      icon: LuGamepad2,
      color: COLORS.gta,
      label: now ? "GTA 6 · en cours" : "GTA 6",
      value: now ? title : `${title} · ${day(startsAt)}`,
      sub: registered ? plural(registered, "inscrit") : "Inscriptions ouvertes",
      href: `/gta6/events/${id}`,
      live: now,
    });
  }
  // Rien en cours ni prévu : on invite à jouer plutôt que d'afficher des zéros.
  if (!rows.some((row) => row.key === "classe")) {
    rows.push({ key: "classe", icon: LuCrosshair, color: COLORS.classe, label: "Classé", value: "File ouverte", sub: "2v2 à 5v5 · lance la première recherche", href: "/cod/ranked", live: false });
  }
  return rows.sort((a, b) => Number(b.live) - Number(a.live)).slice(0, 4);
}

/** Dernières actions, une à la fois. */
function Ticker({ feed, compact = false }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (feed.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % feed.length), 3500);
    return () => clearInterval(timer);
  }, [feed.length]);
  const event = feed[index % feed.length];
  if (!event) return null;
  const type = FEED[event.type] ?? FEED.classe;
  const Icon = type.icon;
  return (
    <div className="relative h-10 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={event.id}
          initial={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: -24, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Link href={event.href} className={cn("flex h-full items-center gap-2.5 text-xs transition-colors hover:bg-white/[0.04]", compact ? "px-3" : "px-5")}>
            <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" style={{ color: type.color }} />
            <span className="min-w-0 flex-1 truncate text-white/75">{event.text}</span>
            <span className="shrink-0 text-white/35">{ago(event.at)}</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Panneau à droite du titre (ordinateur). */
export function LivePanel({ initialData = null }) {
  const live = useLive(initialData);
  const reduceMotion = useReducedMotion();
  if (!live) return null;
  const rows = rowsOf(live);
  const calm = !rows.some((row) => row.live);
  return (
    <motion.aside
      aria-label={calm ? "À venir sur SixSence" : "En direct sur SixSence"}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="clip-tactical relative w-[22rem] overflow-hidden border border-gold/25 bg-ink/70 backdrop-blur-md [--cut:18px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-linear-to-b from-transparent via-gold/8 to-transparent" />
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-gold">
          <span aria-hidden className={cn("h-1.5 w-1.5", calm ? "bg-gold/60" : "animate-pulse bg-win shadow-[0_0_8px_#34d399]")} />
          {calm ? "À venir" : "En direct"}
        </p>
        {live.online >= 3 ? <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/40">{live.online} connectés</p> : null}
      </div>
      <ul className="mt-3 space-y-px">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <motion.li
              key={row.key}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.12 }}
            >
              <Link href={row.href} className="group relative flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.04]">
                <span aria-hidden className="absolute inset-y-2 left-0 w-0.5" style={{ background: row.color }} />
                <span className="relative grid h-9 w-9 shrink-0 place-items-center border" style={{ borderColor: `${row.color}66`, background: `${row.color}14` }}>
                  <Icon aria-hidden className="h-4 w-4" style={{ color: row.color }} />
                  {row.live ? <span aria-hidden className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full" style={{ background: row.color }} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-tech text-[9px] uppercase tracking-[0.22em]" style={{ color: row.color }}>
                    {row.label}
                  </span>
                  <span className="block truncate font-display text-lg font-black uppercase leading-tight">{row.value}</span>
                  <span className="block truncate text-[11px] text-white/45">{row.sub}</span>
                </span>
                <LuChevronRight aria-hidden className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
              </Link>
            </motion.li>
          );
        })}
      </ul>
      {live.feed?.length ? (
        <div className="border-t border-white/10">
          <Ticker feed={live.feed} />
        </div>
      ) : null}
    </motion.aside>
  );
}

/** Bande sous les boutons (téléphone) : résumé, puis le fil qui défile. */
export function LiveStrip({ initialData = null }) {
  const live = useLive(initialData);
  if (!live) return null;
  const rows = rowsOf(live);
  const hot = rows.filter((row) => row.live);
  const summary = hot.length ? hot.map((row) => (row.key === "tournoi" ? `${row.value.toLowerCase()} · ${row.label}` : row.value)).join(" · ") : rows.map((row) => row.value).slice(0, 2).join(" · ");
  return (
    <div className="border border-gold/25 bg-ink/70">
      <p className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-tech text-[9px] uppercase tracking-[0.26em] text-gold">
        <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0", hot.length ? "animate-pulse bg-win" : "bg-gold/60")} />
        <span className="truncate">
          {hot.length ? "En direct" : "À venir"} · {summary}
        </span>
      </p>
      {live.feed?.length ? <Ticker feed={live.feed} compact /> : null}
    </div>
  );
}
