import { useEffect } from "react";
import { useLaunchWindow } from "../../lib/launch";

/**
 * Mode Vice City (jour J de GTA 6, 2026-11-17) : pendant les 48 h qui suivent la sortie, la classe `vice-city` posée sur
 * <html> fait passer l'or du site (menu, boutons, liserés, particules) aux couleurs coucher de soleil de GTA 6
 * (globals.css) ; les pages des modes COD gardent leur couleur. Tout redevient normal tout seul à la fin.
 */
export function ViceCityMode() {
  const launch = useLaunchWindow();
  useEffect(() => {
    document.documentElement.classList.toggle("vice-city", launch);
    return () => document.documentElement.classList.remove("vice-city");
  }, [launch]);
  return null;
}
