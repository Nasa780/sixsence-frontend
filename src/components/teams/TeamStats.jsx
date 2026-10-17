import { useEffect, useState } from "react";
import { LuFlame } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

/**
 * Statistiques d'une équipe, calculées depuis ses matchs d'équipe terminés (lecture publique) :
 * manches et maps gagnées, série en cours, maps les plus jouées avec leur taux de réussite.
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
      {stats.maps.length > 0 ? (
        <TacticalCard innerClassName="p-6">
          <Eyebrow>Maps les plus jouées</Eyebrow>
          <ul className="mt-4 space-y-3">
            {stats.maps.map((map) => (
              <li key={map.name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
                <span className="truncate font-display text-lg font-bold uppercase leading-none">{map.name}</span>
                <span className="flex h-2 bg-white/10" aria-hidden>
                  <span className="h-full bg-gold" style={{ width: `${map.rate}%` }} />
                </span>
                <span className="whitespace-nowrap font-tech text-xs text-white/60">
                  {map.won} / {map.played} · {map.rate} %
                </span>
              </li>
            ))}
          </ul>
        </TacticalCard>
      ) : null}
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
      .slice(0, 6),
  };
}
