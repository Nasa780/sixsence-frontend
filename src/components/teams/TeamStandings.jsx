import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuCrown, LuFlame, LuTrophy, LuUserPlus } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { TeamCrest } from "./TeamParts";

/**
 * Classement des équipes (version « premium » du 2026-11-13) : podium en bannières (le n°1 en grande affiche sur la
 * bannière de son équipe, n°2 et n°3 côte à côte), puis lignes aux couleurs de chaque équipe (liseré lumineux,
 * bannière en fondu), avec rang et places gagnées ou perdues en 24 h, forme sur les 5 derniers matchs, victoires et
 * défaites, points. Flèches, séries et forme reconstruites depuis les matchs de la saison (team_matches.points_changes) ;
 * les lignes glissent quand le classement change (temps réel).
 */

const DAY_MS = 24 * 60 * 60_000;
const COLS = "grid-cols-[3.25rem_minmax(0,1fr)_auto] lg:grid-cols-[4.5rem_minmax(0,1fr)_8.5rem_7.5rem_7rem]";
const WIN = "#34d399";
const LOSS = "#f87171";

/** Métaux du podium : or, argent, bronze. */
const METALS = [
  { label: "Leader de la Division", base: "#d4af37", light: "#f8ecc0" },
  { label: "Argent", base: "#b9c2cf", light: "#f4f7fb" },
  { label: "Bronze", base: "#cd7f32", light: "#f6c08a" },
];

