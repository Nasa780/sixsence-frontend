import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

// Faux au premier affichage : la page envoyée par le serveur reste visible tout de suite (pas d'opacité 0 en attendant
// le JavaScript, qui retardait l'affichage sur téléphone) ; vrai ensuite, pour les changements de page.
let navigated = false;

/**
 * Fondu court à chaque changement de page (opacité seule : pas de transformation, qui décalerait les éléments
 * fixes de la page), seulement en changeant de page. Rien si l'utilisateur réduit les animations.
 */
export function PageFade({ pageKey, children }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    navigated = true;
  }, []);
  if (reduce) return children;
  return (
    <motion.div key={pageKey} initial={navigated ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
