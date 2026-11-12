import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaTwitch } from "react-icons/fa6";
import { LuClock, LuCrosshair, LuCrown, LuGamepad2, LuShield, LuSwords, LuTrophy, LuUsers } from "react-icons/lu";
import useLive from "../../hooks/useLive";
import { cn } from "../../lib/cn";
import { GTA6_RELEASE, MATCH_TEAM_ENABLED } from "../../lib/config";
import { MAPS } from "../../lib/maps";
import { FEED, ago } from "../cod/HubHighlights";

/**
 * Bande « En direct » sous le premier écran de l'accueil (GET /live, hooks/useLive), comme un bandeau d'info
 * sportive, posée en bas du premier écran (accueil « accordéon des modes », 2026-11-11) : fond sombre, étiquette rouge
 * braise avec voyant radar et vu-mètre, fond gris translucide, éclat doré sur le filet (2026-11-12), chaque info dans la couleur de son mode ; défile en continu, s’arrête au survol (l’info visée ressort, les autres s’estompent) ; une activité arrivée pendant la visite passe en tête avec un éclair et « Nouveau » ; les valeurs roulent quand elles changent. Ce qui se passe maintenant d'abord (Classé, Division, coupe,
 * GTA 6, point qui pulse), puis ce qui est toujours vrai (connectés, saison, leaders, équipes actives, tournois,
 * sortie de GTA 6, dernier match, 3 dernières activités de la semaine, file ouverte) :
 * jamais vide, jamais de zéro. Étiquette toujours « En direct » (2026-11-11 ; avant : « À venir » quand rien n'était en
 * cours).
 */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d", gta: "#ff6a3d", or: "#d4af37" };
const CUP_PAGE = { horus: "/cod/tournoi", anubis: "/cod/tournoi?coupe=anubis", saison: "/cod/tournoi?coupe=saison", playin: "/cod/tournoi?coupe=playin" };
const DAY = 86_400_000;
/** Nombre à la française avec une espace insécable normale : l’espace fine du format fr-FR n’existe pas dans la police des titres. */
export const num = (n) => n.toLocaleString("fr-FR").replace(/ /g, " ");
export const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
const hour = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
export const day = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `ce soir ${hour(iso)}`;
  if (date.toDateString() === new Date(today.getTime() + DAY).toDateString()) return `demain ${hour(iso)}`;
  return `${date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} ${hour(iso)}`;
};
const mapName = (map) => MAPS.find((m) => m.id === map)?.name ?? map;

const feedKey = (event) => `${event.type}-${event.at}`;

