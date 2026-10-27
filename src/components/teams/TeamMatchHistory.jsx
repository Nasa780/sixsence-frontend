import Link from "next/link";
import { cn } from "../../lib/cn";
import { MAPS } from "../../lib/maps";
import { Chip } from "../ui/Feedback";
import { TeamCrest } from "./TeamParts";

const dateShort = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const mapName = (map) => MAPS.find((m) => m.id === map)?.name ?? map ?? "Map";

/** Score de chaque map jouée (« Lotus 6-3 ») en pastilles vertes ou rouges ; rien pour un forfait. */
export function MapScoreChips({ scores, className = "" }) {
  if (!scores?.length) return null;
  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {scores.map((score, index) => (
        <span
          key={index}
          className={cn("inline-flex items-center gap-1 border px-1.5 py-px text-[11px] leading-4", score.for > score.against ? "border-win/40 bg-win/10" : "border-loss/40 bg-loss/10")}
        >
          <span className="text-white/60">{mapName(score.map)}</span>
          <span className="font-tech font-bold tabular-nums text-white">
            {score.for}-{score.against}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Derniers matchs de Division d'une équipe (GET /teams/:id/matches) : résultat, adversaire, maps,
 * points d'équipe, forfait. Partagé par la fiche d'équipe et « Mon équipe ».
 */
export function TeamMatchHistory({ history, limit = null }) {
  if (history === null) return <p className="mt-4 text-sm text-white/45">Chargement…</p>;
  if (history.length === 0) return <p className="mt-4 text-sm text-white/45">Aucun match d&apos;équipe pour l&apos;instant.</p>;
  const rows = limit ? history.slice(0, limit) : history;
  return (
    <ul className="mt-4 space-y-2">
      {rows.map((match) => {
        const done = match.status === "completed";
        const cancelled = match.status === "cancelled";
        const tone = done ? (match.won ? "win" : "loss") : cancelled ? "neutral" : "gold";
        return (
          <li key={match.id}>
            <Link
              href={`/cod/equipes/match/${match.id}`}
              className={cn(
                "flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.07] sm:gap-4 sm:px-4",
                tone === "win" ? "border-win" : tone === "loss" ? "border-loss" : tone === "gold" ? "border-gold" : "border-white/15",
              )}
            >
              <Chip tone={tone} className="hidden w-24 shrink-0 justify-center sm:inline-flex">
                {done ? (match.won ? "Victoire" : "Défaite") : cancelled ? "Annulé" : "En cours"}
              </Chip>
              <TeamCrest team={match.opponent} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold uppercase leading-none tracking-wide">
                  <span className="text-white/40">vs</span> {match.opponent?.name ?? "Équipe"}
                </p>
                <p className="mt-1 truncate text-xs text-white/45">
                  [{match.opponent?.tag ?? "?"}] · {dateShort(match.date)}
                  {match.forfeit ? " · par forfait" : ""}
                  {match.tournament ? " · Tournoi" : ""}
                </p>
                {!match.forfeit ? <MapScoreChips scores={match.mapScores} className="mt-1.5" /> : null}
              </div>
              {done ? (
                <div className="shrink-0 text-right">
                  <p className={cn("font-display text-2xl font-black leading-none tabular-nums", match.won ? "text-win" : "text-loss")}>
                    {match.forfeit ? "FF" : `${match.mapsFor} – ${match.mapsAgainst}`}
                  </p>
                  {typeof match.points === "number" ? (
                    <p className={cn("mt-1 font-tech text-xs font-bold tabular-nums", match.points >= 0 ? "text-win" : "text-loss")}>
                      {match.points >= 0 ? `+${match.points}` : match.points} pts
                    </p>
                  ) : null}
                </div>
              ) : !cancelled ? (
                <span className="shrink-0 font-tech text-[10px] uppercase tracking-[0.2em] text-gold">En cours</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
