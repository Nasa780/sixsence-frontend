import Link from "next/link";
import { cn } from "../../lib/cn";

/** Emblème : un œil (le "sixième sens") dans un hexagone (six côtés). */
export function LogoMark({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path d="M16 2 28 9v14L16 30 4 23V9L16 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M8 16c2.4-3.4 5-5 8-5s5.6 1.6 8 5c-2.4 3.4-5 5-8 5s-5.6-1.6-8-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 13.2 18.8 16 16 18.8 13.2 16 16 13.2Z" fill="currentColor" />
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
