import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LuCrown, LuFlame, LuRadio, LuShield, LuSwords, LuTrophy, LuUserPlus } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { rankFor } from "../../lib/ranks";
import { TeamCrest } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { RankEmblem } from "./RankEmblem";

/** Fil d'activité : icône et couleur par type d'événement. */
export const FEED = {
  classe: { icon: LuSwords, color: "#34d399", label: "Classé" },
  division: { icon: LuShield, color: "#22d3ee", label: "Division" },
  tournoi: { icon: LuTrophy, color: "#e5484d", label: "Tournoi" },
  coupe: { icon: LuCrown, color: "#e7c05a", label: "Coupe" },
  equipe: { icon: LuShield, color: "#22d3ee", label: "Équipe" },
  arrivee: { icon: LuUserPlus, color: "#e7c05a", label: "Arrivée" },
};

export function ago(iso) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

/** Joueur et match de la semaine sur le hub MW4, mis de côté le 2026-10-22 (fil d'activité sur l'accueil) : true pour les remettre. */
export const SHOW_WEEK_HIGHLIGHTS = false;

/**
 * Hub MW4 : joueur de la semaine, match de la semaine et fil d'activité en direct (GET /highlights,
 * rafraîchi toutes les minutes). Rien n'est affiché tant qu'il n'y a pas de données.
 */
export function HubHighlights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api("/highlights")
        .then((d) => alive && setData(d))
        .catch(() => {});
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 60000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  if (!data || (!data.playerOfWeek && !data.matchOfWeek && !data.feed?.length)) return null;
  return (
    <div className="grid grid-cols-1 gap-12 xl:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        {data.playerOfWeek ? <PlayerOfWeek player={data.playerOfWeek} /> : null}
        {data.matchOfWeek ? <MatchOfWeek match={data.matchOfWeek} /> : null}
      </div>
      {data.feed?.length ? <ActivityFeed feed={data.feed} /> : null}
    </div>
  );
}

/** Nombre qui défile de 0 à `value` quand il apparaît (désactivé si l'utilisateur réduit les animations). */
function CountUpInView({ value, delay = 0 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-60px" });
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce || !seen) return undefined;
    let frame;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 1200);
        setShown(Math.round(value * (1 - (1 - k) ** 3)));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [seen, value, delay, reduce]);
  return <span ref={ref}>{shown.toLocaleString("fr-FR")}</span>;
}

/**
 * Carte « Joueur de la semaine » (aussi sur la page Renommée). Entrée en scène à l'apparition : reflet doré qui balaie la
 * carte (puis revient de temps en temps), « MVP » qui glisse en fond, avatar dans un cadre doré qui respire et couronne,
 * points qui défilent, barre victoires / défaites qui se remplit. Sobre si l'utilisateur réduit les animations.
 */
