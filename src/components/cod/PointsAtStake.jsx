import { LuFlame, LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { PLACEMENT_MATCHES } from "../../lib/ranks";

/**
 * Points en jeu pour un joueur, avant le match : « Victoire +35 · Défaite −9 »,
 * avec le match de placement s'il y a lieu (victoire doublée).
 * stake : { win, loss, bonus, placement } renvoyé par le backend (cod_points_preview).
 */
export function PointsAtStake({ stake, className = "", centered = false }) {
  if (!stake) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", centered && "justify-center", className)}>
      <span className="clip-slant inline-flex items-center gap-1.5 bg-win/15 px-3.5 py-1.5 font-display text-lg font-black uppercase tracking-wide text-win">
        <LuTrendingUp aria-hidden className="h-4 w-4" />
        Victoire +{stake.win}
      </span>
      <span className="clip-slant inline-flex items-center gap-1.5 bg-loss/15 px-3.5 py-1.5 font-display text-lg font-black uppercase tracking-wide text-loss">
        <LuTrendingDown aria-hidden className="h-4 w-4" />
        Défaite {stake.loss > 0 ? `−${stake.loss}` : "±0"}
      </span>
      {stake.placement ? (
        <span
          className="inline-flex items-center border border-gold/50 px-2.5 py-1 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-gold"
          title={`Pendant les ${PLACEMENT_MATCHES} premiers matchs de la saison, les victoires comptent double`}
        >
          Placement {stake.placement}/{PLACEMENT_MATCHES} · victoire ×2
        </span>
      ) : null}
      {stake.bonus > 0 ? (
        <span className="inline-flex items-center gap-1 border border-gold/50 px-2.5 py-1 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">
          <LuFlame aria-hidden className="h-3 w-3" />
          Série +{stake.bonus}
        </span>
      ) : null}
    </div>
  );
}
