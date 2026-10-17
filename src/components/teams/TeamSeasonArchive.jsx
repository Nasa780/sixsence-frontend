import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCrown } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { EmptyState, Loading } from "../ui/Feedback";

/** Classement final des équipes d'une saison terminée (table team_season_results, lecture publique). */
export function TeamSeasonArchive({ season, myTeamId = null }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    supabase
      .from("team_season_results")
      .select("team_id, position, name, tag, points, wins, losses")
      .eq("season_id", season.id)
      .order("position", { ascending: true })
      .limit(200)
      .then(({ data }) => alive && setRows(data || []));
    return () => {
      alive = false;
    };
  }, [season.id]);

  if (rows === null) return <Loading label="Chargement des archives…" />;
  if (rows.length === 0) return <EmptyState title="Aucun résultat">Aucune équipe n&apos;a joué de match pendant cette saison.</EmptyState>;

  return (
    <div>
      <p className="mb-6 text-sm text-white/50">Classement final des équipes · {season.name}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-separate border-spacing-y-1.5 text-left">
          <caption className="sr-only">Classement final des équipes, {season.name}</caption>
          <thead>
            <tr className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">
              <th scope="col" className="w-16 px-4 py-2 font-medium">Rang</th>
              <th scope="col" className="px-4 py-2 font-medium">Équipe</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Points</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2 text-right font-medium">V / D</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mine = row.team_id === myTeamId;
              return (
                <tr key={row.team_id} className={cn("transition-colors", mine ? "bg-gold/10" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
                  <td className={cn("border-l-2 px-4 py-3 font-tech text-sm font-bold tabular-nums", row.position <= 3 ? "border-gold text-gold" : "border-transparent text-white/50")}>
                    <span className="inline-flex items-center gap-1.5">
                      {row.position === 1 ? <LuCrown aria-hidden className="h-4 w-4" /> : null}
                      {row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cod/equipes/${row.team_id}`} className="group">
                      <span className="font-display text-lg font-bold uppercase leading-none tracking-wide group-hover:text-gold">{row.name}</span>
                      <span className="ml-2 font-tech text-xs tracking-[0.16em] text-white/45">[{row.tag}]</span>
                      {mine ? <span className="ml-2 text-xs text-gold">· Ton équipe</span> : null}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-tech text-base font-bold tabular-nums text-gold">{row.points}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-white/70">
                    {row.wins} / {row.losses}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
