import Link from "next/link";
import { useRouter } from "next/router";
import { LuArrowRight } from "react-icons/lu";
import { launchPreview, useLaunchWindow } from "../../lib/launch";
import { useGta6Countdown } from "../gta/Gta6Countdown";
import { Container } from "../ui/Container";

const two = (n) => String(n).padStart(2, "0");

/**
 * Bandeau GTA 6 sous le menu (2026-11-17), sur toutes les pages sauf l'accueil et les pages GTA 6 (qui ont déjà leur
 * compte à rebours) : temps restant jusqu'à la sortie, à la seconde, puis « GTA VI est disponible » pendant les 48 h du
 * jour J ; ensuite il disparaît. Mène au programme GTA 6.
 */
export function Gta6Strip() {
  const { pathname } = useRouter();
  const parts = useGta6Countdown();
  const launch = useLaunchWindow();
  if (pathname === "/" || pathname.startsWith("/gta6")) return null;
  // Avant le premier calcul (rien côté serveur), ou après le jour J : pas de bandeau.
  if (parts === undefined) return null;
  const released = parts === null || launchPreview();
  if (released && !launch) return null;
  const [days, hours, minutes, seconds] = parts ?? [];

  return (
    <Link
      href="/gta6"
      data-univers="gta"
      className="group block border-b border-gold/30 bg-[linear-gradient(90deg,rgba(214,36,110,0.32),rgba(255,106,61,0.26)_55%,rgba(255,210,154,0.14))] backdrop-blur-md"
    >
      <Container className="flex h-8 items-center justify-center gap-2.5 text-[11px] sm:gap-3 sm:text-xs">
        <span className="font-tech font-bold uppercase tracking-[0.24em] text-gold-pale">GTA VI</span>
        {released ? (
          <span className="font-display text-sm font-black uppercase tracking-wide text-white">est disponible</span>
        ) : (
          <>
            <span className="hidden text-white/70 sm:inline">sort dans</span>
            <span className="font-tech font-bold tabular-nums text-white" aria-label={`${days.value} jours ${hours.value} heures ${minutes.value} minutes`}>
              {days.value > 0 ? `${days.value} j ` : ""}
              {two(hours.value)}:{two(minutes.value)}:{two(seconds.value)}
            </span>
          </>
        )}
        <span className="inline-flex items-center gap-1 font-tech uppercase tracking-[0.18em] text-gold-light transition-colors group-hover:text-white">
          <span className="hidden sm:inline">Le programme</span>
          <LuArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Container>
    </Link>
  );
}
