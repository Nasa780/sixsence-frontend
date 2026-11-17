import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { cn } from "../../lib/cn";
import { useLaunchWindow } from "../../lib/launch";

// Chargé à part, côté navigateur uniquement : tsParticles dessine dans un
// <canvas> et n'a aucun intérêt à être rendu par le serveur.
const GoldParticlesCanvas = dynamic(() => import("./GoldParticlesCanvas"), { ssr: false });

/**
 * Fond de particules dorées. À placer dans un parent "relative" :
 * le composant occupe tout l'espace de ce parent, derrière le contenu.
 * Désactivé pour les visiteurs qui ont demandé moins d'animations.
 *
 * id      : identifiant unique du canvas (un par instance sur une même page)
 * density : nombre de particules sur grand écran (réduit sur mobile)
 * linked  : relie les particules proches par un fil doré
 * palette : "or" (par défaut) ou "gta" (coucher de soleil)
 */
export function GoldParticles({ id, density = 80, linked = true, palette = "or", className = "" }) {
  const reduceMotion = useReducedMotion();
  // Mode Vice City (jour J de GTA 6) : les particules dorées passent au coucher de soleil.
  const launch = useLaunchWindow();
  if (reduceMotion) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <GoldParticlesCanvas key={launch ? "gta" : palette} id={id} density={density} linked={linked} palette={launch && palette === "or" ? "gta" : palette} />
    </div>
  );
}
