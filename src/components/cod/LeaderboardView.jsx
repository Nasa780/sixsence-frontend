import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuCrown, LuFlame } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import useTeamTags from "../../hooks/useTeamTags";
import { TeamTag } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { EmptyState, Loading } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { RankEmblem } from "./RankEmblem";
import { CountUp } from "../effects/CountUp";

const DAY_MS = 24 * 60 * 60_000;
const EASE = [0.22, 1, 0.36, 1];
// Podium : le 3e, puis le 2e, puis le 1er entrent en scène.
const PODIUM_DELAY = [0.45, 0.25, 0.1];

const winRate = (wins, losses) => (wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null);

/**
 * Places gagnées ou perdues en 24 h : classement reconstruit sans les points des matchs classés des dernières 24 h
 * (cod_matches.points_changes), comparé au classement actuel.
 */
function useMoves(rows) {
  const [recent, setRecent] = useState(null);
  const signature = (rows ?? []).map((row) => `${row.user_id}:${row.points}`).join(",");

  useEffect(() => {
    if (!rows?.length) return;
    supabase
      .from("cod_matches")
      .select("points_changes")
      .eq("status", "completed")
      .gte("completed_at", new Date(Date.now() - DAY_MS).toISOString())
      .not("points_changes", "is", null)
      .limit(500)
      .then(({ data }) => {
        const sums = {};
        for (const match of data ?? []) {
          for (const [id, delta] of Object.entries(match.points_changes ?? {})) if (typeof delta === "number") sums[id] = (sums[id] ?? 0) + delta;
        }
        setRecent(sums);
      });
    // Rechargé quand les points changent (match validé).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return useMemo(() => {
    if (!rows || !recent) return {};
    const before = rows
      .map((row, index) => ({ id: row.user_id, points: row.points - (recent[row.user_id] ?? 0), index }))
      .sort((a, b) => b.points - a.points || a.index - b.index);
    const move = {};
    before.forEach((entry, place) => {
      move[entry.id] = place - entry.index;
    });
    return move;
  }, [rows, recent]);
}

