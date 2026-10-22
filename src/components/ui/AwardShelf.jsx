import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { TacticalCard } from "./TacticalCard";

/** Métaux : couleur du texte et lueur sous la récompense. */
export const METALS = {
  or: { label: "Or", tone: "text-[#e7c05a]", glow: "rgba(234,192,90,0.4)" },
  argent: { label: "Argent", tone: "text-white/80", glow: "rgba(220,226,234,0.3)" },
  bronze: { label: "Bronze", tone: "text-[#d6935a]", glow: "rgba(214,140,82,0.32)" },
};
/** Au-delà, la vitrine passe en palmarès regroupé (une récompense par métal, « ×N »). */
const ROW_MAX = 8;

/**
 * Vitrine de récompenses (médailles du profil, trophées de la fiche d'équipe) : compteurs en texte coloré,
 * une rangée tant qu'il y en a 8 au plus ; au-delà, palmarès regroupé par métal (×N) et détail complet en
 * grille au clic. items : { key, metal: or|argent|bronze, image, label, title, sub }, du plus récent au plus ancien.
 */
export function AwardShelf({ id, eyebrow = null, title, items, swing = false }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const count = (metal) => items.filter((item) => item.metal === metal).length;
  const grouped = items.length > ROW_MAX;

  return (
    <TacticalCard highlight cut={18} innerClassName="relative overflow-hidden px-5 pb-6 pt-5 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_center,rgba(234,192,90,0.18),transparent_70%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-[#e7c05a]">{eyebrow}</p> : null}
          <h2 id={id} className={cn("font-display text-3xl font-black uppercase leading-none sm:text-4xl", eyebrow && "mt-2")}>
            {title}
          </h2>
        </div>
        <p className="flex flex-wrap gap-4 font-tech text-[11px] uppercase tracking-[0.2em]">
          {Object.entries(METALS).map(([metal, info]) => (
            <span key={metal} className={info.tone}>
              {info.label} {count(metal)}
            </span>
          ))}
        </p>
      </div>

      {grouped ? (
        <>
          {/* Palmarès : une récompense par métal, avec le nombre et la dernière obtenue. */}
          <ul className="relative mt-6 grid grid-cols-3 gap-4 sm:max-w-2xl">
            {Object.entries(METALS).map(([metal, info]) => {
              const list = items.filter((item) => item.metal === metal);
              if (!list.length) return <li key={metal} />;
              return (
                <li key={metal} className="flex flex-col items-center text-center">
                  <div className="relative flex h-36 w-full items-end justify-center sm:h-44">
                    <span aria-hidden className="absolute bottom-2 h-6 w-20 rounded-[50%] blur-md" style={{ background: info.glow }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={list[0].image} alt={`${info.label} ×${list.length}`} width={420} height={420} loading="lazy" className="relative h-full w-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)]" />
                    <span className="absolute right-1 top-1 bg-ink/90 px-2 py-0.5 font-display text-2xl font-black leading-none ring-1 ring-white/15 sm:right-4">×{list.length}</span>
                  </div>
                  <p className={cn("mt-2 font-tech text-[10px] uppercase tracking-[0.2em]", info.tone)}>{info.label}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/45">Dernière : {list[0].title}</p>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="relative mt-5 inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/60 hover:text-[#e7c05a]">
            {open ? "Masquer le détail" : `Voir les ${items.length}`}
            <LuChevronDown aria-hidden className={cn("h-4 w-4 transition", open && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative mt-4 grid grid-cols-3 gap-x-3 gap-y-5 overflow-hidden sm:grid-cols-5 lg:grid-cols-8">
                {items.map((item) => (
                  <Award key={item.key} item={item} small swing={swing} />
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </>
      ) : (
        <ul className="relative mt-6 flex flex-wrap gap-5">
          {items.map((item, index) => (
            <Award key={item.key} item={item} index={index} swing={swing} />
          ))}
        </ul>
      )}
    </TacticalCard>
  );
}

function Award({ item, index = 0, small = false, swing }) {
  const info = METALS[item.metal] ?? METALS.or;
  return (
    <motion.li
      initial={{ opacity: 0, y: swing ? -16 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 120, damping: 12 }}
      className={cn("group flex shrink-0 flex-col items-center text-center", small ? "w-full" : "w-28 sm:w-32")}
    >
      <div className={cn("relative flex w-full items-end justify-center", small ? "h-24" : "h-36 sm:h-40")}>
        <span aria-hidden className="absolute bottom-2 h-6 w-16 rounded-[50%] blur-md" style={{ background: info.glow }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={`${item.label} · ${item.title}`}
          width={420}
          height={420}
          loading="lazy"
          className={cn("relative h-full w-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] transition duration-500", swing ? "origin-top group-hover:rotate-[4deg]" : "group-hover:-translate-y-1.5", "group-hover:scale-105")}
        />
      </div>
      <p className={cn("mt-2 font-tech uppercase tracking-[0.2em]", small ? "text-[9px]" : "text-[10px]", info.tone)}>{item.label}</p>
      <p className={cn("mt-1 line-clamp-2 font-semibold text-white/80", small ? "text-[11px]" : "text-xs")}>{item.title}</p>
      {item.sub ? <p className="mt-0.5 text-[11px] text-white/40">{item.sub}</p> : null}
    </motion.li>
  );
}
