import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";
import { DISCORD_INVITE_URL } from "../../lib/config";
import { Container } from "../ui/Container";
import { Logo } from "../ui/Logo";

const COLUMNS = [
  {
    title: "Jeux",
    links: [
      { href: "/cod", label: "Call of Duty" },
      { href: "/cod/ranked", label: "File classée" },
      { href: "/cod/leaderboard", label: "Classement" },
      { href: "/gta6", label: "GTA 6" },
      { href: "/gta6/events", label: "Événements" },
    ],
  },
  {
    title: "SixSence",
    links: [
      { href: "/founders", label: "Fondateurs" },
      { href: "/partners", label: "Partenaires" },
      { href: "/cod/profile", label: "Mon profil" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-800">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />

      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
            La plateforme multigaming de la communauté : classé Call of Duty en 5v5 et événements GTA 6, avec un seul accès,
            ton compte Discord.
          </p>
          {DISCORD_INVITE_URL ? (
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light"
            >
              <FaDiscord aria-hidden className="h-4 w-4" />
              Rejoindre le Discord
            </a>
          ) : null}
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-white/8">
        <Container className="flex flex-col gap-3 py-6 text-xs leading-relaxed text-white/40 md:flex-row md:items-start md:justify-between">
          <p>© {new Date().getFullYear()} SixSence. Tous droits réservés.</p>
          <p className="max-w-2xl md:text-right">
            SixSence est une plateforme communautaire indépendante, sans lien avec Activision, Rockstar Games, Take-Two
            Interactive ou Discord. Call of Duty et Grand Theft Auto sont des marques de leurs propriétaires respectifs.
          </p>
        </Container>
      </div>
    </footer>
  );
}
