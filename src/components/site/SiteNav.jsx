import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useUser from "../../hooks/useUser";
import { signInWithDiscord, signOut } from "../../lib/auth";
import { Avatar } from "./ui";

/**
 * Barre de navigation commune à tout le site, reprise de la barre de la page
 * Ranked (logo SIXSENCE, liens Inter gris, lien actif bleu souligné, bouton
 * Discord). Sur mobile, les liens passent dans un menu déroulant.
 */
export const NAV_LINKS = [
  { key: "accueil", label: "Accueil", href: "/accueil" },
  { key: "cod", label: "COD", href: "/cod" },
  { key: "ranked", label: "Ranked", href: "/cod/ranked" },
  { key: "leaderboard", label: "Classement", href: "/cod/leaderboard" },
  { key: "gta6", label: "GTA 6", href: "/gta6" },
  { key: "founders", label: "Fondateurs", href: "/founders" },
  { key: "partners", label: "Partenaires", href: "/partners" },
];

export function Logo() {
  return (
    <Link href="/" className="flex flex-col items-start no-underline text-white font-[Rajdhani]">
      <span className="tracking-[3.6px] leading-5 uppercase font-bold text-xl max-sm:text-base max-sm:leading-4">
        SIXSENCE
      </span>
      <span className="text-[9px] text-[#ffa040] tracking-[1.98px] leading-[9px] uppercase font-medium whitespace-nowrap">
        Competitive Platform
      </span>
    </Link>
  );
}

export function DiscordButton({ label = "Discord", next, className = "" }) {
  return (
    <button
      onClick={() => signInWithDiscord(next)}
      className={`cursor-pointer [border:none] py-2 px-[18px] bg-[#5865f2] flex items-center gap-[7px] hover:bg-[#7080ff] ${className}`}
    >
      <Image className="h-4 w-4" width={16} height={16} alt="" src="/assets/Icondiscord2.svg" />
      <span className="text-sm tracking-[0.28px] leading-[21px] font-semibold font-[Inter] text-white">{label}</span>
    </button>
  );
}

/** Pastille du joueur connecté, avec un petit menu (profil, déconnexion). */
export function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="cursor-pointer flex items-center gap-3 bg-[#1a1b22] px-3 py-2 rounded-md border border-solid border-[#333]"
      >
        <Avatar src={user.avatar} name={user.username} size={28} />
        <span className="text-sm font-semibold text-white font-[Inter] max-w-[140px] truncate">{user.username}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 z-50 rounded-md bg-[#0d1522] border border-solid border-[rgba(26,107,220,0.25)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden font-[Inter] text-sm">
          <Link href="/cod/profile" className="block px-4 py-2.5 text-[#c5d8f0] no-underline hover:bg-[rgba(26,107,220,0.12)]">
            Mon profil
          </Link>
          <Link href="/cod/ranked" className="block px-4 py-2.5 text-[#c5d8f0] no-underline hover:bg-[rgba(26,107,220,0.12)]">
            Jouer en classé
          </Link>
          <button
            onClick={signOut}
            className="cursor-pointer w-full text-left px-4 py-2.5 bg-transparent [border:none] text-[#fecaca] hover:bg-[rgba(220,38,38,0.1)]"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

export default function SiteNav({ active = "" }) {
  const user = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-[rgba(8,12,20,0.92)] backdrop-blur border-b border-solid border-[rgba(26,107,220,0.18)] text-white font-[Rajdhani]">
      <div className="mx-auto max-w-[1200px] h-16 flex items-center justify-between gap-5 px-6 max-sm:px-4">
        <Logo />

        {/* Liens (ordinateur) */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-[#94a3b8] font-[Inter]">
          {NAV_LINKS.map((link) => {
            const isActive = link.key === active;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`py-1.5 px-3 tracking-[0.28px] leading-[21px] font-medium no-underline whitespace-nowrap ${
                  isActive
                    ? "text-[#1a6bdc] border-b-2 border-solid border-[#1a6bdc]"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? <UserMenu user={user} /> : <DiscordButton />}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((value) => !value)}
            className="md:hidden cursor-pointer bg-transparent [border:none] p-2 text-[#94a3b8]"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Liens (mobile) */}
      {menuOpen && (
        <nav className="md:hidden border-t border-solid border-[rgba(26,107,220,0.18)] px-4 py-2 font-[Inter] text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 no-underline ${link.key === active ? "text-[#1a6bdc]" : "text-[#94a3b8]"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
