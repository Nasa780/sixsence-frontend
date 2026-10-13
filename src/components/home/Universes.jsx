import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";

const UNIVERSES = [
  {
    href: "/cod",
    index: "01",
    game: "Call of Duty · MW4",
    image: "/images/mw4.webp",
    title: "Classé 2v2 → 5v5",
    watermark: "COD",
    text: "Rejoins la file, laisse le matchmaking composer les équipes et grimpe au classement match après match.",
    points: ["File d'attente en temps réel", "Carte et équipes tirées au sort", "9 rangs, emblèmes et trophées"],
    cta: "Entrer dans la file",
  },
  {
    href: "/gta6",
    index: "02",
    game: "GTA 6",
    image: "/images/grand-theft-auto-vi-3840x2160-22311.jpg",
    // Palette coucher de soleil (voir globals.css), comme sur les pages GTA 6.
    univers: "gta",
    title: "Événements",
    watermark: "VI",
    text: "Sessions organisées, rassemblements et tournois : consulte le planning et réserve ta place.",
    points: ["Planning des sessions à venir", "Inscription en un clic", "Places limitées, suivi des inscrits"],
    cta: "Voir le planning",
  },
];

/** Les deux univers du site, présentés en grandes cartes tactiques. */
export function Universes() {
  return (
    <section id="univers" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Deux univers"
            title={
              <>
                Choisis ton <span className="text-gold-gradient">terrain</span>
              </>
            }
            description="Une seule plateforme, un seul compte, deux façons de jouer avec la communauté."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {UNIVERSES.map((universe, position) => (
            <Reveal key={universe.href} delay={position * 0.12} className="h-full">
              <Link
                href={universe.href}
                data-univers={universe.univers}
                className="block h-full"
                aria-label={`${universe.game} : ${universe.title}`}
              >
                <TacticalCard interactive cut={28} className="h-full" innerClassName="holo overflow-hidden p-7 sm:p-10">
                  {/* Image du jeu, très assombrie pour garder le texte lisible */}
                  <Image
                    src={universe.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-center opacity-30 transition-opacity duration-500 group-hover/card:opacity-45"
                  />
                  <span aria-hidden className="absolute inset-0 bg-linear-to-r from-ink-800 via-ink-800/85 to-ink-800/30" />
                  {/* Filigrane et faisceau décoratifs */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[11rem] font-black leading-none text-outline opacity-40 transition-opacity duration-500 group-hover/card:opacity-80 sm:text-[14rem]"
                  >
                    {universe.watermark}
                  </span>
                  <span aria-hidden className="absolute -right-10 top-0 h-full w-28 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />

                  <div className="relative">
                    <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
                      {universe.index} <span className="mx-1.5 text-white/25">/</span> {universe.game}
                    </p>
                    <h3 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{universe.title}</h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">{universe.text}</p>

                    <ul className="mt-7 space-y-3">
                      {universe.points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm text-white/80">
                          <LuCheck aria-hidden className="h-4 w-4 shrink-0 text-gold" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-9 inline-flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.14em] text-gold">
                      {universe.cta}
                      <LuArrowRight aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                    </p>
                  </div>
                </TacticalCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
