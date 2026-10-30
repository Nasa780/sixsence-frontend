import { LuChevronDown, LuShare, LuSquarePlus, LuX } from "react-icons/lu";
import { Container } from "../components/ui/Container";

// Maquette (non commitée) : installer SixSence sur iPhone (Safari), étapes illustrées.
const STEPS = [
  {
    title: "Partager",
    text: "Touche le bouton Partager dans la barre du bas de Safari (le carré avec une flèche).",
    visual: (
      <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink ring-4 ring-gold/30">
          <LuShare aria-hidden className="h-5 w-5" />
        </span>
        <span className="h-5 w-5 rounded-full border-2 border-white/40" />
        <span className="h-5 w-5 rounded-full border-2 border-white/40" />
      </div>
    ),
  },
  {
    title: "En voir plus",
    text: "En bas de la fenêtre de partage, touche « En voir plus » (la flèche vers le bas).",
    visual: (
      <div className="flex items-end gap-3">
        {["Copier", "Liste", "Signet"].map((label) => (
          <span key={label} className="flex flex-col items-center gap-1">
            <span className="h-11 w-11 rounded-full bg-white/10" />
            <span className="text-[9px] text-white/40">{label}</span>
          </span>
        ))}
        <span className="flex flex-col items-center gap-1">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-ink ring-4 ring-gold/30">
            <LuChevronDown aria-hidden className="h-5 w-5" />
          </span>
          <span className="text-[9px] font-semibold text-gold">En voir plus</span>
        </span>
      </div>
    ),
  },
  {
    title: "Sur l'écran d'accueil",
    text: "Dans la liste qui s'ouvre, touche « Sur l'écran d'accueil ».",
    visual: (
      <div className="w-56 overflow-hidden rounded-2xl bg-white/10 text-sm">
        <p className="px-4 py-2.5 text-white/45">Rechercher dans la page</p>
        <p className="flex items-center gap-2 border-t border-white/10 bg-gold/15 px-4 py-2.5 font-semibold text-gold">
          <LuSquarePlus aria-hidden className="h-4 w-4" /> Sur l&apos;écran d&apos;accueil
        </p>
      </div>
    ),
  },
  {
    title: "Ajouter",
    text: "Touche « Ajouter » en haut à droite : l'icône SixSence arrive sur ton écran d'accueil. Ouvre-la depuis là pour recevoir les notifications.",
    visual: (
      <div className="flex flex-col items-center gap-1.5">
        <img src="/icons/icon-192-v2.png" alt="" className="h-14 w-14 rounded-2xl" onError={(event) => (event.currentTarget.style.display = "none")} />
        <span className="text-[11px] text-white/70">SixSence</span>
      </div>
    ),
  },
];

export default function DevIphone() {
  return (
    <Container className="flex justify-center pb-16 pt-28">
      <div className="w-full max-w-md border border-gold/30 bg-ink-800 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl font-black uppercase leading-none">Installer SixSence</h2>
          <LuX aria-hidden className="h-5 w-5 text-white/50" />
        </div>
        <p className="mt-2 text-sm text-white/55">Sur iPhone, avec Safari. Ça prend 10 secondes :</p>
        <ol className="mt-5 space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-gold font-display text-base font-black text-ink">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-black uppercase leading-none">{step.title}</p>
                <p className="mt-1 text-sm text-white/65">{step.text}</p>
                <div className="mt-3 flex justify-center rounded-xl border border-white/10 bg-black/40 px-4 py-4">{step.visual}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-white/40">Autre navigateur sur iPhone (Chrome, Firefox) ? Ouvre sixsence.fr dans Safari et recommence.</p>
        <span className="clip-slant mt-5 inline-flex bg-gold px-5 py-2.5 font-display text-sm font-black uppercase tracking-[0.14em] text-ink">C&apos;est compris</span>
      </div>
    </Container>
  );
}
