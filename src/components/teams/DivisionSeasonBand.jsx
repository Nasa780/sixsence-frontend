import { useEffect, useState } from "react";
import { CountUp } from "../effects/CountUp";
import { TeamCrest } from "./TeamParts";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";

/**
 * Bandeau de la saison de Division (2026-11-13, gardé de côté : `SHOW_SEASON_BAND` dans pages/cod/equipes) :
 * équipes en lice, matchs joués depuis le début de la saison, l'équipe en tête, équipes qui recrutent.
 */
export function DivisionSeasonBand({ teams, seasonStart = null }) {
  const [played, setPlayed] = useState(null);
  useEffect(() => {
    let query = supabase.from("team_matches").select("id", { count: "exact", head: true }).eq("status", "completed");
    if (seasonStart) query = query.gte("completed_at", seasonStart);
    query.then(({ count }) => setPlayed(count ?? 0));
  }, [seasonStart]);

  const leader = teams[0];
  const tiles = [
    { label: "Équipes en lice", value: <CountUp value={teams.length} /> },
    { label: "Matchs joués", value: played === null ? "—" : <CountUp value={played} /> },
    {
      label: "En tête",
      value: leader ? (
        <span className="flex items-center gap-2.5">
          <TeamCrest team={leader} size={30} />
          <span className="truncate">{leader.name}</span>
        </span>
      ) : (
        "—"
      ),
    },
    { label: "Recrutent", value: <CountUp value={teams.filter((team) => team.recruiting).length} />, accent: true },
  ];
  return (
    <div className="mb-10 grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="relative bg-ink-800 px-5 py-4">
          <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-linear-to-b from-gold/70 to-transparent" />
          <p className="font-tech text-[9px] uppercase tracking-[0.28em] text-white/45">{tile.label}</p>
          <div className={cn("mt-2 min-w-0 font-display text-2xl font-black uppercase leading-none sm:text-3xl", tile.accent && "text-win")}>{tile.value}</div>
        </div>
      ))}
    </div>
  );
}
