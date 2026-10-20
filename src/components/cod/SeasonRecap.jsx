import { useEffect, useState } from "react";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { rankFor } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import { Chip } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { RankEmblem } from "./RankEmblem";

const MVP_BADGE = /^mvp-(\d{4})-(\d{2})$/;

/**
 * Récap des saisons terminées d'un joueur (lecture publique de season_results) : place finale, rang final
 * et pic de la saison, bilan, MVP du mois et matchs de Division joués pendant la saison. Rien tant
 * qu'aucune saison n'est terminée.
 */
export function SeasonRecap({ playerId, seasons, badges }) {
  const [recaps, setRecaps] = useState(null);
  // Clé stable : le tableau des badges change d'identité à chaque rendu du profil.
  const badgeKey = (badges ?? []).join(",");

  useEffect(() => {
    let alive = true;
    const closed = (seasons ?? []).filter((season) => !season.is_active);
    if (!playerId || closed.length === 0) {
      setRecaps([]);
      return undefined;
    }
    (async () => {
      const { data } = await supabase
        .from("season_results")
        .select("season_id, position, points, wins, losses, peak_points")
        .eq("user_id", playerId)
        .order("season_id", { ascending: false });
      const rows = data ?? [];
      const division = new Map();
      if (MATCH_TEAM_ENABLED && rows.length > 0) {
        const { data: matches } = await supabase
          .from("team_matches")
          .select("season_id, roster_a, roster_b, winner")
          .eq("status", "completed")
          .in(
            "season_id",
            rows.map((row) => row.season_id),
          )
          .or(`roster_a.cs.{${playerId}},roster_b.cs.{${playerId}}`);
        for (const match of matches ?? []) {
          const side = match.roster_a.includes(playerId) ? "A" : "B";
          const current = division.get(match.season_id) ?? { played: 0, wins: 0 };
          division.set(match.season_id, { played: current.played + 1, wins: current.wins + (match.winner === side ? 1 : 0) });
        }
      }
      const byId = new Map(closed.map((season) => [season.id, season]));
      const recapsOut = rows
        .filter((row) => byId.has(row.season_id))
        .map((row) => {
          const season = byId.get(row.season_id);
          const start = new Date(season.starts_at).getTime();
          const end = season.ends_at ? new Date(season.ends_at).getTime() : Date.now();
          // Badge « MVP du mois » attribué pour un mois de la saison.
          const mvp = badgeKey.split(",").filter((key) => {
            const match = MVP_BADGE.exec(key);
            if (!match) return false;
            const month = Date.UTC(Number(match[1]), Number(match[2]) - 1, 15);
            return month >= start && month <= end;
          }).length;
          return { ...row, season, mvp, division: division.get(row.season_id) ?? null };
        });
      if (alive) setRecaps(recapsOut);
    })().catch(() => alive && setRecaps([]));
    return () => {
      alive = false;
    };
  }, [playerId, seasons, badgeKey]);

  if (!recaps || recaps.length === 0) return null;

  return (
    <section aria-labelledby="titre-recap">
      <Eyebrow>Saisons passées</Eyebrow>
      <h2 id="titre-recap" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Récap de saison
      </h2>
      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        {recaps.map((recap) => {
          const final = rankFor(recap.points);
          const peak = rankFor(recap.peak_points ?? recap.points);
          const played = recap.wins + recap.losses;
          return (
            <li key={recap.season_id}>
              <TacticalCard highlight={recap.position <= 10} innerClassName="space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">{recap.season.name}</p>
                    <p className="mt-2 font-display text-5xl font-black leading-none tabular-nums">
                      <span className="text-gold-gradient">#{recap.position}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recap.position === 1 ? <Chip>Champion</Chip> : recap.position <= 10 ? <Chip>Top 10</Chip> : null}
                    {recap.mvp > 0 ? <Chip>MVP du mois{recap.mvp > 1 ? ` ×${recap.mvp}` : ""}</Chip> : null}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <RankLine label="Rang final" rank={final} points={recap.points} />
                  <RankLine label="Meilleur rang" rank={peak} points={recap.peak_points ?? recap.points} />
                </div>
                <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
                  <Stat label="Matchs" value={played} />
                  <Stat label="Victoires" value={recap.wins} />
                  <Stat label="Taux" value={played > 0 ? `${Math.round((recap.wins / played) * 100)} %` : "—"} />
                </dl>
                {recap.division ? (
                  <p className="text-sm text-white/55">
                    Division : {recap.division.played} match{recap.division.played > 1 ? "s" : ""}, {recap.division.wins} victoire{recap.division.wins > 1 ? "s" : ""}
                  </p>
                ) : null}
              </TacticalCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RankLine({ label, rank, points }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.03] px-3 py-3">
      <RankEmblem rank={rank} size={36} animated={false} />
      <div className="min-w-0">
        <p className="font-tech text-[9px] uppercase tracking-[0.22em] text-white/45">{label}</p>
        <p className="truncate font-display text-lg font-bold uppercase leading-none" style={{ color: rank.text }}>
          {rank.name}
        </p>
        <p className="mt-0.5 font-tech text-[11px] tabular-nums text-white/50">{points} pts</p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="font-tech text-[9px] uppercase tracking-[0.22em] text-white/45">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-black tabular-nums">{value}</dd>
    </div>
  );
}
