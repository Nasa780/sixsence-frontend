/** Ligues de la Division (mêmes clés que backend/src/services/leaguePolicy.ts), actives dès 16 équipes. */
export const LEAGUES = [
  { key: "elite", label: "Élite", color: "#e7c05a" },
  { key: "ligue1", label: "Ligue 1", color: "#cfd5dc" },
  { key: "ligue2", label: "Ligue 2", color: "#d6935a" },
];
export const LEAGUES_MIN_TEAMS = 16;
export const leagueOf = (key) => LEAGUES.find((league) => league.key === key) ?? null;
