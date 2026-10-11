import { motion, useReducedMotion } from "framer-motion";

/**
 * Fait apparaître son contenu en fondu montant quand il entre dans l'écran.
 * delay : retard en secondes, pour décaler plusieurs éléments en cascade.
 */
export function Reveal({ children, className = "", delay = 0, y = 24 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
