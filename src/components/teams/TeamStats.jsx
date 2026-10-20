import { useEffect, useState } from "react";
import { LuFlame } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

/**
 * Statistiques d'une équipe, calculées depuis ses matchs d'équipe terminés (lecture publique) :
 * manches et maps gagnées, série en cours, graphique des victoires et défaites par map.
 */
export function TeamStats({ teamId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from("team_matches")
      .select("team_a, team_b, winner, scores, maps, completed_at")
      .or(`team_a.eq.${teamId},team_b.eq.${teamId}`)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(500)
      .then(({ data }) => alive && setStats(compute(data || [], teamId)));
    return () => {
      alive = false;
    };
  }, [teamId]);

  if (!stats || stats.matches === 0) return null;
  return (
    <section aria-labelledby="titre-stats-equipe" className="space-y-6">
      <h2 id="titre-stats-equipe" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Statistiques
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Victoires" value={`${stats.winRate} %`} hint={`${stats.wins} sur ${stats.matches} match${stats.matches > 1 ? "s" : ""}`} accent />
        <StatTile label="Maps gagnées" value={`${stats.mapsWon} / ${stats.mapsPlayed}`} hint={`${stats.mapRate} %`} />
        <StatTile label="Manches gagnées" value={`${stats.roundRate} %`} hint={`${stats.roundsWon} sur ${stats.roundsPlayed}`} />
        <StatTile
          label="Série en cours"
          value={
            <span className={cn("inline-flex items-center gap-1.5", stats.streak.type === "V" ? "text-win" : "text-loss")}>
              {stats.streak.type === "V" && stats.streak.count >= 3 ? <LuFlame aria-hidden className="h-6 w-6" /> : null}
              {stats.streak.count} {stats.streak.type === "V" ? "V" : "D"}
            </span>
          }
          hint={stats.streak.type === "V" ? "victoire(s) d'affilée" : "défaite(s) d'affilée"}
        />
      </div>
      {stats.maps.length > 0 ? <MapResultsChart maps={stats.maps} /> : null}
    </section>
  );
}

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

function compute(matches, teamId) {
  let wins = 0;
  let mapsWon = 0;
  let mapsPlayed = 0;
  let roundsWon = 0;
  let roundsPlayed = 0;
  const byMap = new Map();
  for (const match of matches) {
    const side = match.team_a === teamId ? "A" : "B";
    if (match.winner === side) wins += 1;
    (match.scores || []).forEach(([a, b], index) => {
      const mine = side === "A" ? a : b;
      const theirs = side === "A" ? b : a;
      const won = mine > theirs;
      mapsPlayed += 1;
      roundsPlayed += a + b;
      roundsWon += mine;
      if (won) mapsWon += 1;
      const name = match.maps?.[index]?.map;
      if (name) {
        const entry = byMap.get(name) ?? { name, played: 0, won: 0 };
        entry.played += 1;
        if (won) entry.won += 1;
        byMap.set(name, entry);
      }
    });
  }
  // Série en cours : résultats consécutifs identiques depuis le dernier match.
  const results = matches.map((match) => (match.winner === (match.team_a === teamId ? "A" : "B") ? "V" : "D"));
  let count = 0;
  while (count < results.length && results[count] === results[0]) count += 1;
  return {
    matches: matches.length,
    wins,
    winRate: percent(wins, matches.length),
    mapsWon,
    mapsPlayed,
    mapRate: percent(mapsWon, mapsPlayed),
    roundsWon,
    roundsPlayed,
    roundRate: percent(roundsWon, roundsPlayed),
    streak: { type: results[0] ?? "V", count },
    maps: [...byMap.values()]
      .map((map) => ({ ...map, rate: percent(map.won, map.played) }))
      .sort((a, b) => b.played - a.played || b.rate - a.rate)
      .slice(0, 8),
  };
}

/**
 * Victoires et défaites par map (maps les plus jouées d'abord) : barres opposées autour d'un axe
 * central, victoires à droite, défaites à gauche, valeurs écrites au bout des barres.
 */
export function MapResultsChart({ maps }) {
  const max = Math.max(1, ...maps.map((map) => Math.max(map.won, map.played - map.won)));
  const [hover, setHover] = useState(null);
  return (
    <TacticalCard innerClassName="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Eyebrow>Victoires et défaites par map</Eyebrow>
        <p className="flex items-center gap-4 text-xs text-white/60" aria-hidden>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-loss" />
            Défaites
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-win" />
            Victoires
          </span>
        </p>
      </div>
      <ul className="mt-5 space-y-2.5">
        {maps.map((map) => {
          const lost = map.played - map.won;
          const active = hover === map.name;
          return (
            <li
              key={map.name}
              onMouseEnter={() => setHover(map.name)}
              onMouseLeave={() => setHover(null)}
              className={cn("grid grid-cols-[minmax(0,1fr)_minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-3 py-0.5 transition-opacity sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_minmax(0,1fr)]", hover && !active && "opacity-50")}
              aria-label={`${map.name} : ${map.won} victoire${map.won > 1 ? "s" : ""}, ${lost} défaite${lost > 1 ? "s" : ""}, ${map.rate} %`}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-tech text-xs tabular-nums text-white/60">{lost || ""}</span>
                <span className="h-3 rounded-l-[4px] bg-loss/85" style={{ width: `${(lost / max) * 100}%` }} />
              </div>
              <div className="text-center">
                <p className="truncate font-display text-base font-bold uppercase leading-none">{map.name}</p>
                <p className={cn("mt-0.5 font-tech text-[10px] tabular-nums", active ? "text-white/80" : "text-white/40")}>
                  {map.played} jouée{map.played > 1 ? "s" : ""} · {map.rate} %
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-r-[4px] bg-win/85" style={{ width: `${(map.won / max) * 100}%` }} />
                <span className="font-tech text-xs tabular-nums text-white/60">{map.won || ""}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </TacticalCard>
  );
}
