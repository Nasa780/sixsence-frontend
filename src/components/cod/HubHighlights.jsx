import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
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
const FEED = {
  classe: { icon: LuSwords, color: "#34d399", label: "Classé" },
  division: { icon: LuShield, color: "#22d3ee", label: "Division" },
  tournoi: { icon: LuTrophy, color: "#e5484d", label: "Tournoi" },
  coupe: { icon: LuCrown, color: "#e7c05a", label: "Coupe" },
  equipe: { icon: LuShield, color: "#22d3ee", label: "Équipe" },
  arrivee: { icon: LuUserPlus, color: "#e7c05a", label: "Arrivée" },
};

function ago(iso) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

/**
 * Hub MW4 : joueur de la semaine, match de la semaine et fil d'activité en direct (GET /highlights,
 * rafraîchi toutes les minutes). Rien n'est affiché tant qu'il n'y a pas de données.
 */
export function HubHighlights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => api("/highlights").then((d) => alive && setData(d)).catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
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

function PlayerOfWeek({ player }) {
  const rank = rankFor(player.points ?? 0);
  return (
    <TacticalCard highlight cut={26} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-4 top-2 select-none font-display text-[7rem] font-black uppercase leading-none text-outline opacity-20">MVP</div>
      <Link href={`/cod/profile/${player.id}`} className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <motion.span initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 140, damping: 14 }} className="relative shrink-0">
          <span aria-hidden className="absolute -inset-2 rounded-xl bg-[conic-gradient(from_0deg,transparent,rgba(231,192,90,0.6),transparent_40%)] opacity-70 blur-[2px] animate-[spin_6s_linear_infinite]" />
          <Avatar full src={player.avatarUrl} name={player.username} size={104} className="relative" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <Eyebrow>
            <LuFlame aria-hidden className="mr-1 inline h-3.5 w-3.5" />
            Joueur de la semaine
          </Eyebrow>
          <p className="mt-2 truncate font-display text-5xl font-black uppercase leading-none">{player.username}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-display text-3xl font-black text-gold tabular-nums">+{player.net} pts</span>
            <span className="text-sm text-white/60">
              {player.wins} V · {player.losses} D cette semaine
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <RankEmblem rank={rank} size={22} animated={false} />
              {rank.name}
            </span>
          </div>
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
      <ol className="relative mt-6 space-y-1 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-white/10">
        {feed.slice(0, 12).map((event, index) => {
          const kind = FEED[event.type] ?? FEED.classe;
          return (
            <motion.li key={event.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
              <Link href={event.href} className="group relative flex items-center gap-3 px-1 py-2 transition-colors hover:bg-white/[0.03]">
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center border bg-ink" style={{ borderColor: `${kind.color}66`, color: kind.color }}>
                  {event.team ? <TeamCrest team={event.team} size={26} /> : event.avatar ? <Avatar full src={event.avatar} name="?" size={26} /> : <kind.icon aria-hidden className="h-4 w-4" />}
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
    </section>
  );
}
