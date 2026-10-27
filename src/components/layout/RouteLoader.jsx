import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { randomTip } from "../../lib/tips";
import { LoaderEmblem } from "../ui/LoaderEmblem";

/** Délai avant d'afficher l'écran : une page qui s'ouvre vite ne le montre jamais. */
const SHOW_AFTER_MS = 350;

/**
 * Écran de chargement plein écran pendant un changement de page lent : emblème SixSence, pourcentage, barre
 * dorée et une astuce. Le pourcentage avance vite puis ralentit jusqu'à la fin réelle du chargement, puis 100 % et fondu.
 */
export function RouteLoader() {
  const router = useRouter();
  const [state, setState] = useState({ visible: false, done: false, progress: 0, tip: "" });
  const timers = useRef({ show: null, tick: null, hide: null });

  useEffect(() => {
    const clear = () => {
      clearTimeout(timers.current.show);
      clearInterval(timers.current.tick);
      clearTimeout(timers.current.hide);
    };
    const start = (url, { shallow } = {}) => {
      if (shallow || url === router.asPath) return;
      clear();
      timers.current.show = setTimeout(() => {
        setState({ visible: true, done: false, progress: 8, tip: randomTip() });
        timers.current.tick = setInterval(() => setState((s) => ({ ...s, progress: Math.min(94, s.progress + (95 - s.progress) * 0.08) })), 120);
      }, SHOW_AFTER_MS);
    };
    const end = () => {
      clear();
      setState((s) => (s.visible ? { ...s, progress: 100, done: true } : s));
      timers.current.hide = setTimeout(() => setState((s) => ({ ...s, visible: false, done: false, progress: 0 })), 450);
    };
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      clear();
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router]);

  if (!state.visible) return null;
  const percent = Math.round(state.progress);
  return (
    <div role="status" aria-live="polite" className={cn("fixed inset-0 z-[90] grid place-items-center bg-ink/95 backdrop-blur-sm transition-opacity duration-300", state.done ? "opacity-0" : "opacity-100")}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_srgb,var(--color-gold)_16%,transparent),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative flex flex-col items-center px-6">
        <LoaderEmblem size={136} hexagon />
        <p className="mt-6 font-display text-2xl font-black uppercase tracking-[0.3em] text-gold-gradient">SixSence</p>
        <div className="mt-5 w-64">
          <div className="flex justify-between font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
            <span>{state.done ? "Prêt" : "Chargement"}</span>
            <span className="text-gold tabular-nums">{percent} %</span>
          </div>
          <div className="mt-2 h-1 bg-white/10">
            <div className="relative h-full bg-linear-to-r from-gold-dark via-gold to-gold-light transition-[width] duration-150" style={{ width: `${percent}%` }}>
              <span aria-hidden className="absolute -right-1 -top-1 h-3 w-3 rotate-45 bg-gold-light shadow-[0_0_12px_var(--color-gold)]" />
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-xs text-center text-sm text-white/60">
          <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Astuce · </span>
          {state.tip}
        </p>
      </div>
    </div>
  );
}
