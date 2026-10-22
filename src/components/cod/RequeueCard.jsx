import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";
import { LuLoaderCircle, LuRadar } from "react-icons/lu";
import { askNotificationPermission, unlockAudio } from "../../lib/notify";
import { cn } from "../../lib/cn";

/**
 * Fin de match (terminé ou annulé) : carte avec un bouton qui ouvre la page de la file avec ?rejoindre=<format> ;
 * la file relance la recherche toute seule dès sa connexion temps réel (QueuePanel), plus besoin de recliquer.
 * Déjà en file (joueur prêt remis en tête après une annulation) : la page de la file s'ouvre simplement.
 */
export function RequeueCard({ format, title, text, tone = "gold" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function requeue() {
    // Clic du joueur : autorise le son et les notifications du prochain « Match trouvé ».
    askNotificationPermission();
    unlockAudio();
    setPending(true);
    await router.push(`/cod/ranked?rejoindre=${encodeURIComponent(format || "auto")}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden border bg-linear-to-r from-ink-800 to-ink p-5 clip-tactical [--cut:16px] sm:p-6",
        tone === "gold" ? "border-gold/40" : "border-white/12",
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[24deg] bg-linear-to-r from-transparent via-gold/10 to-transparent"
        animate={{ x: ["0%", "420%"] }}
        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-2xl font-black uppercase leading-none sm:text-3xl">{title}</p>
          <p className="mt-1.5 text-sm text-white/60">{text}</p>
        </div>
        <button
          type="button"
          onClick={requeue}
          disabled={pending}
          className="group inline-flex shrink-0 items-center justify-center gap-2.5 bg-gold-sheen px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant transition-transform hover:scale-[1.03] disabled:opacity-70"
        >
          {pending ? (
            <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" />
          ) : (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="inline-flex">
              <LuRadar aria-hidden className="h-5 w-5" />
            </motion.span>
          )}
          Rejoindre la file{format ? ` · ${format}` : ""}
        </button>
      </div>
    </motion.div>
  );
}
