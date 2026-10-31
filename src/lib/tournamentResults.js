/**
 * Résultats d'un tournoi calculés depuis son tableau (bracketMatches de components/tournament/BracketBoard) :
 * bilan de chaque équipe (matchs, victoires, défaites, maps), place finale (champion, finaliste, 3e) ou tour
 * de l'élimination, et chiffres du tournoi (onglets Participants et Statistiques de la fiche).
 */

const PLACE_LABEL = { 1: "Champion", 2: "Finaliste", 3: "3e place" };

/** Une défaite élimine-t-elle ? Élimination simple : toujours ; double : tableau des perdants et grande finale. */
const eliminating = (match, double) => !double || match.bracket === "L" || match.bracket === "G";

export function teamResults(tournament, matches) {
  const double = tournament.bracket === "double";
  const rows = new Map();
  const row = (team) => {
    if (!team) return null;
    if (!rows.has(team.id)) rows.set(team.id, { team, played: 0, wins: 0, losses: 0, mapsFor: 0, mapsAgainst: 0, place: null, out: null, live: false });
    return rows.get(team.id);
  };
  (tournament.teams ?? []).forEach((team) => row(team));
  (tournament.squads ?? []).forEach((squad) => row(squad.team));

  for (const match of matches) {
    const { entry } = match;
    const a = row(entry.teamA), b = row(entry.teamB);
    if (entry.status === "playing") [a, b].forEach((r) => r && (r.live = true));
    if (entry.status !== "done" || !a || !b || !entry.winner) continue;
    const [sa, sb] = entry.score ?? [0, 0];
    a.played += 1; b.played += 1;
    a.mapsFor += sa ?? 0; a.mapsAgainst += sb ?? 0;
    b.mapsFor += sb ?? 0; b.mapsAgainst += sa ?? 0;
    const [winner, loser] = entry.winner === entry.teamA.id ? [a, b] : [b, a];
    winner.wins += 1;
    loser.losses += 1;
    if (eliminating(match, double) && match.bracket !== "T") loser.out = match.roundName;
  }

  // Podium : dernière rencontre (grande finale ou finale), puis 3e (petite finale ou finale des perdants).
  const last = [...matches].reverse().find((m) => m.bracket === "G" || (m.bracket === "W" && !double && m.round === tournament.rounds.length));
  if (last?.entry.status === "done" && last.entry.winner) {
    const { teamA, teamB, winner } = last.entry;
    row(winner === teamA?.id ? teamA : teamB).place = 1;
    const second = winner === teamA?.id ? teamB : teamA;
    if (second) row(second).place = 2;
  }
  const third = double
    ? (() => {
        const lbFinal = matches.find((m) => m.bracket === "L" && m.round === (tournament.losers?.length ?? 0));
        const e = lbFinal?.entry;
        return e?.status === "done" && e.teamA && e.teamB ? (e.winner === e.teamA.id ? e.teamB : e.teamA) : null;
      })()
    : (() => {
        const e = matches.find((m) => m.bracket === "T")?.entry;
        return e?.status === "done" && e.winner ? [e.teamA, e.teamB].find((t) => t?.id === e.winner) : null;
      })();
  if (third && !row(third).place) row(third).place = 3;

  const list = [...rows.values()].map((r) => ({
    ...r,
    result: r.place ? PLACE_LABEL[r.place] : r.out ? `Éliminée · ${r.out}` : r.played || r.live ? "En lice" : null,
  }));
  // Tri : podium, puis les plus loin dans le tournoi (plus de victoires), puis l'écart de maps.
  list.sort((x, y) => (x.place ?? 9) - (y.place ?? 9) || y.wins - x.wins || x.losses - y.losses || y.mapsFor - y.mapsAgainst - (x.mapsFor - x.mapsAgainst));
  return list;
}

/** Chiffres du tournoi : matchs joués, maps, victoires sèches, séries décisives, décisions de l'équipe. */
export function tournamentStats(matches) {
  const played = matches.filter((m) => m.entry.status === "done" && m.entry.teamA && m.entry.teamB);
  const maps = played.reduce((n, m) => n + (m.entry.score ? m.entry.score[0] + m.entry.score[1] : 0), 0);
  const sweeps = played.filter((m) => m.bestOf > 1 && m.entry.score && Math.min(...m.entry.score) === 0).length;
  const deciders = played.filter((m) => m.bestOf > 1 && m.entry.score && m.entry.score[0] + m.entry.score[1] === m.bestOf).length;
  const decided = played.filter((m) => m.entry.decided).length;
  return { total: matches.length, played: played.length, live: matches.filter((m) => m.entry.status === "playing").length, maps, sweeps, deciders, decided };
}
