import Link from "next/link";
import { cn } from "../../lib/cn";

/**
 * Logo du site : l'œil d'Horus dans un double hexagone (public/images/logo.png, depuis le 2026-10-21).
 * USE_PNG_LOGO = false : retour à l'ancien emblème SVG (LegacyLogoMark), gardé pour un retour en arrière.
 */
const USE_PNG_LOGO = true;

export function LogoMark({ className = "" }) {
  if (!USE_PNG_LOGO) return <LegacyLogoMark className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/images/logo.png" alt="" aria-hidden width={512} height={512} className={cn("object-contain", className)} />;
}

/**
 * Ancien emblème : un œil (le "sixième sens") dans un double hexagone (six côtés).
 * Les nuances d'or suivent la palette de l'univers (or, ou sunset sur GTA).
 */
function LegacyLogoMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <path d="M32 4 56.25 18v28L32 60 7.75 46V18L32 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M32 10.5 50.6 21.25v21.5L32 53.5 13.4 42.75v-21.5L32 10.5Z"
        className="stroke-gold-dark"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M15 32c5-7 10.5-10.5 17-10.5S44 25 49 32c-5 7-10.5 10.5-17 10.5S20 39 15 32Z"
        className="stroke-gold-light"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32 27.5 36.5 32 32 36.5 27.5 32 32 27.5Z" className="fill-gold-pale" />
    </svg>
  );
}

export function Logo({ className = "" }) {
  return (
    <Link href="/" aria-label="SixSence, retour à l'accueil" className={cn("group flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7 text-gold transition duration-300 group-hover:glow-gold" />
      <span className="font-display text-2xl font-black uppercase leading-none tracking-[0.06em]">
        Six<span className="text-gold">Sence</span>
      </span>
    </Link>
  );
}
