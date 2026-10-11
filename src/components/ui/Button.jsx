import Link from "next/link";
import { cn } from "../../lib/cn";

/**
 * Bouton en parallélogramme, signature visuelle du site.
 *
 * Deux couches : l'élément extérieur porte le halo doré au survol
 * (drop-shadow), l'élément intérieur porte la forme (clip-path). Les séparer
 * est indispensable, car clip-path rognerait le halo.
 *
 * Variantes : primary (or), outline (contour or), ghost (texte), danger (rouge).
 */
const SIZES = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-5 py-3.5 text-base sm:px-7",
  lg: "px-6 py-4 text-base sm:px-9 sm:text-lg",
};

const WRAPPER =
  "group/btn relative inline-flex select-none align-middle transition duration-300 hover:glow-gold focus-visible:glow-gold active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const LABEL =
  "clip-slant flex w-full items-center justify-center gap-2.5 whitespace-nowrap font-display font-bold uppercase leading-none tracking-[0.1em] transition duration-300 sm:tracking-[0.14em]";

function Face({ variant = "primary", size = "md", children }) {
  const label = cn(LABEL, SIZES[size]);

  if (variant === "primary") {
    return <span className={cn(label, "bg-gold-sheen text-ink group-hover/btn:brightness-110")}>{children}</span>;
  }
  if (variant === "ghost") {
    return <span className={cn(label, "text-white/70 group-hover/btn:text-gold")}>{children}</span>;
  }

  // Variantes "contour" : une couche colorée d'un pixel fait office de bordure,
  // y compris le long des diagonales (une vraie bordure CSS serait rognée).
  const danger = variant === "danger";
  return (
    <span
      className={cn(
        "clip-slant block w-full p-px transition-colors duration-300",
        danger ? "bg-loss/50 group-hover/btn:bg-loss" : "bg-gold/45 group-hover/btn:bg-gold",
      )}
    >
      <span
        className={cn(
          label,
          "bg-ink-800 group-hover/btn:bg-ink-700",
          danger ? "text-loss" : "text-white group-hover/btn:text-gold-light",
        )}
      >
        {children}
      </span>
    </span>
  );
}

export function Button({ variant, size, fullWidth = false, className = "", children, type = "button", ...props }) {
  return (
    <button type={type} className={cn(WRAPPER, fullWidth && "w-full", className)} {...props}>
      <Face variant={variant} size={size}>
        {children}
      </Face>
    </button>
  );
}

/** Même apparence, mais un lien (interne, ou externe avec `external`). */
export function ButtonLink({ href, external = false, variant, size, fullWidth = false, className = "", children }) {
  const classes = cn(WRAPPER, fullWidth && "w-full", className);
  const face = (
    <Face variant={variant} size={size}>
      {children}
    </Face>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {face}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {face}
    </Link>
  );
}
