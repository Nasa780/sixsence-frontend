import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCrown } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { rankFor } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import { EmptyState, Loading } from "../ui/Feedback";

/** Classement final d'une saison terminée (table season_results, lecture publique). */
export function SeasonArchive({ season, currentUserId = null }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    supabase
      .from("season_results")
      .select("user_id, position, username, points, wins, losses")
      .eq("season_id", season.id)
      .order("position", { ascending: true })
      .limit(200)
      .then(({ data }) => alive && setRows(data || []));
    return () => {
      alive = false;
    };
  }, [season.id]);

  if (rows === null) return <Loading label="Chargement des archives…" />;
  if (rows.length === 0) return <EmptyState title="Aucun résultat">Personne n&apos;a joué de match classé pendant cette saison.</EmptyState>;

  const period = [season.starts_at, season.ends_at]
    .filter(Boolean)
    .map((date) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))
    .join(" — ");

  return (
    <div>
      <p className="mb-6 text-sm text-white/50">
        Classement final de la {season.name}
        {period ? ` · ${period}` : ""}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-separate border-spacing-y-1.5 text-left">
          <caption className="sr-only">Classement final — {season.name}</caption>
          <thead>
            <tr className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">
              <th scope="col" className="w-16 px-4 py-2 font-medium">Rang</th>
              <th scope="col" className="px-4 py-2 font-medium">Joueur</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Points</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2 text-right font-medium">V / D</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isMe = row.user_id === currentUserId;
              return (
                <tr key={row.user_id} className={cn(isMe ? "bg-gold/10" : "bg-white/[0.03]")}>
                  <td className={cn("border-l-2 px-4 py-3 font-tech text-sm font-bold tabular-nums", row.position === 1 ? "border-gold text-gold" : "border-transparent text-white/50")}>
                    {row.position === 1 ? <LuCrown aria-label="Champion" className="h-4 w-4" /> : row.position}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cod/profile/${row.user_id}`} className="font-display text-lg font-bold uppercase tracking-wide hover:text-gold">
                      {row.username}
                      {isMe ? <span className="ml-2 text-xs text-gold">· Toi</span> : null}
                    </Link>
                    <span className="mt-0.5 block text-xs text-white/40">{rankFor(row.points).name}</span>
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
