import Head from "next/head";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuCalendarDays, LuTicket, LuUsers } from "react-icons/lu";
import { Reveal } from "../../components/effects/Reveal";
import { EventCard } from "../../components/gta/EventCard";
import { FeaturedEvent } from "../../components/gta/FeaturedEvent";
import { GtaHero } from "../../components/gta/GtaHero";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { Loading } from "../../components/ui/Feedback";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { SectionHeading } from "../../components/ui/Typography";
import useGtaEvents from "../../hooks/useGtaEvents";
import { cn } from "../../lib/cn";
import { DISCORD_INVITE_URL } from "../../lib/config";

const PILLARS = [
  { icon: LuCalendarDays, title: "Un planning clair", text: "Toutes les sessions à venir au même endroit, avec date, heure et lieu de rendez-vous." },
  { icon: LuTicket, title: "Inscription en un clic", text: "Réserve ta place, ou libère-la si tu as un empêchement : quelqu'un d'autre en profitera." },
  { icon: LuUsers, title: "Des places comptées", text: "Chaque événement affiche sa jauge et la liste des inscrits, à jour en permanence." },
];

/** Nombre d'événements affichés sous l'événement phare (le reste est sur /gta6/events). */
const PROGRAM_SIZE = 6;

/**
 * Hub GTA 6 (refait le 2026-11-09 pour la sortie du jeu) : premier écran plein cadre avec le compte à rebours,
 * événement phare (le prochain), programme filtrable par catégorie, puis « comment ça marche ». Public.
 */
export default function GtaHubPage() {
  const { events, mine } = useGtaEvents("upcoming");
  const [category, setCategory] = useState(null);

  const upcoming = (events || []).filter((event) => event.status !== "cancelled");
  const [featured, ...others] = upcoming;
  // Catégories saisies dans l'admin (session, course, braquage…), dans l'ordre d'apparition.
  const categories = [...new Set(others.map((event) => event.category).filter(Boolean))];
  const program = others.filter((event) => !category || event.category === category).slice(0, PROGRAM_SIZE);

  return (
    <>
      <Head>
        <title>GTA 6 — SixSence</title>
      </Head>

      <GtaHero />

      <Container className="space-y-24 py-16">
        <section id="programme" aria-labelledby="titre-programme" className="scroll-mt-24">
          <Reveal>
            <SectionHeading
              eyebrow="Planning des événements"
              title={
                <span id="titre-programme">
                  Le <span className="text-gold-gradient">programme</span>
                </span>
              }
            />
          </Reveal>

          <div className="mt-10 space-y-8">
            {events === null ? (
              <Loading />
            ) : !featured ? (
              <Reveal>
                <TacticalCard highlight cut={26} innerClassName="holo flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                  <div className="max-w-xl">
                    <p className="font-display text-4xl font-black uppercase leading-none sm:text-5xl">
                      Le programme <span className="text-gold-gradient">arrive</span>
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-white/65">
                      Les premiers événements seront annoncés ici et sur le Discord. Rejoins le serveur pour être prévenu dès
                      l&apos;ouverture des inscriptions.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-3">
                    {DISCORD_INVITE_URL ? (
                      <ButtonLink href={DISCORD_INVITE_URL} external>
                        <FaDiscord aria-hidden className="h-5 w-5" />
                        Rejoindre le Discord
                      </ButtonLink>
                    ) : null}
                    <ButtonLink href="/calendrier" variant="outline">
                      <LuCalendarDays aria-hidden className="h-5 w-5" />
                      Calendrier
                    </ButtonLink>
                  </div>
                </TacticalCard>
              </Reveal>
            ) : (
              <>
                <Reveal>
                  <FeaturedEvent event={featured} registered={mine.has(featured.id)} />
                </Reveal>

                {others.length ? (
                  <div className="space-y-6">
                    {categories.length > 1 ? (
                      <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
                        {[null, ...categories].map((value) => (
                          <button
                            key={value ?? "tout"}
                            type="button"
                            aria-pressed={category === value}
                            onClick={() => setCategory(value)}
                            className={cn(
                              "clip-slant px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors",
                              category === value ? "bg-gold text-ink" : "bg-white/8 text-white/70 hover:text-white",
                            )}
                          >
                            {value ?? "Tout"}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {program.map((event) => (
                        <EventCard key={event.id} event={event} registered={mine.has(event.id)} />
                      ))}
                    </div>
                  </div>
                ) : null}

                <ButtonLink href="/gta6/events" variant="outline">
                  Tout le planning
                  <LuArrowRight aria-hidden className="h-5 w-5" />
                </ButtonLink>
              </>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <div className="border-t border-gold/40 pt-6">
                <pillar.icon aria-hidden className="h-8 w-8 text-gold" />
                <h2 className="mt-5 font-display text-3xl font-bold uppercase leading-none tracking-wide">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
