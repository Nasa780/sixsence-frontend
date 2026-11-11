import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { Reveal } from "../effects/Reveal";
import { useGta6Countdown } from "../gta/Gta6Countdown";
import { Container } from "../ui/Container";

const DAY = 86_400_000;

/** Les rôles du casting, chacun dans la couleur de son mode (data-univers). `x` cadre le visage (object-position). */
const ROLES = [
  { key: "classe", univers: "classe", game: "Call of Duty · MW4", title: "Classé", word: "Solo", text: "Seul contre tous. Chaque victoire te rapproche de Légende.", cta: "Lancer une partie", href: "/cod/ranked", image: "/images/modes/classe.webp", x: "44%" },
  ...(MATCH_TEAM_ENABLED
    ? [
        { key: "division", univers: "division", game: "Call of Duty · MW4", title: "Division", word: "4v4", text: "Ton équipe, des défis directs et un classement toute la saison.", cta: "Jouer en équipe", href: "/cod/division", image: "/images/modes/division.jpg", x: "62%" },
        { key: "tournoi", univers: "tournoi", game: "Call of Duty · MW4", title: "Tournoi", word: "Podium", text: "Coupe Horus en équipe, Coupe Anubis en solo. Trophées et podium.", cta: "Prochain tournoi", href: "/cod/tournoi", image: "/images/modes/tournoi.webp", x: "36%" },
      ]
    : []),
  { key: "gta", univers: "gta", game: "Grand Theft Auto VI", title: "GTA 6", word: null, text: "Sessions, courses et braquages avec la communauté.", cta: "Le programme", href: "/gta6", image: "/images/gta6.webp", x: "38%", zoom: true },
];

const COUNT = { 3: "Trois", 4: "Quatre" };

/** Mot vertical de la carte GTA 6 : « J-8 » avant la sortie, « VI » ensuite (et avant le premier calcul). */
function useGtaWord() {
  const parts = useGta6Countdown();
  if (!parts) return "VI";
  const days = Math.ceil((parts[0].value * DAY + parts[1].value * 3_600_000 + parts[2].value * 60_000) / DAY);
  return `J-${Math.max(days, 1)}`;
}

function RoleCard({ role, index, word }) {
  return (
    <Link
      href={role.href}
      data-univers={role.univers}
      className="clip-tactical group relative block h-[27rem] w-[78vw] max-w-[20rem] shrink-0 snap-start overflow-hidden outline-none [--cut:22px] focus-visible:brightness-110 sm:h-[34rem] lg:h-[38rem] lg:w-auto lg:max-w-none"
    >
      {/* GTA 6 : image agrandie et calée sur Lucia, sous le logo du jeu */}
      <span className={cn("absolute inset-x-0 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]", role.zoom ? "top-[-64.5%] h-[175%]" : "inset-y-0")}>
        <Image src={role.image} alt="" fill sizes={role.zoom ? "1920px" : "1280px"} className="object-cover" style={{ objectPosition: `${role.x} ${role.zoom ? "50%" : "0%"}` }} />
      </span>
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.35)_0%,rgba(10,10,10,0)_30%,rgba(10,10,10,0.62)_60%,rgba(10,10,10,0.96)_100%)]" />

      <span className="absolute left-5 top-4 font-tech text-[10px] font-bold tracking-[0.22em] text-white/70 sm:left-6 sm:top-5 sm:text-xs">{String(index + 1).padStart(2, "0")}</span>
      <span
        aria-hidden
        className="absolute right-1 top-3 font-display text-[6rem] font-black uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_var(--color-gold)] [writing-mode:vertical-rl] sm:text-[8rem]"
      >
        {role.word ?? word}
      </span>

      <span className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
        <span className="block font-tech text-[9px] uppercase tracking-[0.28em] text-white/55 sm:text-[10px]">{role.game}</span>
        <span className="mt-2 block font-display text-5xl font-black uppercase leading-[0.85] sm:text-6xl">{role.title}</span>
        <span className="mt-3 block text-[13px] leading-normal text-white/70 sm:min-h-[4.25rem] sm:text-[15px]">{role.text}</span>
        <span className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 font-display text-[15px] font-bold uppercase tracking-[0.14em] sm:text-base">
          {role.cta}
          <span aria-hidden className="text-gold transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
    </Link>
  );
}

/**
 * « Choisis ton rôle » (2026-11-11, accueil « affiche ») : les modes en grandes cartes portrait, chacun avec son
 * visage, un mot vertical en contour et la couleur de son mode. Quatre colonnes sur ordinateur ; sur téléphone, un
 * carrousel qu'on fait glisser du doigt, avec des repères en dessous.
 */
export function Casting() {
  const word = useGtaWord();
  const [current, setCurrent] = useState(0);

  // Carte la plus visible du carrousel (téléphone) : position du défilement / largeur d'une carte.
  const onScroll = (event) => {
    const rail = event.currentTarget;
    const card = rail.firstElementChild;
    if (!card) return;
    setCurrent(Math.min(ROLES.length - 1, Math.round(rail.scrollLeft / (card.getBoundingClientRect().width + 12))));
  };

  return (
    <section id="univers" aria-labelledby="titre-casting" className="scroll-mt-20 py-20 sm:py-28 lg:py-32">
      <Container>
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-gold sm:text-xs">Le casting</p>
            <h2 id="titre-casting" className="mt-4 font-display text-[clamp(4.25rem,19vw,9rem)] font-black uppercase leading-[0.86] sm:mt-5">
              Choisis
              <br />
              <span className="text-gold-gradient">ton rôle</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/60 sm:text-[17px] lg:pb-3">
            {COUNT[ROLES.length] ?? ROLES.length} façons de jouer, chacune avec sa couleur. Tu peux toutes les tenter dans la même saison.
          </p>
        </Reveal>
      </Container>

      {/* Carrousel sur téléphone et tablette, grille sur ordinateur */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-10 max-w-7xl lg:mt-14 lg:px-8">
          <div
            onScroll={onScroll}
            className={cn(
              "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 lg:grid lg:gap-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden",
              ROLES.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            {ROLES.map((role, index) => (
              <RoleCard key={role.key} role={role} index={index} word={word} />
            ))}
          </div>
          <div aria-hidden className="mt-5 flex gap-2 px-4 sm:px-6 lg:hidden">
            {ROLES.map((role, index) => (
              <span key={role.key} className={cn("h-[3px] transition-all duration-300", index === current ? "w-7 bg-gold" : "w-2 bg-white/25")} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
