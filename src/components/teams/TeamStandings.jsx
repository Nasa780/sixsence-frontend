import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuCrown } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { TeamCrest } from "./TeamParts";

/**
 * Classement des équipes animé : lignes qui arrivent en cascade, points qui montent, jauge de ratio
 * en segments, flèches des places gagnées ou perdues en 24 h (reconstruites depuis les matchs de la
 * saison, team_matches.points_changes), et lignes qui glissent quand le classement change (temps réel).
 */

const DAY_MS = 24 * 60 * 60_000;
const COLS = "grid-cols-[4.25rem_minmax(0,1fr)_auto] lg:grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_3.5rem_3.5rem_3.5rem_9rem]";

/** Place de chaque équipe il y a 24 h, pour les flèches. */
function useStandingsHistory(teams, seasonStart) {
  const [matches, setMatches] = useState(null);
  const signature = (teams ?? []).map((team) => `${team.id}:${team.points}`).join(",");

  useEffect(() => {
    if (!teams) return;
    // Matchs des dernières 24 h (pas avant le début de la saison : les points y ont été remis à zéro).
    const since = new Date(Math.max(Date.now() - DAY_MS, seasonStart ? new Date(seasonStart).getTime() : 0)).toISOString();
    supabase
      .from("team_matches")
      .select("team_a, team_b, points_changes, completed_at")
      .eq("status", "completed")
      .not("points_changes", "is", null)
      .gte("completed_at", since)
      .limit(1000)
      .then(({ data }) => setMatches(data ?? []));
    // Rechargé quand les points changent (match validé, correction).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, seasonStart]);

  return useMemo(() => {
    if (!teams || !matches) return {};
    const recent = {};
    const since = Date.now() - DAY_MS;
    for (const match of matches) {
      if (new Date(match.completed_at).getTime() <= since) continue;
      for (const [side, id] of [["A", match.team_a], ["B", match.team_b]]) {
        const delta = match.points_changes?.[side];
        if (typeof delta === "number") recent[id] = (recent[id] ?? 0) + delta;
      }
    }
    const before = [...teams]
      .map((team) => ({ id: team.id, points: team.points - (recent[team.id] ?? 0), position: team.position }))
      .sort((a, b) => b.points - a.points || a.position - b.position);
    const move = {};
    before.forEach((entry, index) => {
      const team = teams.find((item) => item.id === entry.id);
      move[entry.id] = team ? index + 1 - team.position : 0;
    });
    return move;
  }, [teams, matches]);
}

/** Nombre qui monte jusqu'à sa valeur (depuis 1 000 à l'arrivée, puis depuis l'ancienne valeur). */
function CountUp({ value, from = 1000, delay = 0 }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : from);
  const last = useRef(from);
  useEffect(() => {
    if (reduce) return setShown(value);
    const start = last.current;
    last.current = value;
    let frame;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 1100);
        setShown(Math.round(start + (value - start) * (1 - (1 - k) ** 3)));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, delay, reduce]);
  return shown;
}

function Move({ value }) {
  if (!value) return <span className="font-tech text-xs text-white/25">—</span>;
  const up = value > 0;
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      title={`${up ? "+" : "-"}${Math.abs(value)} place${Math.abs(value) > 1 ? "s" : ""} en 24 h`}
      className={cn("inline-flex items-center gap-0.5 font-tech text-[11px] font-bold tabular-nums", up ? "text-win drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "text-loss drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]")}
    >
      <span aria-hidden className="text-[10px] leading-none">{up ? "▲" : "▼"}</span>
      {Math.abs(value)}
    </motion.span>
  );
}

function RatioGauge({ wins, losses, delay }) {
  const played = wins + losses;
  const rate = played ? Math.round((wins / played) * 100) : null;
  const on = rate === null ? 0 : Math.round(rate / 10);
  return (
    <div>
      <p className="mb-1.5 font-tech text-[11px] font-bold tabular-nums text-white/80">{rate === null ? "—" : `${rate}%`}</p>
      <div className="flex gap-[3px]">
        {Array.from({ length: 10 }, (_, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + index * 0.045 }}
            className={cn("h-1.5 flex-1 -skew-x-[20deg]", index < on ? "bg-gold shadow-[0_0_6px_color-mix(in_srgb,var(--color-gold)_70%,transparent)]" : "bg-white/10")}
          />
        ))}
      </div>
    </div>
  );
}

/** Écart de points affiché un instant quand un match change le score d'une équipe. */
function useDeltas(teams) {
  const previous = useRef(null);
  const [deltas, setDeltas] = useState({});
  useEffect(() => {
    if (!teams) return;
    const before = previous.current;
    previous.current = Object.fromEntries(teams.map((team) => [team.id, team.points]));
    if (!before) return;
    const changed = {};
    for (const team of teams) if (before[team.id] !== undefined && before[team.id] !== team.points) changed[team.id] = team.points - before[team.id];
    if (Object.keys(changed).length === 0) return;
    setDeltas(changed);
    const timer = setTimeout(() => setDeltas({}), 2200);
    return () => clearTimeout(timer);
  }, [teams]);
  return deltas;
}

