import { motion } from "framer-motion";
import { LuChevronRight, LuMap, LuPlay, LuSwords } from "react-icons/lu";
import { Container } from "../components/ui/Container";

// Démonstration locale (jamais committée) : variantes du bouton du bandeau « Match en cours ».

function Shell({ letter, children }) {
  return (
    <div className="relative">
      <span className="absolute -left-9 top-1/2 -translate-y-1/2 font-display text-3xl font-black text-white/30">{letter}</span>
      <div className="relative overflow-hidden border border-gold/50 bg-linear-to-br from-gold/[0.16] via-ink-800 to-ink clip-tactical [--cut:18px]">
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center border border-gold/60 bg-ink text-gold">
              <LuSwords aria-hidden className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-win" />
              </span>
            </span>
            <div className="min-w-0">
              <p className="font-tech text-[10px] uppercase tracking-[0.28em] text-win">● Partie en cours</p>
              <p className="mt-1 font-display text-3xl font-black uppercase leading-none">
                Match <span className="text-gold-gradient">en cours</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/65">
                <LuMap className="h-4 w-4 text-gold" /> <b className="text-white/85">Plaza</b> <span className="border border-gold/40 px-1.5 font-tech text-[10px] text-gold">3V3</span>
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const base = "relative inline-flex shrink-0 items-center justify-center gap-2.5 px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant bg-gold-sheen";

export default function DevBoutons() {
  return (
    <Container className="space-y-10 py-28 pl-12">
      {/* E : bordure lumineuse qui tourne autour du bouton */}
      <Shell letter="E">
        <span className="relative inline-flex overflow-hidden p-[3px] clip-slant">
          <motion.span
            aria-hidden
            className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,#fff6d0_40deg,transparent_90deg,transparent_180deg,#e7c05a_220deg,transparent_270deg)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative inline-flex items-center gap-2.5 bg-ink px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-gold-light clip-slant">
            <LuPlay className="h-5 w-5 fill-current" /> Rejoindre la partie
          </span>
        </span>
      </Shell>

      {/* F : épées qui s'entrechoquent */}
      <Shell letter="F">
        <span className={base}>
          <motion.span animate={{ rotate: [0, -20, 0, 0], scale: [1, 1.3, 1, 1] }} transition={{ duration: 1.4, repeat: Infinity, times: [0, 0.15, 0.3, 1] }} className="inline-flex">
            <LuSwords className="h-5 w-5" />
          </motion.span>
          Retour au combat
        </span>
      </Shell>

      {/* G : bouton « en direct » vert (couleur du Classé), contour qui pulse */}
      <Shell letter="G">
        <span className="relative">
          <motion.span aria-hidden className="absolute -inset-1 border-2 border-win clip-slant" animate={{ opacity: [0.9, 0], scale: [1, 1.12] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }} />
          <span className="relative inline-flex items-center gap-2.5 bg-win px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ink" />
            </span>
            Accéder au salon
          </span>
        </span>
      </Shell>

      {/* H : chevrons qui s'allument tour à tour, comme une invitation à avancer */}
      <Shell letter="H">
        <span className={base}>
          Continuer le match
          <span className="inline-flex">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className={i ? "-ml-2 inline-flex" : "inline-flex"} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
                <LuChevronRight className="h-5 w-5" />
              </motion.span>
            ))}
          </span>
        </span>
      </Shell>
    </Container>
  );
}
