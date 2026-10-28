import { LuCircleAlert, LuTriangleAlert } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { LoaderEmblem } from "./LoaderEmblem";

const TONES = {
  gold: "bg-gold/12 text-gold",
  neutral: "bg-white/8 text-white/70",
  win: "bg-win/12 text-win",
  loss: "bg-loss/12 text-loss",
};

/** Étiquette inclinée : statut, catégorie, rang. */
export function Chip({ children, tone = "gold", className = "" }) {
  return (
    <span
      className={cn(
        "clip-slant inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 font-tech text-[10px] font-bold uppercase leading-none tracking-[0.2em] [--slant:7px]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Message d'information, de succès ou d'erreur (annoncé par les lecteurs d'écran). */
export function Notice({ children, tone = "info", className = "" }) {
  const error = tone === "error";
  const success = tone === "success";
  const Icon = error ? LuTriangleAlert : LuCircleAlert;
  return (
    <div
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 border-l-2 px-4 py-3 text-sm leading-relaxed",
        error
          ? "border-loss bg-loss/10 text-loss"
          : success
            ? "border-win bg-win/10 text-win"
            : "border-gold bg-gold/8 text-white/80",
        className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 h-4 w-4 shrink-0", !error && !success && "text-gold")} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Bloc "rien à afficher". */
export function EmptyState({ title, children = null }) {
  return (
    <div className="border border-dashed border-white/15 px-6 py-14 text-center">
      <p className="font-display text-2xl font-bold uppercase tracking-wide text-white/80">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/50">{children}</div> : null}
    </div>
  );
}

/** Chiffre clé façon HUD : petite légende, grande valeur. */
export function StatTile({ label, value, hint = null, accent = false }) {
  return (
    <div className="border-l border-white/12 bg-white/[0.03] px-4 py-3.5">
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className={cn("mt-1.5 font-display text-3xl font-black leading-none tabular-nums", accent && "text-gold")}>{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

/** Indicateur de chargement discret. */
export function Loading({ label = "Chargement…" }) {
  return (
    <div role="status" className="flex justify-center py-14">
      <div className="flex max-w-md items-center gap-4">
        <LoaderEmblem size={48} />
        <p className="font-display text-lg font-black uppercase leading-none tracking-wide">{label}</p>
      </div>
    </div>
  );
}