export function TeamStandings({ teams, mineId = null, qualified, qualifiedSpots, seasonStart = null }) {
  const move = useStandingsHistory(teams, seasonStart);
  const deltas = useDeltas(teams);
  const lastQualified = teams.findLastIndex((team) => team.position <= qualifiedSpots);

  return (
    <div>
      <div className={cn("hidden gap-x-4 px-4 pb-3 font-tech text-[10px] uppercase tracking-[0.22em] text-white/40 lg:grid", COLS)}>
        <span>Rang</span>
        <span>Équipe</span>
        <span className="text-right">Points</span>
        <span className="text-center">J</span>
        <span className="text-center">V</span>
        <span className="text-center">D</span>
        <span>Ratio</span>
      </div>
      <ol className="space-y-2">
        {teams.map((team, index) => {
          const first = index === 0;
          const isMine = team.id === mineId;
          const delay = 0.15 + index * 0.07;
          const delta = deltas[team.id];
          return (
            <motion.li
              key={team.id}
              layout
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ layout: { type: "spring", stiffness: 140, damping: 22 }, delay: index * 0.07, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative"
            >
              <Link
                href={`/cod/equipes/${team.id}`}
                className={cn(
                  "group relative grid items-center gap-x-4 overflow-hidden border-l-2 px-4 py-3.5 transition-colors duration-300 [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]",
                  COLS,
                  first ? "bg-linear-to-r from-gold/[0.16] via-gold/[0.05] to-white/[0.03]" : isMine ? "bg-gold/[0.08]" : "bg-white/[0.035] hover:bg-white/[0.06]",
                  qualified(team) || first ? "border-gold" : "border-transparent",
                )}
              >
                {/* Balayage lumineux au survol. */}
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-linear-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:animate-[standings-sweep_0.9s_ease] group-hover:opacity-100" />

                <span className="relative flex items-center gap-3">
                  <span
                    className={cn(
                      "font-display text-2xl font-black leading-none tabular-nums lg:text-3xl",
                      first ? "text-gold drop-shadow-[0_0_14px_color-mix(in_srgb,var(--color-gold)_80%,transparent)]" : "text-white/80",
                    )}
                  >
                    {team.position}
                  </span>
                  <Move value={move[team.id]} />
                </span>

                <span className="relative flex min-w-0 items-center gap-3.5">
                  <TeamCrest team={team} size={first ? 46 : 40} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      {first ? <LuCrown aria-hidden className="h-4 w-4 shrink-0 text-gold" /> : null}
                      <span className="truncate font-display text-lg font-bold uppercase leading-none tracking-wide transition-colors group-hover:text-gold lg:text-xl">{team.name}</span>
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-white/45">
                      <span className="font-tech text-[10px] tracking-[0.18em]" style={{ color: team.color }}>
                        [{team.tag}]
                      </span>
                      {isMine ? <span className="font-tech text-[10px] uppercase tracking-[0.18em] text-gold">Ton équipe</span> : null}
                      <span className="lg:hidden">
                        {team.played} J · <span className="text-win">{team.wins} V</span> · <span className="text-loss">{team.losses} D</span>
                      </span>
                    </span>
                  </span>
                </span>

                <span className="relative text-right">
                  <span className="font-tech text-lg font-bold tabular-nums text-gold lg:text-xl">
                    <CountUp value={team.points} delay={delay * 1000} />
                  </span>
                  {delta ? (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -14 }}
                      transition={{ duration: 2 }}
                      className={cn("absolute -top-3 right-0 font-tech text-[11px] font-bold", delta > 0 ? "text-win" : "text-loss")}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </motion.span>
                  ) : null}
                  <span className="mt-1 block font-tech text-[9px] uppercase tracking-[0.2em] text-white/35 lg:hidden">pts</span>
                </span>

                <span className="relative hidden text-center font-tech text-sm tabular-nums text-white/75 lg:block">{team.played}</span>
                <span className="relative hidden text-center font-tech text-sm font-bold tabular-nums text-win lg:block">{team.wins}</span>
                <span className="relative hidden text-center font-tech text-sm font-bold tabular-nums text-loss lg:block">{team.losses}</span>
                <span className="relative hidden lg:block">
                  <RatioGauge wins={team.wins} losses={team.losses} delay={delay + 0.3} />
                </span>
              </Link>
              {index === lastQualified && index < teams.length - 1 ? (
                <div className="relative my-4 flex items-center gap-3">
                  <span className="h-px flex-1 border-t border-dashed border-gold/50" />
                  <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Qualification · top {qualifiedSpots}</span>
                  <span className="h-px w-8 border-t border-dashed border-gold/50" />
                </div>
              ) : null}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
