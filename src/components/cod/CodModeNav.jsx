import Link from "next/link";
import { useRouter } from "next/router";
import { LuCrosshair, LuShield, LuTrophy } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";

/**
 * Les trois sections COD, bien séparées : le Classé (joueurs, en solo), la Division (équipes) et le
 * Tournoi de fin de saison. Chaque section a ses pages ; codModeOf() dit à quelle section appartient une page.
 */
export const COD_MODES = [
  {
    key: "classe",
    label: "Classé",
    icon: LuCrosshair,
    href: "/cod/ranked",
    links: [
      { href: "/cod/ranked", label: "File classée" },
      { href: "/cod/leaderboard", label: "Classement" },
      { href: "/cod/profile", label: "Mon profil" },
    ],
  },
  {
    key: "team",
    label: "Division",
    icon: LuShield,
    href: "/cod/division",
    links: [
      { href: "/cod/division", label: "File Division" },
      { href: "/cod/equipes", label: "Classement" },
      { href: "/cod/equipe", label: "Mon équipe" },
    ],
  },
  {
    key: "tournoi",
    label: "Tournoi",
    icon: LuTrophy,
    href: "/cod/tournoi",
    links: [{ href: "/cod/tournoi", label: "Tableau" }],
  },
];

/** Section d'une page COD (« classe », « team », « tournoi »), ou null (hub, pages hors COD). */
export function codModeOf(pathname) {
  if (!MATCH_TEAM_ENABLED) return null;
  if (pathname.startsWith("/cod/tournoi")) return "tournoi";
  if (pathname === "/cod/equipe" || pathname === "/cod/division" || pathname.startsWith("/cod/equipes") || pathname.startsWith("/invite/equipe")) return "team";
  if (pathname.startsWith("/cod/ranked") || pathname.startsWith("/cod/leaderboard") || pathname.startsWith("/cod/profile") || pathname.startsWith("/cod/match") || pathname.startsWith("/invite/groupe")) {
    return "classe";
  }
  return null;
}

/** Sélecteur « Classé | Division | Tournoi » et pages de la section en cours, sous l'en-tête des pages COD. */
/** Sélecteur affiché sur les pages COD (false pour le masquer, code gardé). */
const SHOW_MODE_NAV = true;

export function CodModeNav({ className = "" }) {
  const { pathname } = useRouter();
  const mode = codModeOf(pathname);
  if (!SHOW_MODE_NAV || !mode) return null;
  const current = COD_MODES.find((item) => item.key === mode);

  return (
    <nav aria-label="Sections Call of Duty" className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6", className)}>
      <div className="inline-flex w-fit gap-1 bg-white/[0.04] p-1 clip-slant [--slant:12px]">
        {COD_MODES.map((item) => {
          const active = item.key === mode;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "clip-slant inline-flex items-center gap-2 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors [--slant:10px] sm:text-base",
                active ? "bg-gold text-ink" : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon aria-hidden className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {current.links.map((link) => {
          const active = pathname === link.href || (link.href !== "/cod/equipes" && pathname.startsWith(`${link.href}/`));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 font-tech text-[11px] uppercase tracking-[0.22em] transition-colors",
                  active ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