/** Éléments de la bande : en direct d'abord, puis les infos toujours disponibles. */
function itemsOf(live, fresh = null) {
  const hot = [];
  const calm = [];
  if (live.classe) {
    const { inProgress, inQueue } = live.classe;
    hot.push({ key: "classe", icon: LuCrosshair, color: COLORS.classe, label: "Classé", value: inProgress ? `${plural(inProgress, "match")} en cours` : `${plural(inQueue, "joueur")} en file`, sub: inProgress && inQueue ? `${inQueue} en file` : null, href: "/cod/ranked" });
  }
  if (MATCH_TEAM_ENABLED && live.division) {
    const { match, searching } = live.division;
    hot.push(
      match
        ? { key: "division", icon: LuShield, color: COLORS.division, label: match.tournament ? "Tournoi" : "Division", value: `[${match.teamA?.tag ?? "?"}] vs [${match.teamB?.tag ?? "?"}]`, sub: [`map ${match.mapNumber}`, match.map ? mapName(match.map) : null].filter(Boolean).join(" · "), href: `/cod/equipes/match/${match.id}` }
        : { key: "division", icon: LuShield, color: COLORS.division, label: "Division", value: `${plural(searching, "équipe")} en recherche`, sub: null, href: "/cod/division" },
    );
  }
  if (MATCH_TEAM_ENABLED && live.cup) {
    const { name, phase, startsAt, drawAt, registered, capacity, kind } = live.cup;
    const item = {
      key: "tournoi",
      icon: LuTrophy,
      color: COLORS.tournoi,
      label: name,
      value: { registration: "Inscriptions ouvertes", checkin: "Check-in ouvert", drawn: "Tirage effectué", running: "En cours" }[phase],
      sub: phase === "registration" ? `${day(startsAt)} · ${registered}/${capacity}` : phase === "checkin" ? `tirage à ${hour(drawAt)}` : phase === "drawn" ? `premiers matchs à ${hour(startsAt)}` : "tableau en direct",
      href: CUP_PAGE[kind] ?? "/cod/tournoi",
    };
    (phase === "registration" ? calm : hot).push(item);
  }
  if (live.streams?.length) {
    const [first, ...others] = live.streams;
    hot.push({ key: "twitch", icon: FaTwitch, color: "#bf94ff", label: "Twitch · en direct", value: others.length ? `${others.length + 1} joueurs en direct` : first.player.username, sub: others.length ? null : plural(first.viewers, "spectateur"), href: "/#twitch" });
  }
  if (live.gta) {
    const { id, title, startsAt, live: now, registered } = live.gta;
    (now ? hot : calm).push({ key: "gta", icon: LuGamepad2, color: COLORS.gta, label: now ? "GTA 6 · en cours" : "GTA 6", value: title, sub: now ? plural(registered, "inscrit") : day(startsAt), href: `/gta6/events/${id}` });
  }
  if (live.online > 0) calm.push({ key: "online", icon: LuUsers, color: COLORS.or, label: "En ligne", value: plural(live.online, "joueur"), sub: "sur SixSence", href: "/cod" });
  if (live.season?.endsAt && new Date(live.season.endsAt).getTime() > Date.now()) {
    const days = Math.ceil((new Date(live.season.endsAt).getTime() - Date.now()) / DAY);
    calm.push({ key: "saison", icon: LuClock, color: COLORS.or, label: live.season.name ?? "Saison", value: days > 1 ? `Fin dans ${days} jours` : "Dernier jour", sub: "classement archivé, récompenses", href: "/cod/leaderboard" });
  } else if (live.season) {
    calm.push({ key: "saison", icon: LuClock, color: COLORS.or, label: live.season.name ?? "Saison", value: "En cours", sub: "classement de la saison", href: "/cod/leaderboard" });
  }
  if (live.leaders?.classe) {
    const p = live.leaders.classe;
    calm.push({ key: "leader-classe", icon: LuCrown, color: COLORS.classe, label: "Leader du Classé", value: `${p.username} · ${num(p.points)} pts`, sub: `${p.wins} V / ${p.losses} D`, href: `/cod/profile/${p.id}` });
  }
  if (MATCH_TEAM_ENABLED && live.leaders?.division) {
    const t = live.leaders.division;
    calm.push({ key: "leader-division", icon: LuCrown, color: COLORS.division, label: "Leader de la Division", value: `[${t.tag}] ${t.name}`, sub: `${num(t.points)} pts`, href: `/cod/equipes/${t.id}` });
  }
  if (MATCH_TEAM_ENABLED && !live.division && live.activeTeams > 0) {
    calm.push({ key: "equipes", icon: LuShield, color: COLORS.division, label: "Division", value: `${plural(live.activeTeams, "équipe")} ${live.activeTeams > 1 ? "actives" : "active"}`, sub: "4v4 · défis directs", href: "/cod/division" });
  }
  if (MATCH_TEAM_ENABLED && !live.cup) {
    calm.push({ key: "tournois", icon: LuTrophy, color: COLORS.tournoi, label: "Tournois", value: "Coupe Horus · Coupe Anubis", sub: "en équipe et en solo", href: "/cod/tournoi" });
  }
  const release = new Date(GTA6_RELEASE).getTime();
  if (!live.gta && release > Date.now()) {
    const days = Math.ceil((release - Date.now()) / DAY);
    calm.push({ key: "gta-sortie", icon: LuGamepad2, color: COLORS.gta, label: "GTA 6", value: days > 1 ? `Sortie dans ${days} jours` : "Sortie demain", sub: `le ${new Date(GTA6_RELEASE).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · le programme`, href: "/gta6" });
  }
  if (live.lastMatch) {
    const m = live.lastMatch;
    const teamMatch = m.kind !== "classe";
    calm.push({
      key: "dernier-match",
      icon: LuSwords,
      color: teamMatch ? COLORS[m.kind] : COLORS.classe,
      label: "Dernier match",
      value: teamMatch ? `[${m.teamA?.tag ?? "?"}] ${m.score[0]} – ${m.score[1]} [${m.teamB?.tag ?? "?"}]` : `Classé ${m.format}${m.map ? ` · ${mapName(m.map)}` : ""}`,
      sub: ago(m.at),
      href: m.href,
    });
  }
  // Fil : les 3 dernières actions de la semaine (plus ancien, le site paraîtrait à l'arrêt), sans répéter le dernier match.
  let first = null;
  (live.feed ?? [])
    .filter((event) => Date.now() - new Date(event.at).getTime() < 7 * DAY && (event.href !== live.lastMatch?.href || feedKey(event) === fresh?.key))
    .slice(0, 3)
    .forEach((event) => {
      const type = FEED[event.type] ?? FEED.classe;
      const item = { key: `fil-${feedKey(event)}`, icon: type.icon, color: type.color, label: type.label, value: event.text, sub: ago(event.at), href: event.href, long: true };
      if (fresh && feedKey(event) === fresh.key) first = { ...item, label: "À l'instant", fresh: fresh.chip };
      else calm.push(item);
    });
  if (!live.classe) calm.push({ key: "file", icon: LuCrosshair, color: COLORS.classe, label: "Classé", value: "File ouverte", sub: "S&D Hardcore · en solo", href: "/cod/ranked" });
  return { hot, items: [...(first ? [first] : []), ...hot.map((item) => ({ ...item, live: true })), ...calm] };
}

