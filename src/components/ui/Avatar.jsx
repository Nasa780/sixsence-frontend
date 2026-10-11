import { cn } from "../../lib/cn";

/** Avatar à coin coupé. Sans image, affiche l'initiale du pseudo. */
export function Avatar({ src, name = "?", size = 40, className = "" }) {
  const dimensions = { width: size, height: size };

  if (src && src.startsWith("https://")) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        style={dimensions}
        className={cn("clip-corner shrink-0 bg-ink-600 object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ ...dimensions, fontSize: Math.round(size * 0.45) }}
      className={cn(
        "clip-corner flex shrink-0 items-center justify-center bg-ink-600 font-display font-black uppercase text-gold",
        className,
      )}
    >
      {(name || "?").trim().charAt(0) || "?"}
    </span>
  );
}