/** Place de chaque équipe il y a 24 h (flèches), série de victoires en cours et 5 derniers résultats, depuis les matchs de la saison. */
function useStandingsHistory(teams, seasonStart) {
  const [matches, setMatches] = useState(null);
  const signature = (teams ?? []).map((team) => `${team.id}:${team.points}`).join(",");

  useEffect(() => {
    if (!teams) return;
    // Matchs de la saison (avant son début, les points ont été remis à zéro), du plus ancien au plus récent.
    let query = supabase
      .from("team_matches")
      .select("team_a, team_b, points_changes, completed_at")
      .eq("status", "completed")
      .not("points_changes", "is", null)
      .order("completed_at", { ascending: true })
      .limit(2000);
    if (seasonStart) query = query.gte("completed_at", seasonStart);
    query.then(({ data }) => setMatches(data ?? []));
    // Rechargé quand les points changent (match validé, correction).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, seasonStart]);

  return useMemo(() => {
    if (!teams || !matches) return { move: {}, streak: {}, form: {} };
    const recent = {};
    const streak = {};
    const form = {};
    const since = Date.now() - DAY_MS;
    for (const match of matches) {
      const isRecent = new Date(match.completed_at).getTime() > since;
      for (const [side, id] of [["A", match.team_a], ["B", match.team_b]]) {
        const delta = match.points_changes?.[side];
        if (typeof delta !== "number") continue;
        streak[id] = delta > 0 ? (streak[id] ?? 0) + 1 : 0;
        // Du plus récent au plus ancien.
        (form[id] ??= []).unshift(delta > 0 ? "V" : "D");
        if (isRecent) recent[id] = (recent[id] ?? 0) + delta;
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
    return { move, streak, form };
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
  if (!value) return <span className="font-tech text-[10px] text-white/25">—</span>;
  const up = value > 0;
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      title={`${up ? "+" : "-"}${Math.abs(value)} place${Math.abs(value) > 1 ? "s" : ""} en 24 h`}
      className={cn("inline-flex items-center gap-0.5 font-tech text-[10px] font-bold tabular-nums", up ? "text-win drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "text-loss drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]")}
    >
      <span aria-hidden className="leading-none">{up ? "▲" : "▼"}</span>
      {Math.abs(value)}
    </motion.span>
  );
}

/** 5 derniers résultats, du plus récent (à gauche) au plus ancien ; cases vides tant que l'équipe a peu joué. */
export function FormChips({ form = [], size = "md" }) {
  const cells = Array.from({ length: 5 }, (_, index) => form[index] ?? null);
  return (
    <span className="flex gap-1" role="img" aria-label={form.length ? `Forme : ${form.slice(0, 5).join(" ")}` : "Pas encore de match"}>
      {cells.map((result, index) => (
        <span
          key={index}
          aria-hidden
          className={cn("grid -skew-x-[14deg] place-items-center font-tech font-black", size === "sm" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]", result ? "text-ink" : "border border-white/12")}
          style={result ? { background: result === "V" ? WIN : LOSS, boxShadow: `0 0 8px ${result === "V" ? WIN : LOSS}66` } : null}
        >
          <span className="skew-x-[14deg]">{result ?? ""}</span>
        </span>
      ))}
    </span>
  );
}

const rate = (team) => (team.wins + team.losses ? Math.round((team.wins / (team.wins + team.losses)) * 100) : null);

/** Fond d'une carte : bannière de l'équipe si elle en a une, sinon un dégradé de sa couleur. */
export function TeamBackdrop({ team, strength = 0.5 }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {team.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.bannerUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" style={{ opacity: strength }} />
      ) : (
        <span className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 75% 30%, ${team.color}55, transparent 60%), linear-gradient(135deg, ${team.color}22, transparent 55%)` }} />
      )}
    </span>
  );
}

function Stat({ value, label, className }) {
  return (
    <span className={className}>
      <span className="block font-display text-2xl font-black leading-none">{value}</span>
      <span className="font-tech text-[9px] uppercase tracking-[0.3em] text-white/45">{label}</span>
    </span>
  );
}

/** Carte du podium : le n°1 en grande affiche, n°2 et n°3 plus petits ; bannière de l'équipe en fond. */
function PodiumCard({ team, index, info, mine }) {
  const metal = METALS[index];
  const big = index === 0;
  const winRate = rate(team);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: "spring", stiffness: 140, damping: 22 }, delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={big ? "sm:col-span-2" : ""}
    >
      <Link
        href={`/cod/equipes/${team.id}`}
        className={cn("group clip-tactical relative block overflow-hidden border-t-2 bg-ink-800 [--cut:18px]", big ? "min-h-[17rem] sm:min-h-[21rem]" : "min-h-[13rem]")}
        style={{ borderColor: metal.base }}
      >
        <TeamBackdrop team={team} strength={big ? 0.55 : 0.45} />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.75)_45%,rgba(10,10,10,0.25)_100%),linear-gradient(0deg,rgba(10,10,10,0.9),transparent_55%)]" />
        <span aria-hidden className="absolute inset-0 bg-grid opacity-20" />
        <span
          aria-hidden
          className={cn("absolute select-none font-display font-black leading-none text-transparent", big ? "-right-3 -top-8 text-[13rem] sm:text-[17rem]" : "-right-2 -top-6 text-[9rem]")}
          style={{ opacity: 0.5, WebkitTextStroke: `1.5px ${metal.base}` }}
        >
          {index + 1}
        </span>
        <span className={cn("relative flex h-full flex-col justify-end", big ? "p-6 sm:p-9" : "p-5 sm:p-6")}>
          <span className="flex flex-wrap items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em]" style={{ color: metal.light }}>
            {big ? <LuCrown aria-hidden className="h-4 w-4" /> : null}
            <span className="sr-only">Position </span>#{index + 1} · {metal.label}
            {info.move ? <Move value={info.move} /> : null}
          </span>
          <span className={cn("mt-3 flex items-center gap-4", big && "sm:gap-6")}>
            <span className={big ? "hidden sm:block" : "hidden"}>
              <TeamCrest team={team} size={96} />
            </span>
            <span className={big ? "sm:hidden" : ""}>
              <TeamCrest team={team} size={60} />
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate font-display font-black uppercase leading-[0.9] transition-colors group-hover:text-gold", big ? "text-4xl sm:text-7xl" : "text-3xl")}>{team.name}</span>
              <span className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-tech text-[11px] tracking-[0.2em]" style={{ color: team.color }}>
                  [{team.tag}]
                </span>
                {mine ? <span className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/70">Ton équipe</span> : null}
                {info.streak >= 2 ? (
                  <span className="inline-flex items-center gap-1 font-tech text-[11px] text-gold">
                    <LuFlame aria-hidden className="h-3.5 w-3.5" /> Série {info.streak}
                  </span>
                ) : null}
              </span>
            </span>
          </span>
          <span className={cn("flex flex-wrap items-end gap-y-3", big ? "mt-5 gap-x-8" : "mt-4 gap-x-6")}>
            <span>
              <span className={cn("block font-tech font-black tabular-nums leading-none", big ? "text-4xl sm:text-5xl" : "text-3xl")} style={{ color: metal.light, textShadow: `0 0 20px ${metal.base}88` }}>
                <CountUp value={team.points} delay={300 + index * 100} />
              </span>
              <span className="font-tech text-[9px] uppercase tracking-[0.3em] text-white/45">points</span>
            </span>
            <Stat
              label="V / D"
              value={
                <>
                  <span className="text-win">{team.wins}</span>
                  <span className="text-white/30"> / </span>
                  <span className="text-loss">{team.losses}</span>
                </>
              }
            />
            {big ? <Stat label="victoires" value={winRate === null ? "—" : `${winRate}%`} /> : null}
            <span className={big ? "" : "hidden sm:block"}>
              <FormChips form={info.form} />
              <span className="mt-1 block font-tech text-[9px] uppercase tracking-[0.3em] text-white/45">forme</span>
            </span>
          </span>
        </span>
      </Link>
    </motion.li>
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
  const { move, streak, form } = useStandingsHistory(teams, seasonStart);
  const deltas = useDeltas(teams);
  const podium = teams.slice(0, 3);
  const rows = teams.slice(3);
  const lastQualified = teams.findLastIndex((team) => team.position <= qualifiedSpots);
  const info = (team) => ({ move: move[team.id] ?? 0, streak: streak[team.id] ?? 0, form: form[team.id] ?? [] });

  return (
    <div>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {podium.map((team, index) => (
          <PodiumCard key={team.id} team={team} index={index} info={info(team)} mine={team.id === mineId} />
        ))}
      </ol>
      {lastQualified >= 0 && lastQualified < 2 && teams.length > lastQualified + 1 ? <QualificationLine spots={qualifiedSpots} /> : null}

      {rows.length > 0 ? (
        <div className="mt-10">
          <div className={cn("hidden gap-x-4 px-5 pb-3 font-tech text-[10px] uppercase tracking-[0.22em] text-white/40 lg:grid", COLS)}>
            <span>Rang</span>
            <span>Équipe</span>
            <span>Forme</span>
            <span>Victoires</span>
            <span className="text-right">Points</span>
          </div>
          <ol className="space-y-2">
            {rows.map((team, rowIndex) => {
              const index = rowIndex + 3;
              const isMine = team.id === mineId;
              const delay = 0.15 + rowIndex * 0.07;
              const delta = deltas[team.id];
              const details = info(team);
              const trophies = team.trophies?.length ?? 0;
              const winRate = rate(team);
              return (
                <motion.li
                  key={team.id}
                  layout
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ layout: { type: "spring", stiffness: 140, damping: 22 }, delay: 0.3 + rowIndex * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Link
                    href={`/cod/equipes/${team.id}`}
                    className={cn(
                      "group relative grid items-center gap-x-4 overflow-hidden px-4 py-3.5 transition duration-300 hover:-translate-y-0.5 sm:px-5 [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]",
                      COLS,
                      isMine ? "bg-gold/[0.08]" : "bg-white/[0.03]",
                    )}
                    style={{ backgroundImage: `linear-gradient(90deg, ${team.color}2e 0%, ${team.color}0d 28%, transparent 60%)` }}
                  >
                    {/* Liseré de la couleur de l'équipe */}
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: team.color, boxShadow: `0 0 12px ${team.color}` }} />
                    {/* Bannière de l'équipe, fondue vers la gauche */}
                    {team.bannerUrl ? (
                      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.16] transition-opacity duration-500 [mask-image:linear-gradient(to_left,black,transparent)] group-hover:opacity-35">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={team.bannerUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </span>
                    ) : null}
                    {/* Balayage lumineux au survol. */}
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[standings-sweep_0.9s_ease] group-hover:opacity-100" />

                    <span className="relative flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:gap-3">
                      <span className="font-display text-2xl font-black leading-none tabular-nums text-white/85 lg:text-4xl">{team.position}</span>
                      <Move value={details.move} />
                    </span>

                    <span className="relative flex min-w-0 items-center gap-3.5">
                      <TeamCrest team={team} size={46} />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-lg font-black uppercase leading-none tracking-wide transition-colors group-hover:text-gold lg:text-2xl">{team.name}</span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="font-tech text-[10px] tracking-[0.18em]" style={{ color: team.color }}>
                            [{team.tag}]
                          </span>
                          {isMine ? <span className="font-tech text-[9px] uppercase tracking-[0.18em] text-gold">Ton équipe</span> : null}
                          {qualified(team) ? <span className="border border-gold/60 px-1.5 py-px font-tech text-[8px] uppercase tracking-[0.18em] text-gold">Qualifiée</span> : null}
                          {team.recruiting ? (
                            <span className="inline-flex items-center gap-1 border border-win/50 px-1.5 py-px font-tech text-[8px] uppercase tracking-[0.18em] text-win">
                              <LuUserPlus aria-hidden className="h-3 w-3" /> Recrute
                            </span>
                          ) : null}
                          {trophies ? (
                            <span className="inline-flex items-center gap-1 font-tech text-[10px] text-gold" title={`${trophies} trophée${trophies > 1 ? "s" : ""}`}>
                              <LuTrophy aria-hidden className="h-3 w-3" /> {trophies}
                            </span>
                          ) : null}
                          {details.streak >= 3 ? (
                            <span className="inline-flex items-center gap-1 font-tech text-[10px] text-gold" title={`${details.streak} victoires de suite`}>
                              <LuFlame aria-hidden className="h-3 w-3" /> {details.streak}
                            </span>
                          ) : null}
                          <span className="lg:hidden">
                            <FormChips form={details.form} size="sm" />
                          </span>
                        </span>
                      </span>
                    </span>

                    <span className="relative hidden lg:block">
                      <FormChips form={details.form} />
                    </span>
                    <span className="relative hidden lg:block">
                      <span className="font-display text-lg font-black leading-none">
                        <span className="text-win">{team.wins}</span>
                        <span className="text-white/30"> / </span>
                        <span className="text-loss">{team.losses}</span>
                      </span>
                      <span className="mt-1 block font-tech text-[10px] text-white/45">{winRate === null ? "—" : `${winRate} %`}</span>
                    </span>
                    <span className="relative text-right">
                      <span className="font-tech text-xl font-black tabular-nums text-gold lg:text-2xl">
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
                      <span className="block font-tech text-[8px] uppercase tracking-[0.3em] text-white/35">pts</span>
                    </span>
                  </Link>
                  {index === lastQualified && index < teams.length - 1 ? <QualificationLine spots={qualifiedSpots} /> : null}
                </motion.li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function QualificationLine({ spots }) {
  return (
    <div className="relative my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/70" />
      <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Qualification · top {spots}</span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/70" />
    </div>
  );
}
