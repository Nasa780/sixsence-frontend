import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Panneau déroulant de la barre du haut (pastille « en ligne », cloche) : ancré à droite du bouton,
 * fermé par Échap, par un clic ailleurs ou au changement de page (géré par le parent).
 */
export function NavPopover({ open, onClose, label, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    const onClick = (event) => ref.current && !ref.current.parentElement?.contains(event.target) && onClose();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label={label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "clip-corner fixed inset-x-3 top-16 z-50 border border-white/10 border-t-2 border-t-gold/70 bg-ink-800 [--cut:14px] shadow-2xl shadow-black/60 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2",
            className,
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