/** Flèche des places gagnées (vert) ou perdues (rouge) en 24 h. */
function Move({ value }) {
  if (!value) return null;
  const up = value > 0;
  return (
    <motion.span
      initial={{ scale: 1.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.5 }}
      title={`${up ? "+" : "-"}${Math.abs(value)} place${Math.abs(value) > 1 ? "s" : ""} en 24 h`}
      className={cn("inline-flex items-center gap-0.5 font-tech text-[10px] font-bold tabular-nums", up ? "text-win drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "text-loss drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]")}
    >
      <span aria-hidden className="text-[9px] leading-none">{up ? "▲" : "▼"}</span>
      {Math.abs(value)}
    </motion.span>
  );
}

/**
 * Classement COD : podium des trois premiers (entrée en scène du 3e au 1er), puis tableau (lignes en cascade,
 * points qui défilent, places gagnées ou perdues en 24 h, lignes qui glissent quand le classement change).
 *
 * Dynamique : la page écoute la table cod_leaderboard (Supabase Realtime).
 * Dès qu'un match est clôturé, elle recharge le classement, sans action du visiteur.
 *
 * limit         : nombre de joueurs affichés
 * currentUserId : joueur connecté (mis en avant), ou null
 * compact       : sans podium (tableau seul), pour les encarts
 */
export function LeaderboardView({ limit = 100, currentUserId = null, compact = false }) {
  const [rows, setRows] = useState(null);
  const teamTags = useTeamTags((rows || []).map((row) => row.user_id));
  const [live, setLive] = useState(false);
  const moves = useMoves(rows);
  const reduce = useReducedMotion();
  const refreshTimer = useRef(null);
  const instanceId = useId();

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data } = await supabase
        .from("cod_leaderboard")
        .select("user_id, username, avatar_url, points, wins, losses, win_streak")
        .order("points", { ascending: false })
        .order("wins", { ascending: false })
        .limit(limit);
      if (active) setRows(data || []);
    };
    refresh();

    const channel = supabase
      .channel(`leaderboard-${limit}-${instanceId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cod_leaderboard" }, () => {
        // Un match clôturé modifie dix lignes d'un coup : on regroupe en un seul rechargement.
        if (refreshTimer.current) clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(refresh, 400);
      })
      .subscribe((status) => setLive(String(status) === "SUBSCRIBED"));

    return () => {
      active = false;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [limit, instanceId]);

  if (rows === null) return <Loading label="Chargement du classement…" />;

  if (rows.length === 0) {
    return (
      <EmptyState title="Le classement est vierge">
        Aucun match classé n&apos;a encore été joué. Rejoins la file : la première place est à prendre.
      </EmptyState>
    );
  }

  const podium = compact ? [] : rows.slice(0, 3);
  const others = compact ? rows : rows.slice(3);
  const offset = compact ? 1 : 4;

  return (
    <div>
      <p role="status" className={cn("mb-6 inline-flex items-center gap-2 text-xs", live ? "text-win" : "text-white/40")}>
        <span aria-hidden className={cn("h-1.5 w-1.5", live ? "animate-pulse-gold bg-win" : "bg-white/30")} />
        {live ? "Mis à jour en direct" : "Connexion au direct…"}
      </p>

      {/* --- Podium -------------------------------------------------------- */}
      {podium.length > 0 ? (
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {podium.map((row, index) => {
            const rate = winRate(row.wins, row.losses);
            const rank = rankFor(row.points);
            return (
              <motion.li
                key={row.user_id}
                className={cn(index === 0 && "md:-mt-4")}
                initial={reduce ? false : { opacity: 0, y: 48, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={index === 0 ? { type: "spring", stiffness: 170, damping: 17, delay: PODIUM_DELAY[0] } : { duration: 0.6, delay: PODIUM_DELAY[index], ease: EASE }}
              >
                <TacticalCard highlight={index === 0} interactive className="h-full" innerClassName={cn("overflow-hidden p-6", index === 0 && "holo")}>
                  <span aria-hidden className="absolute -right-2 -top-5 select-none font-display text-[8rem] font-black leading-none text-outline opacity-60">
                    {index + 1}
                  </span>
                  <div className="relative">
                    <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
                      {index === 0 ? (
                        <motion.span
                          aria-hidden
                          className="inline-flex"
                          initial={reduce ? false : { scale: 0, rotate: -35 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 11, delay: 0.85 }}
                        >
                          <LuCrown className="h-4 w-4" />
                        </motion.span>
                      ) : null}
                      <span className="sr-only">Position </span>#{index + 1}
                      <Move value={moves[row.user_id]} />
                    </p>
                    <div className="mt-4 flex items-center gap-3.5">
                      <Avatar src={row.avatar_url} name={row.username} size={56} ring={rankGradient(rank, 160)} />
                      <div className="min-w-0">
                        <Link href={`/cod/profile/${row.user_id}`} className="block truncate font-display text-3xl font-black uppercase leading-none hover:text-gold">
                          {row.username}
                        </Link>
                        <p className="mt-1.5 flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-[0.16em]" style={{ color: rank.text }}>
                          <RankEmblem rank={rank} size={22} animated={false} />
                          {rank.name}
                          <TeamTag team={teamTags.get(row.user_id)} className="ml-1" />
                          {row.user_id === currentUserId ? <span className="ml-2 text-white/60">· Toi</span> : null}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-6 grid grid-cols-3 gap-px bg-white/10">
                      <PodiumStat label="Points" value={<CountUp value={row.points} delay={PODIUM_DELAY[index] * 1000 + 250} />} accent />
                      <PodiumStat label="V / D" value={`${row.wins} / ${row.losses}`} />
                      <PodiumStat label="Victoires" value={rate === null ? "—" : `${rate}%`} />
                    </dl>
                  </div>
                </TacticalCard>
              </motion.li>
            );
          })}
        </ol>
      ) : null}

      {/* --- Tableau ------------------------------------------------------- */}
      {others.length > 0 ? (
        <div className={cn("overflow-x-auto", podium.length > 0 && "mt-10")}>
          <table className="w-full min-w-[34rem] border-separate border-spacing-y-1.5 text-left">
            <caption className="sr-only">Classement COD</caption>
            <thead>
              <tr className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">
                <th scope="col" className="w-16 px-4 py-2 font-medium">Rang</th>
                <th scope="col" className="px-4 py-2 font-medium">Joueur</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Points</th>
                <th scope="col" className="whitespace-nowrap px-4 py-2 text-right font-medium">V / D</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Victoires</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Série</th>
              </tr>
            </thead>
            <tbody>
              {others.map((row, index) => {
                const isMe = row.user_id === currentUserId;
                const rank = rankFor(row.points);
                const rate = winRate(row.wins, row.losses);
                return (
                  <motion.tr
                    key={row.user_id}
                    layout={reduce ? false : "position"}
                    initial={reduce ? false : { opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: (compact ? 0.05 : 0.6) + Math.min(index, 20) * 0.04, ease: EASE }}
                    className={cn("transition-colors", isMe ? "bg-gold/10" : "bg-white/[0.03] hover:bg-white/[0.06]")}
                  >
                    <td className={cn("border-l-2 px-4 py-3 font-tech text-sm font-bold tabular-nums", isMe ? "border-gold text-gold" : "border-transparent text-white/50")}>
                      <span className="flex items-center gap-1.5">
                        {index + offset}
                        <Move value={moves[row.user_id]} />
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cod/profile/${row.user_id}`} className="group flex items-center gap-3">
                        <Avatar src={row.avatar_url} name={row.username} size={34} ring={rankGradient(rank, 160)} />
                        <span className="min-w-0">
                          <span
                            className="block truncate font-display text-lg font-bold uppercase leading-none tracking-wide group-hover:!text-gold"
                            style={{ color: rank.text }}
                          >
                            {row.username}
                            {isMe ? <span className="ml-2 text-xs text-gold">· Toi</span> : null}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-white/45">
                            <RankEmblem rank={rank} size={16} animated={false} />
                            {rank.name}
                            <TeamTag team={teamTags.get(row.user_id)} link={false} className="ml-1" />
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-tech text-base font-bold tabular-nums text-gold">
                      <CountUp value={row.points} delay={(compact ? 50 : 600) + Math.min(index, 20) * 40} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-white/70">
                      {row.wins} / {row.losses}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-white/70">{rate === null ? "—" : `${rate}%`}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-white/70">
                      {row.win_streak >= 3 ? (
                        <span className="inline-flex items-center gap-1 text-gold">
                          <LuFlame aria-hidden className="h-4 w-4" />
                          {row.win_streak}
                        </span>
                      ) : (
                        row.win_streak
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function PodiumStat({ label, value, accent = false }) {
  return (
    <div className="bg-ink-800 px-3 py-3">
      <dt className="font-tech text-[9px] uppercase tracking-[0.22em] text-white/40">{label}</dt>
      <dd className={cn("mt-1 whitespace-nowrap font-display text-xl font-black leading-none tabular-nums sm:text-2xl", accent && "text-gold")}>{value}</dd>
    </div>
  );
}
