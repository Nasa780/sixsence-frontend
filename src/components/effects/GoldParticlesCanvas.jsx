import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useMemo, useState } from "react";

/**
 * Canvas tsParticles. Ne pas l'importer directement : passer par GoldParticles,
 * qui le charge en différé pour ne pas alourdir le premier affichage.
 *
 * Effet signature : les points dorés dérivent vers le haut, se relient entre
 * eux par des fils fins, et se relient au curseur quand la souris passe
 * (mode "grab", sur toute la fenêtre, même sous le contenu).
 */

// Le moteur tsParticles est global : on ne l'initialise qu'une fois pour tout le site.
let enginePromise = null;

function initEngine() {
  if (!enginePromise) {
    // loadSlim n'embarque que les fonctions utiles ici (liens, survol), pas tout tsParticles.
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

export default function GoldParticlesCanvas({ id, density, linked }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initEngine().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    const small = typeof window !== "undefined" && window.innerWidth < 768;
    return {
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      pauseOnOutsideViewport: true,
      particles: {
        number: { value: small ? Math.round(density * 0.45) : density, density: { enable: true } },
        color: { value: ["#d4af37", "#f1d77a", "#f8ecc0", "#ffffff"] },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.08, max: 0.75 },
          animation: { enable: true, speed: 0.7, sync: false },
        },
        size: { value: { min: 0.5, max: 2.4 } },
        links: {
          enable: linked,
          color: "#d4af37",
          distance: 130,
          opacity: 0.14,
          width: 1,
        },
        move: {
          enable: true,
          direction: "top",
          speed: { min: 0.15, max: 0.8 },
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
      },
      interactivity: {
        // Écoute la souris sur toute la fenêtre : l'effet fonctionne même sous le contenu.
        detectsOn: "window",
        events: {
          onHover: { enable: !small, mode: "grab" },
        },
        modes: {
          grab: { distance: 170, links: { opacity: 0.4 } },
        },
      },
    };
  }, [density, linked]);

  if (!ready) return null;
  return <Particles id={id} options={options} className="h-full w-full" />;
}
