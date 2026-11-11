import Image from "next/image";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight } from "react-icons/lu";
import useSession from "../../hooks/useSession";
import { signInWithDiscord } from "../../lib/auth";
import { GoldParticles } from "../effects/GoldParticles";
import { Button, ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { LiveBand } from "./LiveBand";
import { ScrambleText } from "../effects/ScrambleText";

/**
 * Écran d'accueil : photo de la porte de l'arène à droite, particules dorées, grand titre, appel à la connexion Discord ; en bas, la bande « En direct »
 * qui défile (activité du moment, sinon ce qui arrive).
 */
export function Hero() {
  const { session, loading } = useSession();

  // Apparition en cascade, en CSS (classe hero-in de globals.css) : elle démarre dès l'affichage, sans attendre le
  // JavaScript ; chaque élément arrive 90 ms après le précédent.
  const step = (index) => ({ style: { animationDelay: `${150 + index * 90}ms` } });

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-32">
      {/* --- Décor --------------------------------------------------------- */}
      {/* Photo : porte de l'arène qui s'ouvre (tiers gauche sombre, sous le texte), fondue dans le noir sur les bords. */}
      <div aria-hidden className="absolute inset-0 -z-40">
        <Image src="/images/accueil/porte-arene.webp" alt="" fill priority sizes="100vw" className="object-cover object-[76%_center] opacity-55 sm:object-[70%_center] sm:opacity-60" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/90 via-ink/75 to-ink/20 sm:bg-linear-to-r sm:from-ink sm:via-ink/70 sm:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink to-transparent" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade" />
      <GoldParticles id="particules-hero" density={90} className="-z-20" />

      {/* Faisceaux diagonaux */}
      <div aria-hidden className="absolute -top-1/4 right-[12%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/14 via-gold/4 to-transparent lg:w-96" />
      <div aria-hidden className="absolute -top-1/4 right-[8%] -z-10 h-[150%] w-px -skew-x-[24deg] bg-linear-to-b from-gold/70 via-gold/20 to-transparent" />
      <div aria-hidden className="absolute -top-1/4 right-[38%] -z-10 hidden h-[150%] w-px -skew-x-[24deg] bg-linear-to-b from-white/20 to-transparent lg:block" />

      {/* Grand chiffre en contour */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-0 -z-10 hidden select-none font-display text-[26rem] font-black leading-[0.75] text-outline opacity-50 lg:block"
      >
        06
      </div>

      {/* Balayage holographique */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 animate-scan bg-linear-to-b from-transparent via-gold/6 to-transparent" />

      {/* Fondu vers la section suivante */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-ink to-transparent" />

      {/* --- Contenu ------------------------------------------------------- */}
      <Container>
        <div className="max-w-4xl">
          <div style={step(0).style} className="hero-in inline-flex items-center gap-3 border border-gold/30 bg-gold/8 px-4 py-2">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold shadow-[0_0_10px_var(--color-gold)]" />
            <span className="font-tech text-[10px] font-medium uppercase tracking-[0.3em] text-gold sm:text-[11px]">
              Plateforme gaming
            </span>
          </div>

          <h1
            style={step(1).style}
            className="hero-in mt-6 font-display text-[clamp(4.25rem,17vw,12.5rem)] font-black uppercase leading-[0.8] tracking-tight"
          >
            <ScrambleText text="Six" fromBlank={false} delay={0.25} duration={0.9} />
            <span className="text-gold-gradient">
              <ScrambleText text="Sence" fromBlank={false} delay={0.4} duration={1} />
            </span>
          </h1>

          <p style={step(2).style} className="hero-in mt-5 flex max-w-3xl items-center gap-4">
            <span aria-hidden className="gold-line h-[2px] w-8 shrink-0 bg-linear-to-l from-gold-light to-gold/0 sm:w-14" />
            <span className="font-tech text-[11px] font-medium uppercase tracking-[0.32em] text-gold-light sm:text-sm">Le sixième sens du jeu compétitif</span>
            <span aria-hidden className="gold-line h-[2px] max-w-56 flex-1 bg-linear-to-r from-gold-light to-gold/0" />
          </p>

          <p style={step(3).style} className="hero-in mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            {MATCH_TEAM_ENABLED
              ? "Grimpe seul au classement de Call of Duty en partie classée, monte ton équipe en Division et vise le tournoi de fin de saison. Côté GTA 6, rejoins les événements à venir de la communauté."
              : "Files classées Call of Duty du 2v2 au 5v5 en solo, matchmaking automatique, classement en direct et événements GTA 6. Un seul accès : ton compte Discord."}
          </p>

          <div style={step(4).style} className="hero-in mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Tant que la session n'est pas lue, on montre le bouton de connexion (cas le plus fréquent). */}
            {!loading && session ? (
              <ButtonLink href="/cod" size="lg">
                Entrer dans l&apos;arène
                <LuArrowRight aria-hidden className="h-5 w-5" />
              </ButtonLink>
            ) : (
              <Button size="lg" onClick={() => signInWithDiscord("/cod")}>
                <FaDiscord aria-hidden className="h-5 w-5" />
                Se connecter avec Discord
              </Button>
            )}
            <ButtonLink href="#univers" variant="outline" size="lg">
              Découvrir
              <LuChevronRight aria-hidden className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </Container>

      <LiveBand />
    </section>
  );
}
