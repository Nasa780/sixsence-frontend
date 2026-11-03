import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuCircleCheck, LuGamepad2, LuX } from "react-icons/lu";
import useUser from "../../hooks/useUser";
import { Avatar } from "../ui/Avatar";
import { ActivisionForm } from "./ActivisionForm";

// Fenêtre fermée avec « Plus tard » : plus d'ouverture pendant cette visite (onglet), elle revient à la suivante.
const LATER_KEY = "sixsence:activision-plus-tard";
// Pages où la fenêtre ne s'ouvre pas : connexion, administration.
const SKIP = ["/login", "/auth", "/admin"];

/**
 * Identifiant Activision demandé dès la connexion : tant qu'un joueur connecté n'en a pas, une fenêtre s'ouvre
 * (bienvenue, pourquoi c'est nécessaire, où le trouver, formulaire ActivisionForm). « Plus tard » la ferme pour la
 * visite en cours ; une fois l'identifiant enregistré, elle ne revient plus.
 */
export function ActivisionPrompt() {
  const user = useUser();
  const { pathname } = useRouter();
  const [later, setLater] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setLater(sessionStorage.getItem(LATER_KEY) === "1");
    } catch {
      setLater(false);
    }
  }, []);

  const missing = Boolean(user?.profile && !user.profile.activision_id);
  const open =
    (missing || done) &&
    !later &&
    !SKIP.some((prefix) => pathname.startsWith(prefix));

  const close = () => {
    try {
      sessionStorage.setItem(LATER_KEY, "1");
    } catch {
      // Stockage indisponible (navigation privée) : fermée pour cette page seulement.
    }
    setLater(true);
    setDone(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <ActivisionDialog
          key="activision"
          user={user}
          done={done}
          onSaved={() => setDone(true)}
          onClose={close}
        />
      ) : null}
    </AnimatePresence>
  );
}

/** Fenêtre « Dernière étape avant ton premier match » (ou « C'est tout bon » une fois enregistré). */
export function ActivisionDialog({ user, done, onSaved, onClose }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-activision"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative max-h-[100dvh] w-full max-w-lg overflow-y-auto border border-gold/40 bg-ink-800 shadow-2xl shadow-black/70"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center text-white/50 transition-colors hover:text-white"
        >
          <LuX className="h-5 w-5" />
        </button>

        {done ? (
          <div className="relative p-6 text-center sm:p-8">
            <LuCircleCheck aria-hidden className="mx-auto h-14 w-14 text-win" />
            <p className="mt-4 font-display text-3xl font-black uppercase leading-none">
              C&apos;est tout bon
            </p>
            <p className="mt-3 text-sm text-white/60">
              Ton identifiant est enregistré : tu peux rejoindre la file et
              jouer tes premiers matchs.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="clip-slant mt-6 inline-flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:12px]"
            >
              Continuer
            </button>
          </div>
        ) : (
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} name={user?.username} size={44} />
              <div className="min-w-0">
                <p className="font-tech text-[10px] uppercase tracking-[0.28em] text-gold">
                  Bienvenue sur SixSence
                </p>
                <p className="truncate font-display text-xl font-black uppercase leading-none">
                  {user?.username}
                </p>
              </div>
            </div>
            <h2
              id="titre-activision"
              className="mt-6 font-display text-3xl font-black uppercase leading-[0.95] sm:text-4xl"
            >
              Dernière étape avant ton{" "}
              <span className="text-gold-gradient">premier match</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Ajoute ton identifiant Activision : l&apos;hôte de chaque match
              s&apos;en sert pour t&apos;inviter dans la partie privée. Sans
              lui, impossible d&apos;entrer dans la file ou de s&apos;inscrire à
              une coupe.
            </p>
            <div className="mt-4 flex gap-3 border-l-2 border-gold/50 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/60">
              <LuGamepad2
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
              />
              <span>
                Il ressemble à{" "}
                <span className="font-semibold text-white">Pseudo#1234567</span>
                . Tu le trouves dans le menu Social de Call of Duty ou sur ton
                compte Activision.
              </span>
            </div>
            <div className="mt-6">
              <ActivisionForm user={user} onSaved={onSaved} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
            >
              Plus tard
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
