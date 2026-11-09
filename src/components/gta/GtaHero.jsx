import Image from "next/image";
import { LuCalendarDays, LuChevronDown } from "react-icons/lu";
import { GTA6_RELEASE } from "../../lib/config";
import { GoldParticles } from "../effects/GoldParticles";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { Gta6Countdown } from "./Gta6Countdown";

const releaseDay = new Date(GTA6_RELEASE).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

/**
 * Premier écran de la page GTA 6, sur le modèle de l'accueil : image plein cadre qui zoome lentement, particules
 * coucher de soleil, faisceaux, grand « VI » en contour, titre, compte à rebours géant et accès au programme.
 * Les couleurs suivent l'univers GTA (data-univers="gta" posé par _app.js sur les pages /gta6).
 */
export function GtaHero() {
  // Apparition en cascade (classe hero-in de globals.css), comme l'accueil.
  const step = (index) => ({ animationDelay: `${150 + index * 90}ms` });

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-24">
      {/* --- Décor --------------------------------------------------------- */}
      <div aria-hidden className="absolute inset-0 -z-40 overflow-hidden">
        <Image src="/images/gta6.webp" alt="" fill priority sizes="100vw" className="ken-burns object-cover object-center opacity-70" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/90 via-ink/70 to-ink/40 sm:bg-linear-to-r sm:from-ink sm:via-ink/75 sm:to-ink/10" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink to-transparent" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_75%_25%,color-mix(in_srgb,var(--color-gold)_20%,transparent),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-30 bg-grid mask-fade opacity-70" />
      <GoldParticles id="particules-gta" density={80} palette="gta" className="-z-20" />

      {/* Faisceaux diagonaux */}
      <div aria-hidden className="absolute -top-1/4 right-[16%] -z-10 h-[150%] w-56 -skew-x-[24deg] bg-linear-to-b from-gold/18 via-gold/5 to-transparent lg:w-96" />
      <div aria-hidden className="absolute -top-1/4 right-[10%] -z-10 h-[150%] w-px -skew-x-[24deg] bg-linear-to-b from-gold/70 via-gold/20 to-transparent" />

      {/* Grand « VI » en contour */}
      <div aria-hidden className="pointer-events-none absolute -right-4 -bottom-10 -z-10 hidden select-none font-display text-[30rem] font-black leading-[0.75] text-outline opacity-60 lg:block">
        VI
      </div>

      {/* Balayage holographique et fondu vers la suite de la page */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 animate-scan bg-linear-to-b from-transparent via-gold/6 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-ink to-transparent" />

      {/* --- Contenu ------------------------------------------------------- */}
      <Container>
        <div className="max-w-4xl">
          <div style={step(0)} className="hero-in inline-flex items-center gap-3 border border-gold/30 bg-gold/8 px-4 py-2">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold shadow-[0_0_10px_var(--color-gold)]" />
            <span className="font-tech text-[10px] font-medium uppercase tracking-[0.3em] text-gold sm:text-[11px]">GTA 6 · sortie le {releaseDay}</span>
          </div>

          <h1 style={step(1)} className="hero-in mt-6 font-display text-[clamp(3.75rem,13vw,10.5rem)] font-black uppercase leading-[0.82] tracking-tight">
            Les rues sont <span className="text-gold-gradient">à nous</span>
          </h1>

          <p style={step(2)} className="hero-in mt-6 flex max-w-3xl items-center gap-4">
            <span aria-hidden className="h-0.5 w-8 shrink-0 bg-linear-to-l from-gold-light to-gold/0 shadow-[0_0_10px_color-mix(in_srgb,var(--color-gold-light)_55%,transparent)] sm:w-14" />
            <span className="font-tech text-[11px] font-medium uppercase tracking-[0.32em] text-gold-light sm:text-sm">La communauté SixSence débarque</span>
            <span aria-hidden className="h-0.5 max-w-56 flex-1 bg-linear-to-r from-gold-light to-gold/0 shadow-[0_0_10px_color-mix(in_srgb,var(--color-gold-light)_55%,transparent)]" />
          </p>

          <p style={step(3)} className="hero-in mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Sessions organisées, courses, braquages en équipe : consulte le programme et réserve ta place. Les places sont comptées.
          </p>

          <div style={step(4)} className="hero-in mt-8">
            <Gta6Countdown hero />
          </div>

          <div style={step(5)} className="hero-in mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="#programme" size="lg">
              Voir le programme
              <LuChevronDown aria-hidden className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/calendrier" variant="outline" size="lg">
              <LuCalendarDays aria-hidden className="h-5 w-5" />
              M&apos;abonner au calendrier
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
