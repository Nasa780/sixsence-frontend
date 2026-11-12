import { useEffect, useRef, useState } from "react";

/**
 * Filet doré entre deux sections de l'accueil (2026-11-12) : il se trace du centre vers les bords quand il arrive
 * à l'écran, puis brille une fois. Posé en absolu en haut de la section (qui doit être `relative`) : il ne change
 * aucun espacement, et il disparaît avec la section quand celle-ci n'est pas affichée. Styles : `.section-trace`.
 * className : position verticale (par défaut le bord haut de la section).
 */
export function SectionTrace({ className = "top-0" }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden className={`section-trace pointer-events-none absolute inset-x-4 mx-auto max-w-7xl ${seen ? "vu" : ""} ${className}`} />;
}
