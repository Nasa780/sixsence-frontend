import NumberFlow from "@number-flow/react";

/**
 * Case d'un compte à rebours : les chiffres roulent vers le bas à chaque seconde (NumberFlow, 2026-11-11), comme un
 * compteur mécanique. `value` null : tiret en attendant le calcul (pas d'écart entre serveur et navigateur).
 * Immobile si l'utilisateur réduit les animations (géré par NumberFlow).
 */
export function Ticker({ value, pad = 2, className }) {
  if (value === null || value === undefined) return <span className={className}>–</span>;
  return (
    <NumberFlow
      value={value}
      format={{ minimumIntegerDigits: pad, useGrouping: false }}
      trend={-1}
      spinTiming={{ duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      className={className}
    />
  );
}

/**
 * Temps restant jusqu'à `target` (date ISO ou millisecondes) au format des coupes : « 2 j 4 h 05 » au-delà d'un jour,
 * sinon « 4:05:09 », chaque chiffre roulant. `now` : heure courante fournie par la page (relue chaque seconde).
 */
export function Clock({ target, now, className }) {
  const end = typeof target === "number" ? target : new Date(target).getTime();
  const seconds = Math.max(0, Math.floor((end - now) / 1000));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className={className}>
      {d > 0 ? (
        <>
          <Ticker value={d} pad={1} /> j <Ticker value={h} pad={1} /> h <Ticker value={m} />
        </>
      ) : (
        <>
          <Ticker value={h} pad={1} />:<Ticker value={m} />:<Ticker value={s} />
        </>
      )}
    </span>
  );
}
