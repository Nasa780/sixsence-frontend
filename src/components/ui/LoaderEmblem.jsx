import { cn } from "../../lib/cn";

/**
 * Emblème de chargement : logo SixSence dans un anneau qui tourne (couleur de l'univers : or, vert, cyan, rouge,
 * coucher de soleil) et, en grand, un hexagone qui tourne en sens inverse. Utilisé par Loading et RouteLoader.
 */
export function LoaderEmblem({ size = 48, hexagon = false, className = "" }) {
  return (
    <span aria-hidden className={cn("relative grid shrink-0 place-items-center text-gold", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 animate-[spin_1.6s_linear_infinite]">
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth={hexagon ? 0.8 : 2} />
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth={hexagon ? 1.2 : 2.5} strokeLinecap="round" strokeDasharray="30 108" />
      </svg>
      {hexagon ? (
        <svg viewBox="0 0 48 48" className="absolute inset-[10%] animate-[spin_9s_linear_infinite_reverse]">
          <polygon points="24,2 43,13 43,35 24,46 5,35 5,13" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
        </svg>
      ) : null}
      <img src="/images/logo-256.webp" alt="" className="relative object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.5)]" style={{ width: size * 0.46, height: size * 0.46 }} />
    </span>
  );
}
