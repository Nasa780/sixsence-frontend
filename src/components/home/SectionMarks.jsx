import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";

/**
 * Repères de l'accueil (2026-11-12, ordinateur seulement) : une colonne de losanges à droite, un par section. Celui
 * de la section à l'écran s'allume en or avec son nom ; au survol, les autres noms apparaissent ; un clic y mène.
 * `marks` : [{ id, label }] ; une section absente ou vide (pas de direct Twitch, pas de clip…) n'a pas de repère.
 */
export function SectionMarks({ marks }) {
  const [shown, setShown] = useState([]);
  const [active, setActive] = useState(null);

  // Sections présentes (hauteur non nulle), dans l'ordre de la page ; relu quand une section apparaît ou disparaît.
  useEffect(() => {
    const nodes = marks.map((mark) => document.getElementById(mark.id)).filter(Boolean);
    const update = () =>
      setShown(
        marks
          .map((mark) => ({ ...mark, node: document.getElementById(mark.id) }))
          .filter((mark) => mark.node && mark.node.offsetHeight > 0)
          .sort((a, b) => a.node.offsetTop - b.node.offsetTop)
          .map(({ id, label }) => ({ id, label })),
      );
    const resize = new ResizeObserver(update);
    nodes.forEach((node) => resize.observe(node));
    const view = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nodes.forEach((node) => view.observe(node));
    return () => {
      resize.disconnect();
      view.disconnect();
    };
  }, [marks]);

  if (shown.length < 2) return null;
  const go = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <nav aria-label="Sections de l’accueil" className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex">
      {shown.map((mark) => {
        const on = mark.id === active;
        return (
          <a key={mark.id} href={`#${mark.id}`} onClick={(event) => go(event, mark.id)} aria-current={on ? "true" : undefined} className="group flex items-center gap-3 outline-none">
            <span
              className={cn(
                "font-tech text-[10px] uppercase tracking-[0.22em] transition-all duration-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]",
                on ? "text-gold opacity-100" : "translate-x-2 text-white/75 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
              )}
            >
              {mark.label}
            </span>
            <span
              aria-hidden
              className={cn(
                "block rotate-45 border transition-all duration-300",
                on ? "h-3 w-3 border-gold bg-gold shadow-[0_0_12px_#d4af37]" : "h-2 w-2 border-white/50 bg-black/40 group-hover:border-gold",
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
