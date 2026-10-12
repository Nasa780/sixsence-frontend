import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LuLoaderCircle, LuX } from "react-icons/lu";
import { Button } from "./Button";
import { Notice } from "./Feedback";

/**
 * Fenêtre « motif + description » : demande d'arbitrage, signalement d'un joueur.
 *
 *   open, onClose      affichage
 *   title, intro       textes
 *   reasons            { clé: libellé }
 *   submitLabel        texte du bouton
 *   onSubmit({ reason, details }) : promesse ; une erreur est affichée dans la fenêtre
 */
export function ReasonDialog({ open, onClose, title, intro, reasons, submitLabel = "Envoyer", onSubmit }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const firstField = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setReason("");
    setDetails("");
    setError(null);
    setDone(false);
    setTimeout(() => firstField.current?.focus(), 50);
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit(event) {
    event.preventDefault();
    if (!reason) return setError("Choisis un motif.");
    setPending(true);
    setError(null);
    try {
      await onSubmit({ reason, details: details.trim() });
      setDone(true);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/85 px-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-dialogue"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="w-full max-w-lg border border-gold/30 bg-ink-800 p-6 shadow-2xl shadow-black/60"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="titre-dialogue" className="font-display text-3xl font-black uppercase leading-none">
                {title}
              </h2>
              <button type="button" onClick={onClose} className="p-1 text-white/50 hover:text-white" aria-label="Fermer">
                <LuX aria-hidden className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="mt-6 space-y-5">
                <Notice tone="success">C&apos;est envoyé : un membre de l&apos;équipe va s&apos;en occuper. Merci !</Notice>
                <Button onClick={onClose}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-4">
                {intro ? <p className="text-sm text-white/60">{intro}</p> : null}
                <fieldset>
                  <legend className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">Motif</legend>
                  <div className="grid gap-2">
                    {Object.entries(reasons).map(([key, label], index) => (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 text-sm transition-colors ${
                          reason === key ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/70 hover:border-white/25"
                        }`}
                      >
                        <input
                          ref={index === 0 ? firstField : undefined}
                          type="radio"
                          name="motif"
                          value={key}
                          checked={reason === key}
                          onChange={() => setReason(key)}
                          className="accent-[var(--color-gold)]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="details-dialogue" className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
                    Détails (facultatif)
                  </label>
                  <textarea
                    id="details-dialogue"
                    rows={3}
                    maxLength={500}
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Ce qui s'est passé, à quel moment…"
                    className="w-full resize-y border border-white/12 bg-ink px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none"
                  />
                  <p className="mt-1 text-right text-[11px] text-white/35">{details.length}/500</p>
                </div>
                {error ? <Notice tone="error">{error}</Notice> : null}
                <div className="flex gap-3">
                  <Button type="submit" disabled={pending}>
                    {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
                    {submitLabel}
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