function Item({ item }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex shrink-0 items-center gap-2 border-r border-white/10 px-4 py-1.5 transition-[opacity,background-color] duration-300 hover:bg-white/[0.05] hover:opacity-100 group-hover/band:opacity-40 sm:gap-3 sm:px-7 sm:py-2 lg:py-2.5",
        item.fresh && "bg-ember/10",
      )}
    >
      <span className="relative">
        <Icon aria-hidden className="h-4 w-4 sm:h-[18px] sm:w-[18px]" style={{ color: item.color }} />
        {item.live ? <span aria-hidden className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full" style={{ background: item.color }} /> : null}
      </span>
      {item.fresh ? <span className="rounded-sm bg-ember px-1.5 py-0.5 font-tech text-[8px] font-black uppercase tracking-[0.2em] text-[#130503] shadow-[0_0_12px_rgba(255,77,46,0.7)] sm:text-[9px]">Nouveau</span> : null}
      <span className="font-tech text-[9px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.22em]" style={{ color: item.color }}>
        {item.label}
      </span>
      {/* La valeur roule quand elle change (file, inscrits, score…) */}
      <span className={cn("-my-[0.15em] inline-block overflow-hidden whitespace-nowrap py-[0.15em] font-display text-base font-black uppercase leading-none sm:text-lg", item.long && "normal-case")}>
        <span key={item.value} className="band-roll block">
          {item.value}
        </span>
      </span>
      {item.sub ? <span className="whitespace-nowrap text-[11px] text-white/40 sm:text-xs">{item.sub}</span> : null}
      {/* Projecteur au survol : un trait de la couleur de l'info */}
      <span aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100 sm:inset-x-7" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
    </Link>
  );
}

