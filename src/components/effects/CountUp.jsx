import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Nombre qui défile jusqu'à sa valeur quand il apparaît à l'écran (depuis `from`), puis depuis l'ancienne valeur
 * quand elle change (temps réel). Valeur directe si l'utilisateur réduit les animations.
 */
export function CountUp({ value, from = 0, delay = 0, duration = 1100, format = (n) => n.toLocaleString("fr-FR") }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(reduce ? value : from);
  const last = useRef(from);

  useEffect(() => {
    if (reduce) {
      last.current = value;
      return setShown(value);
    }
    if (!seen) return undefined;
    const start = last.current;
    last.current = value;
    if (start === value) return setShown(value);
    let frame;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / duration);
        setShown(Math.round(start + (value - start) * (1 - (1 - k) ** 3)));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [seen, value, delay, duration, reduce]);

  return <span ref={ref}>{format(shown)}</span>;
}
