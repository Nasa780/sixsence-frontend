import { useEffect, useState } from "react";
import { GTA6_RELEASE } from "../../lib/config";

const RELEASE = new Date(GTA6_RELEASE).getTime();
const UNITS = [
  ["jours", 86_400_000],
  ["heures", 3_600_000],
  ["min", 60_000],
  ["sec", 1000],
];

/** Temps restant découpé en jours, heures, minutes, secondes (null une fois le jeu sorti). */
function remaining(now) {
  let left = RELEASE - now;
  if (left <= 0) return null;
  return UNITS.map(([label, size]) => {
    const value = Math.floor(left / size);
    left -= value * size;
    return { label, value };
  });
}

/** Compte à rebours de la sortie de GTA 6, calculé après l'affichage (pas d'écart entre serveur et navigateur). */
function useCountdown() {
  const [parts, setParts] = useState(undefined);
  useEffect(() => {
    const tick = () => setParts(remaining(Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return parts;
}

const releaseDay = new Date(RELEASE).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

/**
 * Compteur de la sortie de GTA 6, aux couleurs coucher de soleil (dans un parent data-univers="gta").
 * `compact` : une ligne pour la carte de l'accueil ; sinon grandes cases pour la page GTA 6.
 */
export function Gta6Countdown({ compact = false }) {
  const parts = useCountdown();
  const out = parts === null;
  const cells = parts || UNITS.map(([label]) => ({ label, value: null }));

  if (compact) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-tech text-[11px] uppercase tracking-[0.24em] text-white/55">
        <span className="text-gold">{out ? "Disponible" : "Sortie dans"}</span>
        {out ? (
          <span>depuis le {releaseDay}</span>
        ) : (
          cells.slice(0, 3).map((cell) => (
            <span key={cell.label}>
              <span className="font-display text-lg font-bold tabular-nums tracking-normal text-white">{cell.value ?? "–"}</span> {cell.label}
            </span>
          ))
        )}
      </p>
    );
  }

  return (
    <section
      aria-label="Compte à rebours de la sortie de GTA 6"
      className="relative overflow-hidden border border-gold/25 bg-linear-to-br from-gold/[0.08] via-ink-800 to-gold-dark/[0.10] px-5 py-8 sm:px-10"
    >
      <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[10rem] font-black leading-none text-outline opacity-30">
        VI
      </span>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">{out ? "C'est parti" : "Compte à rebours"}</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            {out ? "GTA 6 est " : "Sortie de "}
            <span className="text-gold-gradient">{out ? "sorti" : "GTA 6"}</span>
          </h2>
          <p className="mt-3 text-sm text-white/60">
            {out ? `Disponible depuis le ${releaseDay}. Retrouve la communauté aux événements.` : `Le ${releaseDay} sur PS5 et Xbox Series X|S.`}
          </p>
        </div>
        {out ? null : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer">
            {cells.map((cell) => (
              <div key={cell.label} className="min-w-[4.25rem] border border-white/10 bg-black/40 px-2 py-3 text-center sm:min-w-[5.5rem] sm:py-4">
                <p className="font-display text-4xl font-black tabular-nums leading-none text-gold-gradient sm:text-5xl">
                  {cell.value === null ? "–" : String(cell.value).padStart(2, "0")}
                </p>
                <p className="mt-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">{cell.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
