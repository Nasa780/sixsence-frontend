import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";
import { DISCORD_INVITE_URL } from "../../lib/config";
import { Container } from "../ui/Container";
import { Logo } from "../ui/Logo";

const COLUMNS = [
  {
    title: "Jeux",
    links: [
      { href: "/cod", label: "MW4" },
      { href: "/gta6", label: "GTA 6", univers: "gta" },
    ],
  },
  {
    title: "SixSence",
    links: [
      { href: "/cod/profile", label: "Mon profil" },
      { href: "/reglement", label: "Règlement" },
      { href: "/founders", label: "Fondateurs" },
      { href: "/partners", label: "Partenaires" },
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
            La plateforme gaming de la communauté : classé Call of Duty du 2v2 au 5v5 et événements GTA 6, avec un seul accès,
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
                <li key={link.href} data-univers={link.univers}>
                  <Link href={link.href} className={`text-sm text-white/60 transition-colors ${link.univers ? "hover:text-gold" : "hover:text-white"}`}>
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
          <div className="space-y-2">
            <p>© {new Date().getFullYear()} SixSence. Tous droits réservés.</p>
            <nav aria-label="Informations légales" className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/mentions-legales" className="transition-colors hover:text-white">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="transition-colors hover:text-white">
                Confidentialité
              </Link>
              <Link href="/reglement" className="transition-colors hover:text-white">
                Règlement
              </Link>
            </nav>
          </div>
          <p className="max-w-2xl md:text-right">
            SixSence est une plateforme communautaire indépendante, sans lien avec Activision, Rockstar Games, Take-Two
            Interactive ou Discord. Call of Duty et Grand Theft Auto sont des marques de leurs propriétaires respectifs.
          </p>
        </Container>
      </div>
    </footer>
  );
}
