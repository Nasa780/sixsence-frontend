import NumberFlow from "@number-flow/react";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Nombre qui roule jusqu'à sa valeur, chiffre par chiffre comme un compteur mécanique (NumberFlow, 2026-11-11), quand
 * il apparaît à l'écran (depuis `from`), puis depuis l'ancienne valeur quand elle change (temps réel). Valeur directe
 * si l'utilisateur réduit les animations (géré par NumberFlow).
 *   signed : affiche le signe (+50, −25, ±0), pour une variation de points.
 */
export function CountUp({ value, from = 0, delay = 0, duration = 1100, signed = false, className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(from);

  useEffect(() => {
    if (!seen || typeof value !== "number") return undefined;
    const timer = setTimeout(() => setShown(value), delay);
    return () => clearTimeout(timer);
  }, [seen, value, delay]);

  const timing = { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
  return (
    <span ref={ref} className={className}>
      {signed && shown === 0 ? "±" : null}
      <NumberFlow
        value={shown}
        locales="fr-FR"
        format={signed ? { signDisplay: "exceptZero" } : undefined}
        transformTiming={timing}
        spinTiming={timing}
        willChange
      />
    </span>
  );
}
