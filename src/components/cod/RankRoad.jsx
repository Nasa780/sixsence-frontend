import { cn } from "../../lib/cn";
import { RANKS, rankFor, rankGradient } from "../../lib/ranks";
import { RankEmblem } from "./RankEmblem";

const LADDER = [...RANKS].reverse(); // de Bronze à Légende

/**
 * Position du joueur sur la frise, de 0 (Bronze) à 1 (Légende) : les 9 rangs sont
 * régulièrement espacés et la position avance entre deux rangs selon les points.
 */
function ladderPosition(points) {
  const index = LADDER.findIndex((rank) => rank.name === rankFor(points).name);
  const next = LADDER[index + 1];
  const within = next ? Math.min(1, (points - LADDER[index].min) / (next.min - LADDER[index].min)) : 0;
  return (index + within) / (LADDER.length - 1);
}

/**
 * Frise « Road to Légende » : les 9 emblèmes reliés par une ligne qui se remplit
 * jusqu'aux points du joueur ; les rangs à venir sont grisés.
 */
export function RankRoad({ points = 0, className = "" }) {
  const current = rankFor(points);
  const index = LADDER.findIndex((rank) => rank.name === current.name);
  const next = LADDER[index + 1] ?? null;
  const position = ladderPosition(points);
  // La ligne relie le centre du premier emblème à celui du dernier (marges de 18 px).
  const at = (ratio) => `calc(18px + (100% - 36px) * ${ratio})`;

  return (
    <div className={className}>
      <div className="relative" role="img" aria-label={`Progression : ${current.name}, ${points} points${next ? `, ${next.min - points} points avant ${next.name}` : ""}.`}>
        <div aria-hidden className="absolute top-[17px] h-1 -translate-y-1/2 bg-white/10" style={{ left: 18, right: 18 }} />
        <div
          aria-hidden
          className="absolute top-[17px] h-1 -translate-y-1/2"
          style={{ left: 18, width: `calc((100% - 36px) * ${position})`, backgroundImage: rankGradient(current, 90), boxShadow: `0 0 8px ${current.color}88` }}
        />
        <ol className="relative flex justify-between">
          {LADDER.map((rank, i) => {
            const reached = i <= index;
            return (
              <li key={rank.name} className="flex w-9 justify-center" title={`${rank.name} · ${rank.min} pts`}>
                <span className={cn("transition-[filter,opacity]", !reached && "opacity-35 grayscale")}>
                  <RankEmblem rank={rank} size={i === index ? 36 : 30} animated={i === index} />
                </span>
              </li>
            );
          })}
        </ol>
        {/* Repère du joueur */}
        <span aria-hidden className="absolute top-[42px] flex -translate-x-1/2 flex-col items-center" style={{ left: at(position) }}>
          <span className="h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent" style={{ borderBottomColor: current.color }} />
          <span className="mt-0.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: current.text }}>
            Toi
          </span>
        </span>
      </div>
      <p className="mt-11 text-xs text-white/55">
        {next ? (
          <>
            <span className="font-bold" style={{ color: next.text }}>
              {next.min - points} pts
            </span>{" "}
            avant {next.name}
            {next.name !== "Légende" ? <span className="text-white/35"> · Légende à 3 000</span> : null}
          </>
        ) : (
          <span style={{ color: current.text }}>Rang maximal atteint : tu es une Légende.</span>
        )}
      </p>
    </div>
  );
}
