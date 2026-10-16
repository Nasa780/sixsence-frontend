import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { LuLoaderCircle, LuX } from "react-icons/lu";
import { Button } from "./Button";
import { Portal } from "./Portal";

/**
 * Fenêtre de confirmation d'une action qu'on ne peut pas défaire seul (déclarer ou confirmer
 * un résultat…).
 *
 *   open, onClose          affichage (Échap ou clic à côté ferment)
 *   title                  titre
 *   children               contenu (rappel de ce qui va se passer)
 *   confirmLabel           texte du bouton de confirmation
 *   tone                   "gold" (par défaut) ou "danger"
 *   pending                action en cours (bouton désactivé, roue)
 *   onConfirm()            lancé au clic sur le bouton de confirmation
 */
export function ConfirmDialog({ open, onClose, title, children, confirmLabel = "Confirmer", tone = "gold", pending = false, onConfirm }) {
  const confirmButton = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setTimeout(() => confirmButton.current?.focus(), 50);
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/85 px-4 backdrop-blur-sm"
            onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="titre-confirmation"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-md border border-gold/30 bg-ink-800 p-6 shadow-2xl shadow-black/60"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="titre-confirmation" className="font-display text-3xl font-black uppercase leading-none">
                  {title}
                </h2>
                <button type="button" onClick={onClose} disabled={pending} className="p-1 text-white/50 hover:text-white" aria-label="Fermer">
                  <LuX aria-hidden className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/70">{children}</div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose} disabled={pending}>
                  Annuler
                </Button>
                <Button ref={confirmButton} variant={tone === "danger" ? "danger" : undefined} onClick={onConfirm} disabled={pending}>
                  {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
