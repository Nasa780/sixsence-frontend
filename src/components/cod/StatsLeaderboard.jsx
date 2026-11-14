import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { ButtonLink } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/Feedback";
import { SectionHeading } from "../ui/Typography";

const decimal = (value) => String(value).replace(".", ",");
export const STAT_BOARDS = [
  { key: "avgKills", tab: "Élim.", title: "Élim. par map", unit: "élim. par map", format: decimal },
  { key: "avgScore", tab: "Score", title: "Score par map", unit: "pts par map", format: (value) => value.toLocaleString("fr-FR") },
  { key: "avgObjectives", tab: "Poses + désam.", title: "Poses + désam.", unit: "par map", format: decimal },
];
const BOARDS = STAT_BOARDS;
const TOP = 20;
const PREVIEW_TOP = 5;

/** Joueurs du classement d'une stat, dans l'ordre (à égalité, le plus de maps d'abord). */
export const sortedBoard = (players, key) => [...players].sort((a, b) => b[key] - a[key] || b.maps - a.maps);

// Une seule lecture par minute pour toute la visite (MW4, profil, classements) : le backend garde aussi une minute.
let boardRequest = null;
let boardRequestAt = 0;
const loadBoard = () => {
  if (!boardRequest || Date.now() - boardRequestAt > 60_000) {
    boardRequestAt = Date.now();
    boardRequest = api("/cod/stats-leaderboard").catch((caught) => {
      boardRequest = null;
      throw caught;
    });
  }
  return boardRequest;
};

/** Classement des stats de la saison (GET /cod/stats-leaderboard) : null pendant la lecture. */
export function useStatsBoard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    loadBoard().then((result) => alive && setData(result), () => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

/** Classements des stats perso de la saison (GET /cod/stats-leaderboard), tous modes confondus, en moyenne par map. */
export function StatsLeaderboard({ currentUserId = null }) {
  const data = useStatsBoard();
  const [selected, setSelected] = useState(BOARDS[0].key);

  if (!data) return null;
  const board = BOARDS.find((item) => item.key === selected);
  const players = sortedBoard(data.players, selected).slice(0, TOP);

  return (
    <section aria-labelledby="titre-classement-stats">
      <SectionHeading eyebrow="Stats perso" title={<span id="titre-classement-stats">Classement des stats</span>} description={`En moyenne par map sur la saison, Classé, Division et tournois confondus, à partir de ${data.minMaps} maps enregistrées par capture.`} />
      <div role="tablist" aria-label="Classement affiché" className="mt-6 flex flex-wrap gap-2">
        {BOARDS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected === item.key}
            onClick={() => setSelected(item.key)}
            className={cn(
              "clip-slant px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors",
              selected === item.key ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.tab}
          </button>
        ))}
      </div>
      {players.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Pas encore de classement">Il apparaîtra dès qu&apos;un joueur aura {data.minMaps} maps enregistrées cette saison.</EmptyState>
        </div>
      ) : (
        <ol className="mt-6 space-y-2">
          {players.map((player, index) => (
            <li key={player.id}>
              <Link
                href={`/cod/profile/${player.id}`}
                className={cn("flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.07]", player.id === currentUserId ? "border-gold" : "border-white/15")}
              >
                <span className={cn("w-7 shrink-0 font-display text-xl font-black tabular-nums", index === 0 ? "text-gold" : "text-white/45")}>{index + 1}</span>
                <Avatar full src={player.avatarUrl} name={player.username} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{player.username}</span>
                  <span className="block text-xs tabular-nums text-white/45">{player.maps} maps</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-2xl font-black leading-none tabular-nums">{board.format(player[selected])}</span>
                  <span className="block text-[11px] text-white/45">{board.unit}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * Aperçu du classement des stats (MW4, file Classé, Division) : le top 5 de chaque stat côte à côte,
 * puis un lien vers le classement complet du classement des joueurs.
 */
export function StatsLeaderboardPreview({ currentUserId = null, label = null }) {
  const data = useStatsBoard();
  if (!data) return null;
  const empty = data.players.length === 0;

  return (
    <section aria-labelledby="titre-apercu-stats">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={label ? `${label} · Stats perso` : "Stats perso"}
          title={<span id="titre-apercu-stats">Classement des stats</span>}
          description={`Moyennes par map, Classé, Division et tournois confondus, dès ${data.minMaps} maps enregistrées par capture.`}
        />
        {empty ? null : (
          <ButtonLink href="/cod/leaderboard#stats" variant="outline">
            Voir tout le classement
          </ButtonLink>
        )}
      </div>
      {empty ? (
        <div className="mt-6">
          <EmptyState title="Pas encore de classement">
            Il apparaîtra dès qu&apos;un joueur aura {data.minMaps} maps enregistrées cette saison. Envoie la capture de fin de match depuis la feuille de match.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {BOARDS.map((board) => (
            <div key={board.key} className="min-w-0 border-t border-white/12 bg-white/[0.03] px-4 pb-3 pt-4">
              <h3 className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">{board.title}</h3>
              <ol className="mt-3 space-y-1">
                {sortedBoard(data.players, board.key)
                  .slice(0, PREVIEW_TOP)
                  .map((player, index) => (
                    <li key={player.id}>
                      <Link
                        href={`/cod/profile/${player.id}`}
                        className={cn("flex items-center gap-3 border-l-2 px-2 py-1.5 transition-colors hover:bg-white/[0.06]", player.id === currentUserId ? "border-gold" : "border-transparent")}
                      >
                        <span className={cn("w-5 shrink-0 font-display text-lg font-black tabular-nums", index === 0 ? "text-gold" : "text-white/45")}>{index + 1}</span>
                        <Avatar full src={player.avatarUrl} name={player.username} size={26} />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{player.username}</span>
                        <span className="shrink-0 font-display text-xl font-black leading-none tabular-nums">{board.format(player[board.key])}</span>
                      </Link>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
