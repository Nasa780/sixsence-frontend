import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { DISCORD_INVITE_URL } from "../../lib/config";
import { CountUp } from "../effects/CountUp";
import { Reveal } from "../effects/Reveal";
import { SectionTrace } from "../effects/SectionTrace";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * Accueil (2026-11-12) : le serveur Discord, avec ses membres en ligne et son nombre de membres lus en direct
 * (`/api/discord`, relu toutes les 5 minutes). Sans chiffres (Discord injoignable), le bloc reste, sans compteurs.
 */
export function DiscordLive() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/discord")
        .then((answer) => (answer.ok ? answer.json() : null))
        .then((data) => alive && data?.members && setCounts(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 300_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section aria-labelledby="titre-discord" className="relative py-20 sm:py-28">
      <SectionTrace />
      <Container>
        <Reveal>
          <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(88,101,242,0.28),transparent_60%)]" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-[#8f9bff] sm:text-xs">La communauté</p>
                <h2 id="titre-discord" className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] sm:text-6xl">
                  Le QG est sur Discord
                </h2>
                <p className="mt-4 max-w-md text-white/65">Annonces des coupes, recherche d’équipe, résultats des matchs et soirées GTA 6.</p>
                <div className="mt-7">
                  <ButtonLink href={DISCORD_INVITE_URL} external size="lg" className="w-full sm:w-auto">
                    <FaDiscord aria-hidden className="h-5 w-5" />
                    Rejoindre le serveur
                  </ButtonLink>
                </div>
              </div>
              {counts ? (
                <div className="flex gap-8 md:flex-col md:gap-5 md:border-l md:border-white/10 md:pl-10">
                  {counts.online ? (
                    <div>
                      <p className="flex items-center gap-2.5 font-display text-5xl font-black leading-none sm:text-6xl">
                        <span aria-hidden className="discord-dot h-3 w-3 rounded-full bg-emerald-400" />
                        <CountUp value={counts.online} />
                      </p>
                      <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.24em] text-white/55">en ligne maintenant</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="font-display text-5xl font-black leading-none text-white/85 sm:text-6xl">
                      <CountUp value={counts.members} />
                    </p>
                    <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.24em] text-white/55">membres</p>
                  </div>
                </div>
              ) : null}
            </div>
          </TacticalCard>
        </Reveal>
      </Container>
    </section>
  );
}
