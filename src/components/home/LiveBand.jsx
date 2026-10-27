import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { LuClock, LuCrosshair, LuCrown, LuGamepad2, LuShield, LuSwords, LuTrophy } from "react-icons/lu";
import useLive from "../../hooks/useLive";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { MAPS } from "../../lib/maps";
import { FEED, ago } from "../cod/HubHighlights";

/**
 * Bande « En direct » en bas du premier écran de l'accueil (GET /live, hooks/useLive), comme un bandeau d'info
 * sportive : défile en continu, s'arrête au survol. Ce qui se passe maintenant d'abord (Classé, Division, coupe,
 * GTA 6, point qui pulse), puis ce qui est toujours vrai (fin de saison, leaders, dernier match, file ouverte) :
 * jamais vide, jamais de zéro. Étiquette « En direct » ou « À venir ».
 */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d", gta: "#ff6a3d", or: "#d4af37" };
const CUP_PAGE = { horus: "/cod/tournoi", anubis: "/cod/tournoi?coupe=anubis", saison: "/cod/tournoi?coupe=saison", playin: "/cod/tournoi?coupe=playin" };
const DAY = 86_400_000;
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
const hour = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const day = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `ce soir ${hour(iso)}`;
  if (date.toDateString() === new Date(today.getTime() + DAY).toDateString()) return `demain ${hour(iso)}`;
  return `${date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} ${hour(iso)}`;
};
const mapName = (map) => MAPS.find((m) => m.id === map)?.name ?? map;

/** Éléments de la bande : en direct d'abord, puis les infos toujours disponibles. */
function itemsOf(live) {
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
  if (live.gta) {
    const { id, title, startsAt, live: now, registered } = live.gta;
    (now ? hot : calm).push({ key: "gta", icon: LuGamepad2, color: COLORS.gta, label: now ? "GTA 6 · en cours" : "GTA 6", value: title, sub: now ? plural(registered, "inscrit") : day(startsAt), href: `/gta6/events/${id}` });
  }
  if (live.season?.endsAt && new Date(live.season.endsAt).getTime() > Date.now()) {
    const days = Math.ceil((new Date(live.season.endsAt).getTime() - Date.now()) / DAY);
    calm.push({ key: "saison", icon: LuClock, color: COLORS.or, label: live.season.name ?? "Saison", value: days > 1 ? `Fin dans ${days} jours` : "Dernier jour", sub: "classement archivé, récompenses", href: "/cod/leaderboard" });
  }
  if (live.leaders?.classe) {
    const p = live.leaders.classe;
    calm.push({ key: "leader-classe", icon: LuCrown, color: COLORS.classe, label: "Leader du Classé", value: `${p.username} · ${p.points.toLocaleString("fr-FR")} pts`, sub: `${p.wins} V / ${p.losses} D`, href: `/cod/profile/${p.id}` });
  }
  if (MATCH_TEAM_ENABLED && live.leaders?.division) {
    const t = live.leaders.division;
    calm.push({ key: "leader-division", icon: LuCrown, color: COLORS.division, label: "Leader de la Division", value: `[${t.tag}] ${t.name}`, sub: `${t.points.toLocaleString("fr-FR")} pts`, href: `/cod/equipes/${t.id}` });
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
  // Dernière action du fil, seulement si elle date de moins de 24 h (sinon le site paraîtrait à l'arrêt).
  const recent = (live.feed ?? []).find((event) => Date.now() - new Date(event.at).getTime() < DAY);
  if (recent) {
    const type = FEED[recent.type] ?? FEED.classe;
    calm.push({ key: "fil", icon: type.icon, color: type.color, label: "Dernière activité", value: recent.text, sub: ago(recent.at), href: recent.href, long: true });
  }
  if (!live.classe) calm.push({ key: "file", icon: LuCrosshair, color: COLORS.classe, label: "Classé", value: "File ouverte", sub: "2v2 à 5v5", href: "/cod/ranked" });
  return { hot, items: [...hot.map((item) => ({ ...item, live: true })), ...calm] };
}

function Item({ item }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group flex shrink-0 items-center gap-3 border-r border-white/10 px-6 py-3.5 transition-colors hover:bg-white/[0.05] sm:px-8 sm:py-4">
      <span className="relative">
        <Icon aria-hidden className="h-5 w-5" style={{ color: item.color }} />
        {item.live ? <span aria-hidden className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full" style={{ background: item.color }} /> : null}
      </span>
      <span className="font-tech text-[10px] uppercase tracking-[0.22em]" style={{ color: item.color }}>
        {item.label}
      </span>
      <span className={cn("font-display text-lg font-black uppercase leading-none sm:text-xl", item.long && "normal-case")}>{item.value}</span>
      {item.sub ? <span className="text-xs text-white/40">{item.sub}</span> : null}
    </Link>
  );
}

export function LiveBand({ initialData = null }) {
  const live = useLive(initialData);
  const reduceMotion = useReducedMotion();
  if (!live) return null;
  const { hot, items } = itemsOf(live);
  if (!items.length) return null;
  const on = hot.length > 0;
  // Défilement continu : la liste est doublée pour boucler sans saut ; vitesse selon la longueur.
  const duration = Math.max(25, items.length * 7);
  return (
    <motion.aside
      aria-label={on ? "En direct sur SixSence" : "À venir sur SixSence"}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 z-10 border-y border-gold/25 bg-ink/85 backdrop-blur-md"
    >
      <div className="flex items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-gold px-4 font-display text-sm font-black uppercase tracking-[0.14em] text-ink shadow-[8px_0_24px_rgba(0,0,0,0.5)] sm:px-6 sm:text-lg">
          <span aria-hidden className={cn("h-2 w-2", on ? "animate-pulse bg-[#0f5132]" : "bg-ink")} />
          {on ? "En direct" : "À venir"}
        </span>
        <div className="group/band relative flex-1 overflow-hidden">
          {reduceMotion ? (
            <div className="flex overflow-x-auto">
              {items.map((item) => (
                <Item key={item.key} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex w-max animate-[band-scroll_var(--band-duration)_linear_infinite] group-hover/band:[animation-play-state:paused]" style={{ "--band-duration": `${duration}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex">
                  {items.map((item) => (
                    <Item key={`${copy}-${item.key}`} item={item} />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-ink to-transparent" />
        </div>
      </div>
    </motion.aside>
  );
}
