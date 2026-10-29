import Link from "next/link";
import { FaDiscord, FaTiktok } from "react-icons/fa6";
import { DISCORD_INVITE_URL, MATCH_TEAM_ENABLED, TIKTOK_URL } from "../../lib/config";
import { Container } from "../ui/Container";
import { Logo } from "../ui/Logo";

const COLUMNS = [
  {
    title: "Jeux",
    links: [
      { href: "/cod", label: "MW4", univers: "or", bold: true },
      { href: "/gta6", label: "GTA VI", univers: "gta", bold: true },
    ],
  },
  {
    title: "SixSence",
    links: [
      { href: "/nouveautes", label: "Nouveautés" },
      { href: "/calendrier", label: "Calendrier" },
      { href: "/renommee", label: "Renommée" },
      { href: "/reglement", label: "Règlement" },
      { href: "/faq", label: "FAQ" },
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
          <p className="mt-5 font-display text-xl font-black uppercase leading-none tracking-wide text-white">Prêt à faire tes preuves ?</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
            {MATCH_TEAM_ENABLED
              ? "Matchs classés en solo sur Call of Duty, championnats Division en équipe, tournois réguliers et événements exclusifs sur GTA 6."
              : "Matchs classés en solo sur Call of Duty et événements exclusifs sur GTA 6."}{" "}
            Connecte simplement ton compte Discord pour rejoindre l&apos;action instantanément.
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
          {TIKTOK_URL ? (
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light"
            >
              <FaTiktok aria-hidden className="h-4 w-4" />
              Suivre sur TikTok
            </a>
          ) : null}
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href} data-univers={link.univers}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${link.bold ? "font-semibold text-white/85" : "text-white/60"} ${link.univers ? "hover:text-gold" : "hover:text-white"}`}
                  >
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
