import { useEffect, useState } from "react";
import { LuClock, LuLock } from "react-icons/lu";
import useSeasons from "../../hooks/useSeasons";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

const DAY = 86_400_000;
/** Transferts verrouillés pendant les 7 derniers jours de la saison (TEAM_TRANSFER_LOCK_DAYS du backend). */
const TRANSFER_LOCK_DAYS = 7;
const pad = (n) => String(n).padStart(2, "0");

/**
 * Bandeau de saison en tête des classements : compte à rebours jusqu'à la fin prévue (seasons.ends_at, fixée dans
 * l'admin), matchs joués dans la saison, et en Division le verrouillage des transferts. Couleur du mode (data-univers
 * de la page). Rouge et pulsé les 3 derniers jours. Sans date de fin : seulement les matchs joués.
 */
export function SeasonCountdown({ mode = "classe" }) {
  const { active, label } = useSeasons();
  const [now, setNow] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!active?.starts_at) return;
    let alive = true;
    supabase
      .from(mode === "division" ? "team_matches" : "cod_matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", active.starts_at)
      .then(({ count }) => alive && setMatches(count ?? 0));
    return () => {
      alive = false;
    };
  }, [active?.starts_at, mode]);

  if (!active || now === null) return null;
  const end = active.ends_at ? new Date(active.ends_at).getTime() : null;
  const left = end ? Math.max(0, end - now) : null;
  const urgent = left !== null && left < 3 * DAY;
  const lockAt = end ? end - TRANSFER_LOCK_DAYS * DAY : null;
  const parts = left === null ? null : [
    [Math.floor(left / DAY), left >= 2 * DAY ? "jours" : "jour"],
    [pad(Math.floor((left % DAY) / 3_600_000)), "h"],
    [pad(Math.floor((left % 3_600_000) / 60_000)), "min"],
  ];

  return (
    <div className={cn("clip-tactical relative mb-8 overflow-hidden border bg-white/[0.02] [--cut:16px]", urgent ? "border-loss/60" : "border-gold/35")}>
      <div aria-hidden className={cn("absolute inset-y-0 left-0 w-1", urgent ? "animate-pulse bg-loss" : "bg-gold")} />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
        <div>
          <p className={cn("font-tech text-[10px] uppercase tracking-[0.24em]", urgent ? "text-loss" : "text-gold")}>
            {mode === "division" ? "Division" : "Classé"} · {label}
          </p>
          <p className="mt-1 font-display text-2xl font-black uppercase leading-none">{parts ? (left > 0 ? "Fin de saison dans" : "Saison terminée") : "Saison en cours"}</p>
        </div>
        {parts && left > 0 ? (
          <div className="flex gap-2" role="timer" aria-label={`Fin de saison dans ${parts.map(([v, u]) => `${v} ${u}`).join(" ")}`}>
            {parts.map(([value, unit]) => (
              <div key={unit} className={cn("min-w-14 border bg-ink/60 px-2 py-1.5 text-center", urgent ? "border-loss/50" : "border-white/10")}>
                <p className={cn("font-tech text-2xl font-black tabular-nums leading-none", urgent && "text-loss")}>{value}</p>
                <p className="mt-1 font-tech text-[9px] uppercase tracking-[0.2em] text-white/40">{unit}</p>
              </div>
            ))}
          </div>
        ) : null}
        {matches !== null ? (
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Matchs joués cette saison</p>
            <p className="font-display text-3xl font-black leading-none tabular-nums">{matches.toLocaleString("fr-FR")}</p>
          </div>
        ) : null}
        {end ? (
          <p className="inline-flex items-center gap-2 text-xs text-white/50 sm:ml-auto">
            <LuClock aria-hidden className="h-4 w-4" />
            Clôture le {new Date(end).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </p>
        ) : null}
      </div>
      {mode === "division" && lockAt && left > 0 ? (
        <p className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] px-6 py-2 text-xs text-white/55">
          <LuLock aria-hidden className="h-3.5 w-3.5 text-gold" />
          {now >= lockAt
            ? "Transferts verrouillés jusqu'à la fin de la saison."
            : `Transferts verrouillés dans ${Math.ceil((lockAt - now) / DAY)} jour${Math.ceil((lockAt - now) / DAY) > 1 ? "s" : ""} (${TRANSFER_LOCK_DAYS} derniers jours de la saison).`}
        </p>
      ) : null}
    </div>
  );
}
