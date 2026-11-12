import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { api } from "../../lib/api";
import { ClipCard } from "../clips/Clips";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";

/**
 * Accueil : le clip de la semaine (le plus voté des 7 derniers jours, `clipOfWeek` de GET /highlights) en grand,
 * lisible au clic ; à défaut le dernier clip posté (GET /clips). Rien s'il n'y a aucun clip.
 */
export function ClipSpotlight() {
  const [state, setState] = useState(null);

  useEffect(() => {
    let alive = true;
    api("/highlights")
      .then((highlights) => {
        if (highlights.clipOfWeek) return { clip: highlights.clipOfWeek, week: true };
        return api("/clips?sort=recent").then((data) => {
          const list = Array.isArray(data) ? data : (data.clips ?? []);
          return list[0] ? { clip: list[0], week: false } : null;
        });
      })
      .then((found) => alive && setState(found))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!state) return null;
  const { clip, week } = state;

  // La carte du clip porte déjà le titre, l’auteur et les votes : rien n’est répété à côté.
  return (
    <section aria-labelledby="titre-clip" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-gold sm:text-xs">{week ? "Le plus voté des 7 derniers jours" : "Les clips de la communauté"}</p>
            <h2 id="titre-clip" className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
              {week ? "Clip de la semaine" : "Dernier clip"}
            </h2>
          </div>
          <Link href="/clips" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold">
            Tous les clips
            <LuArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 max-w-4xl">
            <ClipCard clip={clip} highlight onRemoved={() => setState(null)} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