export function PlayerOfWeek({ player }) {
  const rank = rankFor(player.points ?? 0);
  const reduce = useReducedMotion();
  const games = (player.wins ?? 0) + (player.losses ?? 0);
  const winShare = games ? Math.round((player.wins / games) * 100) : 0;
  const appear = (delay, from = { opacity: 0, y: 16 }) =>
    reduce ? {} : { initial: from, whileInView: { opacity: 1, x: 0, y: 0, scale: 1 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } };

  return (
    <TacticalCard highlight cut={26} innerClassName="relative overflow-hidden">
      {/* Lueur dorée qui respire et grille fine */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl"
        animate={reduce ? undefined : { opacity: [0.45, 0.9, 0.45], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05]" />
      {/* « MVP » qui glisse depuis la droite */}
      <motion.div
        aria-hidden
        {...appear(0.1, { opacity: 0, x: 80 })}
        className="pointer-events-none absolute -right-2 top-0 select-none font-display text-[8rem] font-black uppercase leading-none text-outline opacity-20 sm:text-[10rem]"
      >
        MVP
      </motion.div>
      {/* Reflet doré : un passage à l'apparition, puis toutes les 7 s */}
      {reduce ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-gold/25 to-transparent"
          initial={{ x: "0%" }}
          whileInView={{ x: "450%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.35, ease: "easeInOut", repeat: Infinity, repeatDelay: 7 }}
        />
      )}

      <Link href={`/cod/profile/${player.id}`} className="group relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <motion.span {...appear(0, { opacity: 0, scale: 0.8 })} className="relative shrink-0">
          {/* Cadre doré qui respire */}
          <motion.span
            aria-hidden
            className="absolute -inset-1.5 rounded-xl border-2 border-gold"
            animate={reduce ? undefined : { boxShadow: ["0 0 0px rgba(231,192,90,0.0)", "0 0 28px rgba(231,192,90,0.55)", "0 0 0px rgba(231,192,90,0.0)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Avatar full src={player.avatarUrl} name={player.username} size={104} className="relative transition-transform duration-500 group-hover:scale-105" />
          {/* Couronne */}
          <motion.span
            aria-hidden
            initial={reduce ? false : { scale: 0, rotate: -30 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.55 }}
            className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-gold text-ink shadow-lg shadow-gold/30"
          >
            <LuCrown className="h-5 w-5" />
          </motion.span>
        </motion.span>

        <div className="min-w-0 flex-1">
          <motion.div {...appear(0.1)}>
            <Eyebrow>
              <LuFlame aria-hidden className="mr-1 inline h-3.5 w-3.5" />
              Joueur de la semaine
            </Eyebrow>
          </motion.div>
          <motion.p {...appear(0.2)} className="mt-2 truncate font-display text-5xl font-black uppercase leading-none group-hover:text-gold">
            {player.username}
          </motion.p>
          <motion.div {...appear(0.3)} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-display text-4xl font-black text-gold tabular-nums">
              +<CountUpInView value={player.net} delay={400} /> pts
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-white/70">
              <RankEmblem rank={rank} size={26} />
              {rank.name}
            </span>
          </motion.div>
          {/* Victoires / défaites de la semaine */}
          <motion.div {...appear(0.4)} className="mt-4 max-w-sm">
            <div className="flex justify-between font-tech text-[10px] uppercase tracking-[0.2em]">
              <span className="text-win">{player.wins} V</span>
              <span className="text-white/45">cette semaine</span>
              <span className="text-loss">{player.losses} D</span>
            </div>
            <div className="mt-1.5 flex h-1.5 overflow-hidden bg-loss/40">
              <motion.span
                className="block h-full bg-win"
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${winShare}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={reduce ? { width: `${winShare}%` } : undefined}
              />
            </div>
          </motion.div>
        </div>
      </Link>
    </TacticalCard>
  );
}

function MatchOfWeek({ match }) {
  const side = (players, won) => (
    <div className={cn("min-w-0 flex-1 space-y-2", !won && "opacity-60")}>
      {players.map((p) => (
        <div key={p.id} className="flex items-center gap-2.5">
          <Avatar full src={p.avatarUrl} name={p.username} size={30} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.username}</span>
          <span className="font-tech text-[10px] text-white/40 tabular-nums">{p.points}</span>
        </div>
      ))}
      {won ? <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-win">Victoire</p> : null}
    </div>
  );
  return (
    <TacticalCard cut={22} innerClassName="relative overflow-hidden p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Eyebrow>Match de la semaine</Eyebrow>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none">
            Le choc <span className="text-gold-gradient">sur {match.map}</span>
          </p>
        </div>
        <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-white/45">
          {match.format} · {match.total.toLocaleString("fr-FR")} pts cumulés
        </p>
      </div>
      <Link href={`/cod/match/${match.id}`} className="mt-5 flex items-start gap-4">
        {side(match.teamA, match.winner === "A")}
        <span className="mt-2 font-display text-2xl font-black text-gold/70">VS</span>
        {side(match.teamB, match.winner === "B")}
      </Link>
    </TacticalCard>
  );
}

/**
 * Fil d'activité de l'accueil (bloc « En direct ») : se charge seul (GET /highlights, toutes les minutes),
 * dans une carte, sans grand titre. Rien n'est affiché tant qu'il n'y a pas d'activité.
 */
export function LiveFeed() {
  const [feed, setFeed] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      api("/highlights")
        .then((d) => alive && setFeed(d.feed ?? []))
        .catch(() => alive && setFeed([]));
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 60000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);
  return (
    <TacticalCard cut={24} innerClassName="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Fil d&apos;activité</p>
        <LiveDot />
      </div>
      {feed === null ? (
        <p className="mt-6 text-sm text-white/45">Chargement…</p>
      ) : feed.length === 0 ? (
        <p className="mt-6 text-sm text-white/55">Rien pour l&apos;instant : le premier match lancera le fil.</p>
      ) : (
        <FeedList feed={feed} limit={8} />
      )}
    </TacticalCard>
  );
}

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-win">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
      </span>
      <LuRadio aria-hidden className="h-3.5 w-3.5" />
      Live
    </span>
  );
}

function ActivityFeed({ feed }) {
  return (
    <section aria-labelledby="titre-fil">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Eyebrow>En direct</Eyebrow>
          <h2 id="titre-fil" className="mt-2 font-display text-4xl font-black uppercase leading-none">
            Fil d&apos;activité
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-win">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
          </span>
          <LuRadio aria-hidden className="h-3.5 w-3.5" />
          Live
        </span>
      </div>
      <FeedList feed={feed} limit={12} />
    </section>
  );
}

function FeedList({ feed, limit }) {
  return (
    <ol className="relative mt-6 space-y-1 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-white/10">
      {feed.slice(0, limit).map((event, index) => {
        const kind = FEED[event.type] ?? FEED.classe;
        return (
          <motion.li key={event.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
            <Link href={event.href} className="group relative flex items-center gap-3 px-1 py-2 transition-colors hover:bg-white/[0.03]">
              <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center border bg-ink" style={{ borderColor: `${kind.color}66`, color: kind.color }}>
                {event.team ? (
                  <TeamCrest team={event.team} size={26} />
                ) : event.avatar ? (
                  <Avatar full src={event.avatar} name="?" size={26} />
                ) : (
                  <kind.icon aria-hidden className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white/85 group-hover:text-white">{event.text}</span>
                <span className="block font-tech text-[9px] uppercase tracking-[0.2em]" style={{ color: kind.color }}>
                  {kind.label} <span className="text-white/35">· {ago(event.at)}</span>
                </span>
              </span>
              {typeof event.points === "number" ? <span className="font-tech text-xs font-bold text-win tabular-nums">+{event.points}</span> : null}
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}
