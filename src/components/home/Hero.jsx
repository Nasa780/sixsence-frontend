import { motion, useReducedMotion } from "framer-motion";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight } from "react-icons/lu";
import useSession from "../../hooks/useSession";
import { signInWithDiscord } from "../../lib/auth";
import { GoldParticles } from "../effects/GoldParticles";
import { Button, ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { MATCH_TEAM_ENABLED } from "../../lib/config";

const HUD = [
  { value: "MW4", label: MATCH_TEAM_ENABLED ? "Classé · Division · Tournoi" : "Classé 2v2 à 5v5" },
  { value: "LIVE", label: "File en temps réel" },
  { value: "GTA 6", label: "Événements", univers: "gta" },
];

/** Écran d'accueil : particules dorées, grand titre, appel à la connexion Discord. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const { session, loading } = useSession();

  // Apparition en cascade : chaque enfant arrive 90 ms après le précédent.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };
  const item = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-14">
      {/* --- Décor --------------------------------------------------------- */}
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
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.div variants={item} className="inline-flex items-center gap-3 border border-gold/30 bg-gold/8 px-4 py-2">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold shadow-[0_0_10px_var(--color-gold)]" />
            <span className="font-tech text-[10px] font-medium uppercase tracking-[0.3em] text-gold sm:text-[11px]">
              Plateforme gaming
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[clamp(4.25rem,17vw,12.5rem)] font-black uppercase leading-[0.8] tracking-tight"
          >
            Six<span className="text-gold-gradient">Sence</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 font-display text-2xl font-bold uppercase tracking-[0.12em] text-white/90 sm:text-3xl">
            Le sixième sens du jeu compétitif
          </motion.p>

          <motion.p variants={item} className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            {MATCH_TEAM_ENABLED
              ? "Grimpe seul au classement de Call of Duty en partie classée, monte ton équipe en Division et vise le tournoi de fin de saison. Côté GTA 6, rejoins les événements à venir de la communauté."
              : "Files classées Call of Duty du 2v2 au 5v5 en solo, matchmaking automatique, classement en direct et événements GTA 6. Un seul accès : ton compte Discord."}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
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
          </motion.div>

          <motion.dl variants={item} className="mt-12 grid max-w-2xl grid-cols-3 gap-px bg-white/10 sm:mt-14">
            {HUD.map((entry) => (
              <div key={entry.value} data-univers={entry.univers} className="bg-ink/90 px-3 py-3.5 backdrop-blur-sm sm:px-5 sm:py-4">
                <dt className="sr-only">{entry.label}</dt>
                <dd>
                  <span className="block font-tech text-base font-bold tracking-[0.1em] text-gold sm:text-xl">{entry.value}</span>
                  <span aria-hidden className="mt-1 block text-[11px] leading-tight text-white/50 sm:text-xs">
                    {entry.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </Container>
    </section>
  );
}