export function LiveBand({ initialData = null, floating = false }) {
  const live = useLive(initialData);
  const reduceMotion = useReducedMotion();
  // Info flash : une activité arrivée pendant la visite (pas celles déjà là au chargement) passe en tête avec un éclair.
  const head = live?.feed?.[0] ? feedKey(live.feed[0]) : null;
  const [seen, setSeen] = useState(head);
  const [fresh, setFresh] = useState(null);
  if (head !== seen) {
    setSeen(head);
    if (seen !== null && head !== null) setFresh({ key: head, chip: true, at: (fresh?.at ?? 0) + 1 });
  }
  useEffect(() => {
    if (!fresh?.chip) return undefined;
    const timer = setTimeout(() => setFresh((current) => current && { ...current, chip: false }), 10_000);
    return () => clearTimeout(timer);
  }, [fresh]);
  if (!live) return null;
  const { items } = itemsOf(live, fresh);
  if (!items.length) return null;
  // Défilement continu : la liste est doublée pour boucler sans saut ; vitesse selon la longueur.
  const duration = Math.max(18, items.length * 5);
  return (
    <motion.aside
      aria-label="En direct sur SixSence"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "z-10 border-gold/35 bg-[#3a3a42]/10 backdrop-blur-md",
        // Posée dans le premier écran : tout en haut sous le menu sur téléphone, en bas sur ordinateur.
        floating ? "absolute inset-x-0 top-16 border-b lg:top-auto lg:bottom-0 lg:border-b-0 lg:border-t" : "relative border-t",
      )}
    >
      <span aria-hidden className={cn("band-energy pointer-events-none absolute inset-x-0 z-20 h-0.5", floating ? "-bottom-px lg:bottom-auto lg:-top-px" : "-top-px")} />
      {fresh?.chip ? <span key={fresh.at} aria-hidden className="band-flash pointer-events-none absolute inset-0 z-20" /> : null}
      <div className="flex items-stretch">
        {/* Voyant « En direct » façon plateau télé : cadre rouge braise lumineux */}
        <span className="z-10 flex shrink-0 items-center gap-2.5 border-r border-white/10 py-1 pl-2.5 pr-2 sm:py-1 sm:pl-5 sm:pr-4 lg:py-1.5">
          <span className="band-onair flex items-center gap-2 rounded-md border-2 border-ember px-2.5 py-0.5 font-tech text-[9px] font-black uppercase tracking-[0.26em] text-[#ffd3c6] shadow-[0_0_18px_rgba(255,77,46,0.45),inset_0_0_12px_rgba(255,77,46,0.35)] [text-shadow:0_0_10px_var(--color-ember)] sm:gap-2.5 sm:px-3.5 sm:py-1 sm:text-[11px]">
            <span aria-hidden className="relative h-2 w-2 rounded-full bg-ember shadow-[0_0_10px_var(--color-ember)] sm:h-2.5 sm:w-2.5">
              <span className="band-radar absolute -inset-0.5 rounded-full border-2 border-ember" />
            </span>
            En direct
          </span>
          {/* Petit vu-mètre (ordinateur et tablette) */}
          <span aria-hidden className="hidden h-4 items-end gap-0.5 sm:flex">
            {[0, -0.3, -0.6, -0.15].map((delay) => (
              <i key={delay} className="band-vu w-[3px] bg-ember shadow-[0_0_6px_var(--color-ember)]" style={{ animationDelay: `${delay}s` }} />
            ))}
          </span>
        </span>
        <div className="group/band relative flex-1 overflow-hidden">
          {reduceMotion ? (
            <div className="flex overflow-x-auto">
              {items.map((item) => (
                <Item key={item.key} item={item} />
              ))}
            </div>
          ) : (
            <div key={fresh?.at ?? 0} className="flex w-max animate-[band-scroll_var(--band-duration)_linear_infinite] group-hover/band:[animation-play-state:paused]" style={{ "--band-duration": `${duration}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex">
                  {items.map((item) => (
                    <Item key={`${copy}-${item.key}`} item={item} />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-[#3a3a42]/10 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-[#3a3a42]/10 to-transparent sm:w-16" />
        </div>
      </div>
    </motion.aside>
  );
}
