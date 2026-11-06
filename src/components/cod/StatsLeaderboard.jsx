import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/Feedback";
import { SectionHeading } from "../ui/Typography";

const decimal = (value) => String(value).replace(".", ",");
const BOARDS = [
  { key: "avgKills", tab: "Élim.", unit: "élim. par map", format: decimal },
  { key: "avgScore", tab: "Score", unit: "pts par map", format: (value) => value.toLocaleString("fr-FR") },
  { key: "avgObjectives", tab: "Poses + désam.", unit: "par map", format: decimal },
];
const TOP = 20;

/** Classements des stats perso de la saison (GET /cod/stats-leaderboard), tous modes confondus, en moyenne par map. */
export function StatsLeaderboard({ currentUserId = null, initial = null }) {
  const [data, setData] = useState(initial);
  const [selected, setSelected] = useState(BOARDS[0].key);

  useEffect(() => {
    if (initial) return undefined;
    let alive = true;
    api("/cod/stats-leaderboard").then((result) => alive && setData(result), () => {});
    return () => {
      alive = false;
    };
  }, [initial]);

  if (!data) return null;
  const board = BOARDS.find((item) => item.key === selected);
  const players = [...data.players].sort((a, b) => b[selected] - a[selected] || b.maps - a.maps).slice(0, TOP);

  return (
    <section aria-labelledby="titre-classement-stats">
      <SectionHeading eyebrow="Stats perso" title={<span id="titre-classement-stats">Classement des stats</span>} description={`En moyenne par map sur la saison, tous modes confondus, à partir de ${data.minMaps} maps enregistrées par capture.`} />
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
