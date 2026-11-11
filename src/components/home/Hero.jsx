import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight } from "react-icons/lu";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import { signInWithDiscord } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { GoldParticles } from "../effects/GoldParticles";
import { ScrambleText } from "../effects/ScrambleText";
import { useGta6Countdown } from "../gta/Gta6Countdown";
import { Button, ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";

/**
 * Les visages de l'affiche, de gauche à droite, chacun dans la couleur de son mode (data-univers). `x` cadre le visage
 * dans la colonne (object-position horizontal). Sans la Division, l'affiche n'a que deux colonnes. Images servies en
 * pleine taille (sizes 1280px) : en couverture dans une colonne haute, elles s'affichent bien plus larges qu'elle.
 */
const CAST = [
  ...(MATCH_TEAM_ENABLED
    ? [{ key: "division", univers: "division", role: "Dans le rôle de l'équipe", name: "Division 4v4", short: "Division", href: "/cod/division", image: "/images/modes/division.jpg", x: "62%" }]
    : []),
  ...(MATCH_TEAM_ENABLED
    ? [{ key: "tournoi", univers: "tournoi", role: "Dans le rôle du champion", name: "Tournoi · Horus et Anubis", short: "Tournoi", href: "/cod/tournoi", image: "/images/modes/tournoi.webp", x: "32%" }]
    : []),
  { key: "classe", univers: "classe", role: "Dans le rôle du solo", name: "Classé", short: "Classé", href: "/cod/ranked", image: "/images/modes/classe.webp", x: "42%" },
];

/**
 * Premier écran de l'accueil, façon affiche de film (2026-11-11) : les visages des modes côte à côte, le titre
 * « Ton nom en haut de l'affiche », et en bas un générique d'affiche. Aucun mouvement au défilement : une apparition
 * en cascade (classe hero-in) et quelques particules dorées. La bande « En direct » suit, sous l'écran (LiveBand).
 */
export function Hero() {
  const { session, loading } = useSession();
  const { label: season } = useSeasons();
  // null une fois GTA 6 sorti : les textes ne parlent plus de la date à venir.
  const released = useGta6Countdown() === null;

  // Chaque élément arrive 90 ms après le précédent (animation CSS, sans attendre le JavaScript).
  const step = (index) => ({ animationDelay: `${150 + index * 90}ms` });
  const gta = released ? "Et GTA 6 avec toute la communauté." : "Et dès le 19 novembre, GTA 6 avec toute la communauté.";

  return (
    <section aria-labelledby="titre-accueil" className="relative isolate flex min-h-[max(100svh,46rem)] flex-col justify-end overflow-hidden bg-black pb-24 pt-24 sm:pb-12">
      {/* --- Les visages ----------------------------------------------------- */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 -z-30 grid h-[74%] lg:h-full",
          CAST.length === 3 ? "grid-cols-[1fr_1.15fr_1fr]" : "grid-cols-2",
        )}
      >
        {CAST.map((cast, index) => (
          <div key={cast.key} className={cn("relative overflow-hidden", index > 0 && "shadow-[-1px_0_0_rgba(212,175,55,0.5)]")}>
            <Image
              src={cast.image}
              alt=""
              fill
              priority
              sizes="1280px"
              className="origin-top scale-110 object-cover brightness-[0.86] contrast-[1.08] saturate-[0.9]"
              style={{ objectPosition: `${cast.x} 0%` }}
            />
          </div>
        ))}
      </div>
      {/* Noir en haut (menu) et en bas (texte), visages au milieu */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(10,10,10,0.8)_0%,rgba(10,10,10,0)_14%,rgba(10,10,10,0)_30%,rgba(10,10,10,0.86)_52%,#0a0a0a_70%)] lg:bg-[linear-gradient(180deg,rgba(10,10,10,0.75)_0%,rgba(10,10,10,0)_16%,rgba(10,10,10,0)_38%,rgba(10,10,10,0.82)_66%,#0a0a0a_94%)]" />
      <GoldParticles id="particules-hero" density={50} linked={false} className="-z-10" />

      {/* --- Les rôles, en haut de chaque visage ------------------------------ */}
      <div className={cn("absolute inset-x-0 top-20 grid sm:top-28", CAST.length === 3 ? "grid-cols-[1fr_1.15fr_1fr]" : "grid-cols-2")}>
        {CAST.map((cast) => (
          <Link key={cast.key} href={cast.href} data-univers={cast.univers} className="group flex flex-col gap-1.5 px-3 sm:px-6 lg:px-10">
            <span aria-hidden className="mb-1 h-[3px] w-5 bg-gold transition-all duration-500 group-hover:w-10 sm:w-7" />
            <span className="hidden font-tech text-[10px] uppercase tracking-[0.3em] text-white/55 lg:block">{cast.role}</span>
            <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors group-hover:text-gold-light sm:text-base lg:text-xl lg:font-black">
              <span className="lg:hidden">{cast.short}</span>
              <span className="hidden lg:inline">{cast.name}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* --- Titre et appel ---------------------------------------------------- */}
      <Container>
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div>
            <span
              style={step(0)}
              className="hero-in clip-slant inline-flex items-center gap-2 bg-ember px-3.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-[0.22em] text-[#130503] [--slant:7px] sm:text-[11px]"
            >
              <span aria-hidden>●</span>
              {season} · MW4 + GTA VI
            </span>
            <h1 id="titre-accueil" className="mt-4 font-display font-black uppercase sm:mt-6">
              <span style={step(1)} className="hero-in block whitespace-nowrap text-[clamp(5.5rem,25vw,14.5rem)] leading-[0.8]">
                <span className="text-gold-gradient">
                  <ScrambleText text="Ton nom" fromBlank={false} delay={0.25} duration={0.9} />
                </span>
              </span>
              <span style={step(2)} className="hero-in mt-1 block max-w-[11ch] text-[clamp(3rem,13vw,7rem)] leading-[0.88] sm:mt-2">
                en haut de l&apos;affiche.
              </span>
            </h1>
          </div>

          <div style={step(3)} className="hero-in max-w-xl xl:w-[23rem] xl:shrink-0 xl:pb-3">
            <p className="text-[15px] leading-relaxed text-white/70 sm:text-lg">
              {MATCH_TEAM_ENABLED ? "Le classé en solo, la Division en 4v4, un tournoi chaque semaine. " : "Le classé en solo, du 2v2 au 5v5. "}
              {gta}
            </p>
            <div className="mt-6 flex gap-3 sm:mt-8">
              {/* Tant que la session n'est pas lue, le bouton connecte (cas le plus fréquent) puis mène à MW4. */}
              {!loading && session ? (
                <ButtonLink href="/cod" size="lg" className="flex-1 sm:flex-none">
                  <span className="sm:hidden">Jouer</span>
                  <span className="hidden sm:inline">Jouer maintenant</span>
                  <LuArrowRight aria-hidden className="h-5 w-5" />
                </ButtonLink>
              ) : (
                <Button size="lg" onClick={() => signInWithDiscord("/cod")} className="flex-1 sm:flex-none">
                  <FaDiscord aria-hidden className="h-5 w-5" />
                  <span className="sm:hidden">Jouer</span>
                  <span className="hidden sm:inline">Jouer maintenant</span>
                </Button>
              )}
              <ButtonLink href={MATCH_TEAM_ENABLED ? "/cod/tournoi" : "/gta6"} variant="outline" size="lg" className="flex-1 sm:flex-none">
                {MATCH_TEAM_ENABLED ? "Les tournois" : "GTA 6"}
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Générique d'affiche */}
        <div style={step(4)} className="hero-in mt-8 sm:mt-12">
          <span aria-hidden className="block h-px bg-linear-to-r from-ember via-gold/50 to-white/5" />
          <p className="mt-4 text-center font-display text-[11px] font-semibold uppercase leading-[1.8] tracking-[0.2em] text-white/40 sm:text-[15px] sm:tracking-[0.24em]">
            SixSence présente <b className="font-black text-white/80">une saison classée</b>
            {MATCH_TEAM_ENABLED ? (
              <>
                {" "}
                avec <b className="font-black text-white/80">la Coupe Horus</b> et <b className="font-black text-white/80">la Coupe Anubis</b>
              </>
            ) : null}
            <span className="text-gold"> · 9 rangs · 1 légende · </span>
            et <b className="font-black text-white/80">GTA VI</b> le 19.11.2026
          </p>
        </div>
      </Container>
    </section>
  );
}
