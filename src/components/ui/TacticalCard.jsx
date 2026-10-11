import { cn } from "../../lib/cn";

/**
 * Carte tactique à coins coupés.
 *
 * Trois couches :
 *   1. l'enveloppe, non rognée : porte le halo et le léger soulèvement au survol ;
 *   2. un liseré d'un pixel (fond coloré + clip-path) qui dessine la bordure,
 *      diagonales comprises ;
 *   3. le contenu, rogné à la même forme.
 *
 * interactive : halo doré, liseré doré et soulèvement au survol.
 * highlight   : liseré doré permanent (carte mise en avant).
 * cut         : taille des coins coupés en pixels (18 par défaut).
 * univers     : "gta" pour la palette coucher de soleil (voir globals.css).
 */
export function TacticalCard({ children, className = "", innerClassName = "", interactive = false, highlight = false, cut = 0, univers = undefined }) {
  const style = cut ? { "--cut": `${cut}px` } : undefined;

  return (
    <div
      style={style}
      data-univers={univers}
      className={cn(
        "group/card relative",
        interactive && "transition duration-300 hover:-translate-y-1 hover:glow-gold-soft",
        className,
      )}
    >
      <div
        className={cn(
          "clip-tactical h-full p-px transition-colors duration-300",
          highlight ? "bg-gold/60" : "bg-white/12",
          interactive && "group-hover/card:bg-gold/70",
        )}
      >
        <div className={cn("clip-tactical relative h-full bg-ink-800", innerClassName)}>{children}</div>
      </div>
    </div>
  );
}
