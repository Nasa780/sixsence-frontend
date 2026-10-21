/**
 * Performance d'un joueur sur la saison, à partir de son historique de matchs
 * (cod_matches.points_changes : variation de points de chaque joueur).
 *
 * La courbe est reconstruite à rebours depuis ses points actuels : le dernier point
 * est toujours exact, même si un admin a corrigé des points entre-temps.
 */

/**
 * Matchs terminés de la saison, du plus ancien au plus récent, avec les points après
 * chaque match : [{ id, points, delta, won, map, format, date }].
 * start : points avant le premier de ces matchs.
 */
export function buildSeries({ history, userId, points, seasonId = null }) {
  const done = history
    .filter((match) => match.status === "completed" && (seasonId === null || match.season_id === seasonId))
    .sort((a, b) => new Date(a.completed_at ?? a.created_at) - new Date(b.completed_at ?? b.created_at));

  const entries = [];
  let after = points;
  for (let index = done.length - 1; index >= 0; index -= 1) {
    const match = done[index];
    const delta = match.points_changes?.[userId] ?? 0;
    const team = match.team_a.includes(userId) ? "A" : "B";
    entries.unshift({
      id: match.id,
      points: Math.max(0, after),
      delta,
      won: match.winner === team,
      map: match.map,
      format: match.format ?? `${match.team_size}v${match.team_size}`,
      date: match.completed_at ?? match.created_at,
    });
    after -= delta;
  }
  return { start: Math.max(0, after), entries };
}

/** Chiffres clés d'une portion de la courbe. */
export function summarize(start, entries) {
  if (entries.length === 0) return null;
  const values = entries.map((entry) => entry.points);
  // Bonus (points de coupe) : sur la courbe, mais ni victoire ni défaite.
  const played = entries.filter((entry) => !entry.bonus);
  const wins = played.filter((entry) => entry.won).length;
  const losses = played.length - wins;
  const last = entries[entries.length - 1].points;
  const peak = Math.max(start, ...values);
  return {
    change: last - start,
    peak,
    low: Math.min(start, ...values),
    wins,
    losses,
    ratio: losses === 0 ? null : wins / losses,
    form: played.slice(-10).map((entry) => entry.won),
  };
}
