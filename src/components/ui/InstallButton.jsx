import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LuCircleCheck, LuDownload, LuX } from "react-icons/lu";
import { browserGuide, installApp, useInstall } from "../../lib/install";
import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { Portal } from "./Portal";

/**
 * Bouton « Installer l'application » : installe en un clic quand le navigateur le permet,
 * sinon ouvre la marche à suivre adaptée (iPhone, Firefox…). Caché si l'appli est déjà ouverte.
 *
 *   variant  "nav" (barre du haut), "menu" (menu mobile), "panel" (bloc de la file)
 */
export function InstallButton({ variant = "panel", className = "" }) {
  const { installed, alreadyInstalled, canPrompt, browser, ready } = useInstall();
  const [guide, setGuide] = useState(false);

  // Échap ferme la fenêtre d'explication.
  useEffect(() => {
    if (!guide) return undefined;
    const onKey = (event) => event.key === "Escape" && setGuide(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [guide]);

  if (!ready || installed) return null;

  // Déjà installée sur cet appareil (page ouverte dans le navigateur) : rien à installer.
  if (alreadyInstalled && !canPrompt) {
    if (variant !== "panel") return null;
    return (
      <p className={cn("inline-flex items-center gap-2 text-sm text-win", className)}>
        <LuCircleCheck aria-hidden className="h-4 w-4 shrink-0" />
        L&apos;appli SixSence est déjà installée sur cet appareil : ouvre-la depuis ton écran d&apos;accueil ou ton menu Démarrer.
      </p>
    );
  }

  async function onClick() {
    if (canPrompt) {
      await installApp();
      return;
    }
    setGuide(true);
  }

  const label = "Installer l'application";
  return (
    <>
      {variant === "nav" ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "hidden items-center gap-2 px-3 py-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold/90 transition-colors hover:text-gold xl:inline-flex",
            className,
          )}
        >
          <LuDownload aria-hidden className="h-4 w-4" />
          {label}
        </button>
      ) : variant === "menu" ? (
        <button
          type="button"
          onClick={onClick}
          className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-gold transition-colors hover:text-gold-light", className)}
        >
          <LuDownload aria-hidden className="h-4 w-4" />
          {label}
        </button>
      ) : (
        <Button variant="outline" onClick={onClick} className={className}>
          <LuDownload aria-hidden className="h-4 w-4" />
          {label}
        </Button>
      )}

      <Portal>
        <AnimatePresence>
          {guide ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/85 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
              onMouseDown={(event) => event.target === event.currentTarget && setGuide(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titre-installation"
                initial={{ y: 24 }}
                animate={{ y: 0 }}
                exit={{ y: 24 }}
                className="w-full max-w-md border border-gold/30 bg-ink-800 p-6 shadow-2xl shadow-black/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 id="titre-installation" className="font-display text-3xl font-black uppercase leading-none">
                    Installer SixSence
                  </h2>
                  <button type="button" onClick={() => setGuide(false)} className="p-1 text-white/50 hover:text-white" aria-label="Fermer">
                    <LuX aria-hidden className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-white/55">L&apos;installation en un clic n&apos;est pas disponible ici. Ça prend 10 secondes :</p>
                <ol className="mt-4 space-y-3">
                  {browserGuide(browser).map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm text-white/80">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-gold font-display text-sm font-black text-ink">{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-white/40">Déjà installée ? Ouvre SixSence depuis ton écran d&apos;accueil ou ton menu Démarrer.</p>
              <Button className="mt-5" onClick={() => setGuide(false)}>
                  C&apos;est compris
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
