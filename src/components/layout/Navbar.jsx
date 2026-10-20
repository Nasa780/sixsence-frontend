import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuCrosshair, LuLogOut, LuMenu, LuShieldCheck, LuUser, LuX } from "react-icons/lu";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { signInWithDiscord, signOut } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { codModeOf } from "../cod/CodModeNav";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { isReferee } from "../../lib/roles";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { InstallButton } from "../ui/InstallButton";
import { Logo } from "../ui/Logo";

const LINKS = [
  { href: "/", label: "Accueil" },
  {
    href: "/cod",
    label: "MW4",
    // Les trois sections COD (seulement si la Division est active).
    children: MATCH_TEAM_ENABLED && [
      { href: "/cod/ranked", label: "Classé", hint: "En solo 2vs2 à 5vs5" },
      { href: "/cod/equipes", label: "Division", hint: "En équipes 4vs4" },
      { href: "/cod/tournoi", label: "Tournoi", hint: "Fin de saison" },
    ],
  },
  { href: "/gta6", label: "GTA 6", univers: "gta" },
  { href: "/founders", label: "Fondateurs" },
  { href: "/partners", label: "Partenaires" },
];

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Barre de navigation fixe : transparente en haut de page, opaque dès qu'on défile. */
export function Navbar() {
  const { pathname } = useRouter();
  const { loading } = useSession();
  const user = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu mobile se referme à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors duration-300",
          scrolled || mobileOpen ? "border-white/10 bg-ink/85 backdrop-blur-md" : "border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden items-center lg:flex">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              const item = (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  data-univers={link.univers}
                  className={cn(
                    "relative px-4 py-2 font-display text-[15px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200",
                    active ? "text-gold" : link.univers ? "text-white/60 hover:text-gold" : "text-white/60 hover:text-white",
                  )}
                >
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-gold shadow-[0_0_10px_var(--color-gold)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                </Link>
              );
              if (!link.children) return item;
              const mode = codModeOf(pathname);
              return (
                <div key={link.href} className="group relative">
                  {item}
                  <div className="invisible absolute left-0 top-full z-10 pt-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="clip-tactical w-64 bg-gold/40 p-px [--cut:12px]">
                      <div className="clip-tactical bg-ink-800 p-2 [--cut:12px]">
                        {link.children.map((child) => {
                          const current = (child.href === "/cod/ranked" && mode === "classe") || (child.href === "/cod/equipes" && mode === "team") || (child.href === "/cod/tournoi" && mode === "tournoi");
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn("block border-l-2 px-3 py-2.5 transition-colors", current ? "border-gold bg-gold/10" : "border-transparent hover:bg-white/[0.06]")}
                            >
                              <span className={cn("block font-display text-base font-bold uppercase tracking-[0.14em]", current ? "text-gold" : "text-white")}>{child.label}</span>
                              <span className="mt-0.5 block text-xs text-white/50">{child.hint}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <InstallButton variant="nav" />
            {/* Zone de largeur fixe pendant le chargement : évite que la barre ne saute. */}
            <div className="hidden min-w-[9rem] justify-end sm:flex">
              {loading ? null : user ? (
                <UserMenu user={user} />
              ) : (
                <Button size="sm" onClick={() => signInWithDiscord()}>
                  <FaDiscord aria-hidden className="h-4 w-4" />
                  Connexion
                </Button>
              )}
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center text-white/80 transition-colors hover:text-gold lg:hidden"
            >
              {mobileOpen ? <LuX aria-hidden className="h-6 w-6" /> : <LuMenu aria-hidden className="h-6 w-6" />}
            </button>
          </div>
        </Container>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-white/10 bg-ink/95 backdrop-blur-md lg:hidden"
          >
            <Container className="flex flex-col py-4">
              <nav aria-label="Navigation mobile" className="flex flex-col">
                {LINKS.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      data-univers={link.univers}
                      className={cn(
                        "border-l-2 px-4 py-3.5 font-display text-xl font-bold uppercase tracking-[0.14em] transition-colors",
                        active ? "border-gold bg-gold/8 text-gold" : "border-transparent text-white/70 hover:text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                }).flatMap((element, index) =>
                  LINKS[index].children
                    ? [
                        element,
                        ...LINKS[index].children.map((child) => {
                          const mode = codModeOf(pathname);
                          const current = (child.href === "/cod/ranked" && mode === "classe") || (child.href === "/cod/equipes" && mode === "team") || (child.href === "/cod/tournoi" && mode === "tournoi");
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "ml-4 border-l-2 px-4 py-2.5 font-display text-base font-bold uppercase tracking-[0.14em] transition-colors",
                                current ? "border-gold text-gold" : "border-white/10 text-white/60 hover:text-white",
                              )}
                            >
                              {child.label}
                              <span className="ml-2 font-sans text-xs font-normal normal-case tracking-normal text-white/40">{child.hint}</span>
                            </Link>
                          );
                        }),
                      ]
                    : [element],
                )}
              </nav>

              <div className="mt-4 border-t border-white/10 pt-4">
                <InstallButton variant="menu" />
                {loading ? null : user ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar src={user.avatar} name={user.username} size={36} />
                      <span className="truncate font-display text-lg font-bold uppercase tracking-wide">{user.username}</span>
                    </div>
                    <Link href="/cod/profile" className="px-4 py-3 text-sm text-white/70 hover:text-gold">
                      Mon profil
                    </Link>
                    <Link href="/cod/ranked" className="px-4 py-3 text-sm text-white/70 hover:text-gold">
                      File classée
                    </Link>
                    {isReferee(user.role) ? (
                      <Link href="/admin" className="px-4 py-3 text-sm text-white/70 hover:text-gold">
                        Administration
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:text-loss"
                    >
                      <LuLogOut aria-hidden className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Button fullWidth onClick={() => signInWithDiscord()}>
                    <FaDiscord aria-hidden className="h-5 w-5" />
                    Connexion Discord
                  </Button>
                )}
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/** Avatar + pseudo, avec un menu déroulant (profil, file classée, déconnexion). */
function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const { pathname } = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Fermeture au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (container.current && !container.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 py-1 pl-1 pr-3 transition-colors hover:bg-white/5"
      >
        <Avatar src={user.avatar} name={user.username} size={34} />
        <span className="max-w-[9rem] truncate font-display text-base font-bold uppercase tracking-[0.1em]">{user.username}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 border border-white/12 bg-ink-800 py-1.5 shadow-2xl shadow-black/60"
          >
            <Link
              role="menuitem"
              href="/cod/profile"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
            >
              <LuUser aria-hidden className="h-4 w-4" />
              Mon profil
            </Link>
            <Link
              role="menuitem"
              href="/cod/ranked"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
            >
              <LuCrosshair aria-hidden className="h-4 w-4" />
              File classée
            </Link>
            {isReferee(user.role) ? (
              <Link
                role="menuitem"
                href="/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
              >
                <LuShieldCheck aria-hidden className="h-4 w-4" />
                Administration
              </Link>
            ) : null}
            <div className="my-1.5 border-t border-white/10" />
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-loss"
            >
              <LuLogOut aria-hidden className="h-4 w-4" />
              Déconnexion
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
