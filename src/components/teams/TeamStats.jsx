import { useEffect, useMemo, useState } from "react";
import { LuFlame } from "react-icons/lu";
import useSeasons from "../../hooks/useSeasons";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { PerformancePanel } from "../cod/PerformancePanel";
import { StatTile } from "../ui/Feedback";

/**
 * Statistiques d'une équipe sur la saison, comme le profil d'un joueur (sans l'XP) : matchs, victoires,
 * défaites, taux de victoire, série en cours et record, victoires écrasantes (2-0), puis le panneau
 * « Performance » (courbe des points, chiffres clés, forme). Calculées depuis les matchs terminés (lecture publique).
 */
export function TeamStats({ teamId, points = null, position = null }) {
  const { active, label } = useSeasons();
  const seasonStart = active?.starts_at ?? null;
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    let alive = true;
    let query = supabase
      .from("team_matches")
      .select("id, team_a, team_b, winner, scores, points_changes, forfeit, completed_at")
      .or(`team_a.eq.${teamId},team_b.eq.${teamId}`)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(500);
    if (seasonStart) query = query.gte("completed_at", seasonStart);
    query.then(async ({ data }) => {
      const rows = data || [];
      // Tags des adversaires, pour le détail des matchs sur la courbe.
      const ids = [...new Set(rows.map((row) => (row.team_a === teamId ? row.team_b : row.team_a)))];
      const { data: teams } = ids.length ? await supabase.from("teams").select("id, tag").in("id", ids) : { data: [] };
      const tags = new Map((teams || []).map((team) => [team.id, team.tag]));
      if (alive) setMatches(rows.map((row) => ({ ...row, opponentTag: tags.get(row.team_a === teamId ? row.team_b : row.team_a) ?? "?" })));
    });
    return () => {
      alive = false;
    };
  }, [teamId, seasonStart]);

  const stats = useMemo(() => (matches ? compute(matches, teamId) : null), [matches, teamId]);
  const series = useMemo(() => (matches && typeof points === "number" ? buildTeamSeries(matches, teamId, points) : null), [matches, teamId, points]);

  if (!stats || stats.matches === 0) return null;
  return (
    <section aria-labelledby="titre-stats-equipe" className="space-y-6">
      <h2 id="titre-stats-equipe" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Statistiques
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Matchs" value={stats.matches} />
        <StatTile label="Victoires" value={stats.wins} accent />
        <StatTile label="Défaites" value={stats.losses} />
        <StatTile label="Taux de victoire" value={`${stats.winRate}%`} />
        <StatTile
          label="Série en cours"
          value={
            <span className={cn("inline-flex items-center gap-1.5", stats.streak.type === "V" ? "text-win" : "text-loss")}>
              {stats.streak.type === "V" && stats.streak.count >= 3 ? <LuFlame aria-hidden className="h-6 w-6" /> : null}
              {stats.streak.count} {stats.streak.type}
            </span>
          }
          hint={`Record : ${stats.bestStreak} V`}
        />
        <StatTile
          label="Victoires écrasantes"
          value={stats.playedWins ? `${stats.sweepRate}%` : "—"}
          hint={stats.playedWins ? `${stats.sweeps} sur ${stats.playedWins} (2-0)` : "Victoires 2-0"}
        />
      </div>
      {series ? (
        <PerformancePanel
          series={series}
          seasonLabel={label}
          eyebrow={`${label} · Division`}
          ranks={false}
          pointsHint={position ? `#${position} au classement` : "Points d'équipe"}
          emptyText="La courbe, la forme et les chiffres clés apparaîtront après le premier match de Division."
        />
      ) : null}
    </section>
  );
}

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

function sideOf(match, teamId) {
  return match.team_a === teamId ? "A" : "B";
}

/** Courbe des points de l'équipe sur la saison, reconstruite à rebours depuis ses points actuels. */
function buildTeamSeries(matches, teamId, points) {
  const done = [...matches].sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
  const entries = [];
  let after = points;
  for (let index = done.length - 1; index >= 0; index -= 1) {
    const match = done[index];
    const side = sideOf(match, teamId);
    const delta = match.points_changes?.[side] ?? 0;
    const [mine, theirs] = mapsOf(match, side);
    entries.unshift({
      id: match.id,
      points: after,
      delta,
      won: match.winner === side,
      map: `vs [${match.opponentTag}]`,
      format: match.forfeit ? "forfait" : `${mine}-${theirs}`,
      date: match.completed_at,
    });
    after -= delta;
  }
  return { start: after, entries };
}

function mapsOf(match, side) {
  let mine = 0;
  let theirs = 0;
  for (const [a, b] of match.scores || []) {
    if ((side === "A" ? a : b) > (side === "A" ? b : a)) mine += 1;
    else theirs += 1;
  }
  return [mine, theirs];
}

function compute(matches, teamId) {
  let wins = 0;
  let playedWins = 0;
  let sweeps = 0;
  for (const match of matches) {
    const side = sideOf(match, teamId);
    if (match.winner !== side) continue;
    wins += 1;
    if (match.forfeit) continue;
    playedWins += 1;
    if (mapsOf(match, side)[1] === 0) sweeps += 1;
  }
  // Série en cours (du plus récent au plus ancien) et record de victoires d'affilée.
  const results = matches.map((match) => (match.winner === sideOf(match, teamId) ? "V" : "D"));
  let count = 0;
  while (count < results.length && results[count] === results[0]) count += 1;
  let bestStreak = 0;
  let run = 0;
  for (const result of [...results].reverse()) {
    run = result === "V" ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }
  return {
    matches: matches.length,
    wins,
    losses: matches.length - wins,
    winRate: percent(wins, matches.length),
    streak: { type: results[0] ?? "V", count },
    bestStreak,
    playedWins,
    sweeps,
    sweepRate: percent(sweeps, playedWins),
  };
}
