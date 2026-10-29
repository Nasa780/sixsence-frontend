import { motion, useReducedMotion } from "framer-motion";

/**
 * Fondu court à chaque changement de page (opacité seule : pas de transformation, qui décalerait les éléments
 * fixes de la page). Rien si l'utilisateur réduit les animations.
 */
export function PageFade({ pageKey, children }) {
  const reduce = useReducedMotion();
  if (reduce) return children;
  return (
    <motion.div key={pageKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
