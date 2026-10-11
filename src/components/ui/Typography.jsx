import { cn } from "../../lib/cn";
import { Container } from "./Container";

/** Sur-titre technique en or : "// CLASSÉ COD". */
export function Eyebrow({ children, className = "" }) {
  return (
    <p className={cn("font-tech text-[11px] font-medium uppercase tracking-[0.32em] text-gold", className)}>
      <span aria-hidden className="mr-2 text-gold/50">
        {"//"}
      </span>
      {children}
    </p>
  );
}

/** Titre de section : sur-titre, grand titre condensé, texte d'introduction. */
export function SectionHeading({ eyebrow, title, description = null, center = false, className = "" }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] sm:text-5xl lg:text-6xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">{description}</p> : null}
    </div>
  );
}

/** En-tête des pages intérieures : grille tactique, faisceau doré, grand titre. */
export function PageHeader({ eyebrow, title, description = null, actions = null }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/10 pt-28 pb-10 sm:pt-36 sm:pb-14">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade opacity-80" />
      <div
        aria-hidden
        className="absolute -top-10 right-[8%] -z-10 h-[140%] w-40 -skew-x-[24deg] bg-linear-to-b from-gold/20 via-gold/5 to-transparent sm:w-64"
      />
      <div aria-hidden className="absolute -top-10 right-[2%] -z-10 h-[140%] w-px -skew-x-[24deg] bg-gold/30" />

      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] sm:text-7xl">{title}</h1>
          {description ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </Container>
    </header>
  );
}
