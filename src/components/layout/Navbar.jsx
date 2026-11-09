import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuBell, LuCalendarDays, LuClapperboard, LuChevronDown, LuCircleHelp, LuCrown, LuCrosshair, LuGamepad2, LuHouse, LuIdCard, LuLogOut, LuMenu, LuScrollText, LuShield, LuShieldCheck, LuSparkles, LuSwords, LuTicket, LuTrophy, LuTriangleAlert, LuUser, LuUsers, LuX } from "react-icons/lu";
import useActiveMatch from "../../hooks/useActiveMatch";
import usePending from "../../hooks/usePending";
import useSession from "../../hooks/useSession";
import useTeamTags from "../../hooks/useTeamTags";
import useUser from "../../hooks/useUser";
import { signInWithDiscord, signOut } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { codModeOf } from "../cod/CodModeNav";
import { MATCH_TEAM_ENABLED, MY_MATCHES_ENABLED } from "../../lib/config";
import { levelFor, rankFor } from "../../lib/ranks";
import { isReferee } from "../../lib/roles";
import { CardArt, RarityFx } from "../cod/CallingCard";
import { cardInfo } from "../../lib/cards";
import { RankEmblem } from "../cod/RankEmblem";
import { NotificationDialog } from "../cod/NotificationSettings";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { InstallButton } from "../ui/InstallButton";
import { GlobalSearch } from "./GlobalSearch";
import { Logo } from "../ui/Logo";

/** Lien du menu du compte sur mobile (icône + libellé, comme le menu du profil sur ordinateur). */
const MOBILE_ITEM = "flex items-center gap-2.5 px-4 py-3 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold";

/** Sous-menu de MW4 (Classé, Division, Tournoi), réactivé le 2026-10-28 : false pour le masquer. */
const SHOW_MW4_SUBMENU = true;
/** Sous-menu des modes affiché : les raccourcis Classé et Division du menu du compte feraient doublon. */
const MODE_SUBMENU = SHOW_MW4_SUBMENU && MATCH_TEAM_ENABLED;

/** Pages des classements : le lien Classements s'allume dessus (et MW4 s'éteint). */
function isRankingPage(pathname) {
  return pathname.startsWith("/cod/leaderboard") || pathname === "/cod/equipes" || pathname.startsWith("/renommee");
}

// Fondateurs et Partenaires ont quitté le menu le 2026-11-09 : ils restent dans le pied de page et le menu mobile (Infos).
const LINKS = [
  { href: "/", label: "Accueil" },
  {
    href: "/cod",
    label: "MW4",
    active: (pathname) => isActive(pathname, "/cod") && !isRankingPage(pathname),
    // Les trois sections COD (seulement si la Division est active).
    children: SHOW_MW4_SUBMENU && MATCH_TEAM_ENABLED && [
      { href: "/cod/ranked", label: "Classé", univers: "classe", icon: LuCrosshair, color: "#34d399" },
      { href: "/cod/division", label: "Division", univers: "division", icon: LuShield, color: "#22d3ee" },
      { href: "/cod/tournoi", label: "Tournoi", univers: "tournoi", icon: LuTrophy, color: "#e5484d" },
    ],
  },
  { href: "/gta6", label: "GTA 6", univers: "gta" },
  {
    href: "/cod/leaderboard",
    label: "Classements",
    active: isRankingPage,
    // Joueurs (classé), équipes (Division, si le mode est ouvert) et Renommée.
    children: [
      { href: "/cod/leaderboard", label: "Joueurs", icon: LuCrosshair, color: "#34d399", current: (pathname) => pathname.startsWith("/cod/leaderboard") },
      ...(MATCH_TEAM_ENABLED ? [{ href: "/cod/equipes", label: "Équipes", icon: LuShield, color: "#22d3ee", current: (pathname) => pathname === "/cod/equipes" }] : []),
      { href: "/renommee", label: "Renommée", icon: LuCrown, color: "#d4af37", current: (pathname) => pathname.startsWith("/renommee") },
    ],
  },
  { href: "/clips", label: "Clips" },
];

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Barre de navigation fixe : transparente en haut de page, opaque dès qu'on défile. */
export function Navbar() {
  const { pathname, asPath } = useRouter();
  const { loading } = useSession();
  const user = useUser();
  // Raccourci « Mon équipe » seulement pour les joueurs qui ont une équipe.
  const myTeam = useTeamTags(user ? [user.id] : []).get(user?.id);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pending = usePending();
  const [notifications, setNotifications] = useState(false);
  const closeNotifications = useCallback(() => setNotifications(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu mobile se referme à chaque changement d'adresse (aussi ?cartes=1 depuis son propre profil).
  useEffect(() => {
    setMobileOpen(false);
  }, [asPath]);

  // Menu ouvert : la page derrière ne défile plus.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    // Menus toujours dans l'or SixSence, quelle que soit la couleur de la page (Classé, Division, Tournoi) ;
    // le lien GTA 6 garde son coucher de soleil (son propre data-univers).
    <>
    <header data-univers="or" className="fixed inset-x-0 top-0 z-50">
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
              const active = link.active ? link.active(pathname) : isActive(pathname, link.href);
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
                  <div className="invisible absolute left-0 top-full z-10 pt-3.5 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div data-univers="or" className="clip-tactical w-80 bg-gold/40 p-px [--cut:14px]">
                      <div className="clip-tactical space-y-1 bg-ink-800/95 p-2 backdrop-blur-md [--cut:14px]">
                        {link.children.map((child) => {
                          const current = child.current ? child.current(pathname) : (child.href === "/cod/ranked" && mode === "classe") || (child.href === "/cod/division" && mode === "team") || (child.href === "/cod/tournoi" && mode === "tournoi");
                          const Icon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              style={{ "--mode": child.color }}
                              className={cn(
                                "group/mode relative flex items-center gap-3 overflow-hidden border-l-2 px-3 py-2.5 transition-colors duration-200 hover:border-[var(--mode)] hover:bg-white/[0.04]",
                                current ? "border-gold bg-gold/10" : "border-gold/40",
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 font-display text-base font-bold uppercase tracking-[0.14em] text-gold transition-colors duration-200 group-hover/mode:text-[var(--mode)]">
                                  <Icon aria-hidden className="h-4 w-4" />
                                  {child.label}
                                </span>
                              </span>
                              {/* Trait qui s'allonge au survol (comme les liens des cartes des modes), dans la couleur du mode. */}
                              <span aria-hidden className="h-px w-0 bg-gold/50 opacity-0 transition-all duration-300 group-hover/mode:w-6 group-hover/mode:bg-[var(--mode)] group-hover/mode:opacity-100" />
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
            {/* Recherche rapide réservée à l'équipe SixSence (admin, staff, arbitres). */}
            {user && isReferee(user.role) ? <GlobalSearch /> : null}
            <InstallButton variant="nav" />
            {/* Zone de largeur fixe pendant le chargement : évite que la barre ne saute. */}
            <div className="hidden min-w-[9rem] justify-end sm:flex">
              {loading ? null : user ? (
                <>
                  <UserMenu user={user} onNotifications={() => setNotifications(true)} />
                  <NotificationDialog open={notifications} onClose={closeNotifications} />
                </>
              ) : (
                <Button size="sm" onClick={() => signInWithDiscord()}>
                  <FaDiscord aria-hidden className="h-4 w-4" />
                  Connexion
                </Button>
              )}
            </div>

          </div>
        </Container>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <MobileMenu
            pathname={pathname}
            user={user}
            loading={loading}
            myTeam={myTeam}
            pending={pending}
            onClose={() => setMobileOpen(false)}
            onNotifications={() => {
              setMobileOpen(false);
              setNotifications(true);
            }}
          />
        ) : null}
      </AnimatePresence>
    </header>
    <MobileTabBar pathname={pathname} menuOpen={mobileOpen} pending={pending} onToggleMenu={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} />
    </>
  );
}

// Cartes dont l'illustration a de larges bords sombres : zoom dans le menu seulement (le profil garde le plein cadre).
// [zoom, point fixe] : le point fixe à gauche pousse le sujet vers la droite, hors du pseudo.
const MENU_CARD_ZOOM = { "rang-legende": [1.6, "10% 50%"] };

/** Carte de visite équipée en fond de la carte du joueur (menu du profil), voilée à gauche pour le pseudo. */
function MenuCard({ cardKey }) {
  const key = cardKey ?? "sixsence";
  const { rarity } = cardInfo(key);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute inset-0" style={MENU_CARD_ZOOM[key] ? { transform: `scale(${MENU_CARD_ZOOM[key][0]})`, transformOrigin: MENU_CARD_ZOOM[key][1] } : undefined}>
        <CardArt cardKey={key} place="tile" />
      </span>
      <RarityFx rarity={rarity} />
      <span className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/45 to-ink/5" />
    </span>
  );
}

/** Pastille : nombre de choses en attente, rien à zéro. */
function PendingDot({ count, className = "" }) {
  if (!count) return null;
  return (
    <span className={cn("flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-loss px-1 font-tech text-[10px] font-bold leading-none text-white", className)}>
      <span aria-hidden>{count > 9 ? "9+" : count}</span>
      <span className="sr-only">{count} en attente</span>
    </span>
  );
}

const TABS = [
  { key: "accueil", href: "/", label: "Accueil", icon: LuHouse, current: (pathname) => pathname === "/" },
  { key: "jouer", href: "/cod", label: "Jouer", icon: LuGamepad2, current: (pathname) => pathname.startsWith("/cod") && !isActive(pathname, "/cod/pass") && !isActive(pathname, "/cod/profile") },
  { key: "clips", href: "/clips", label: "Clips", icon: LuClapperboard, current: (pathname) => isActive(pathname, "/clips") },
  { key: "pass", href: "/cod/pass", label: "Pass", icon: LuTicket, current: (pathname) => isActive(pathname, "/cod/pass") },
];

const TAB_CLASS = "relative flex h-full flex-col items-center justify-center gap-1 font-display text-[11px] font-bold uppercase tracking-[0.1em] transition-colors";

/** Trait de l'onglet actif, qui glisse d'un onglet à l'autre. */
function TabMark() {
  return <motion.span layoutId="onglet-mobile" aria-hidden className="absolute inset-x-3 top-0 h-0.5 bg-gold shadow-[0_0_10px_var(--color-gold)]" />;
}

/**
 * Barre d'onglets du téléphone, toujours visible : Accueil, Jouer (le match en cours s'il y en a un), Clips, Pass,
 * Menu. Sous les fenêtres du site, au-dessus de la page ; `_app.js` laisse sa hauteur libre sous le pied de page.
 */
export function MobileTabBar({ pathname, menuOpen, pending, onToggleMenu, onNavigate }) {
  const active = useActiveMatch();
  const menuCount = pending.invites + pending.requests + pending.challenges + pending.cards;
  return (
    <nav aria-label="Onglets" data-univers="or" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const here = !menuOpen && tab.current(pathname);
          const inMatch = tab.key === "jouer" && active;
          const href = inMatch ? (active.kind === "division" ? `/cod/equipes/match/${active.id}` : `/cod/match/${active.id}`) : tab.href;
          return (
            <Link key={tab.key} href={href} onClick={onNavigate} aria-current={here ? "page" : undefined} className={cn(TAB_CLASS, here ? "text-gold" : "text-white/55")}>
              {here ? <TabMark /> : null}
              <span className="relative">
                <motion.span whileTap={{ scale: 0.85 }} className="block">
                  <Icon aria-hidden className="h-5 w-5" />
                </motion.span>
                {tab.key === "jouer" ? <PendingDot count={pending.confirm} className="absolute -right-3 -top-2" /> : null}
                {inMatch && !pending.confirm ? (
                  <span aria-hidden className="absolute -right-1.5 -top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-loss" />
                  </span>
                ) : null}
              </span>
              {inMatch ? "Match" : tab.label}
            </Link>
          );
        })}
        <button type="button" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="menu-mobile" onClick={onToggleMenu} className={cn(TAB_CLASS, menuOpen ? "text-gold" : "text-white/55")}>
          {menuOpen ? <TabMark /> : null}
          <span className="relative">
            <motion.span whileTap={{ scale: 0.85 }} className="block">
              {menuOpen ? <LuX aria-hidden className="h-5 w-5" /> : <LuMenu aria-hidden className="h-5 w-5" />}
            </motion.span>
            {menuOpen ? null : <PendingDot count={menuCount} className="absolute -right-3 -top-2" />}
          </span>
          Menu
        </button>
      </div>
    </nav>
  );
}

// Le menu glisse depuis la droite, puis ses blocs et ses cases apparaissent en cascade.
const MENU_PANEL = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.22, delayChildren: 0.06, staggerChildren: 0.035 } },
  exit: { x: "100%", transition: { type: "tween", ease: "easeIn", duration: 0.18 } },
};
const MENU_GROUP = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2, staggerChildren: 0.025 } } };
const MENU_ITEM = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.18 } } };

/** Case du menu mobile : icône, libellé et pastille. */
function MobileTile({ href, icon: Icon, active = false, onClick = null, badge = 0, children }) {
  const className = cn(
    "flex min-h-12 w-full items-center gap-2.5 border px-3 py-2.5 text-left text-sm transition-colors",
    active ? "border-gold/60 bg-gold/10 text-gold" : "border-white/10 bg-white/[0.02] text-white/80 hover:text-gold",
  );
  const content = (
    <>
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 leading-tight">{children}</span>
      <PendingDot count={badge} className="shrink-0" />
    </>
  );
  return (
    <motion.div variants={MENU_ITEM}>
      {onClick ? (
        <button type="button" onClick={onClick} className={className}>
          {content}
        </button>
      ) : (
        <Link href={href} aria-current={active ? "page" : undefined} className={className}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}

function MobileSection({ title, children }) {
  return (
    <motion.section variants={MENU_GROUP} className="mt-6">
      <h2 className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">{title}</h2>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </motion.section>
  );
}

/**
 * Menu du téléphone, plein écran : le joueur et son match en cours, les trois modes, puis les pages regroupées.
 * Sans compte : connexion en tête, et toutes les pages publiques restent accessibles.
 * Se referme en le faisant glisser vers la droite ; le défilement vertical reste libre.
 */
export function MobileMenu({ pathname, user, loading, myTeam, pending, onClose, onNotifications }) {
  const reduced = useReducedMotion();
  const active = useActiveMatch();
  const teamCount = pending.invites + pending.requests + pending.challenges;
  const teamHref = pending.challenges ? "/cod/equipe?onglet=defis" : pending.requests ? "/cod/equipe?onglet=recrutement" : "/cod/equipe";
  const profile = user?.profile ?? null;
  const rank = rankFor(profile?.points ?? 0);
  const here = (href) => isActive(pathname, href);

  return (
    <motion.div
      id="menu-mobile"
      variants={reduced ? undefined : MENU_PANEL}
      initial={reduced ? false : "hidden"}
      animate="visible"
      exit={reduced ? undefined : "exit"}
      drag={reduced ? false : "x"}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.7 }}
      dragMomentum={false}
      onDragEnd={(_event, info) => (info.offset.x > 90 || info.velocity.x > 500) && onClose()}
      className="fixed inset-x-0 bottom-[calc(4rem+1px+env(safe-area-inset-bottom))] top-16 overflow-y-auto overscroll-contain border-t border-white/10 bg-ink lg:hidden"
    >
      <Container className="pb-8 pt-4">
        {user ? (
          <motion.div variants={MENU_GROUP}>
            <Link href="/cod/profile" className="relative block overflow-hidden border border-white/10 px-4 py-5">
              <MenuCard cardKey={profile?.calling_card} />
              <span className="relative flex items-center gap-3">
                <Avatar src={user.avatar} name={user.username} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-xl font-black uppercase leading-none tracking-wide">{user.username}</span>
                    {myTeam ? (
                      <span className="shrink-0 font-tech text-[10px] font-bold tracking-[0.16em]" style={{ color: myTeam.color }}>
                        [{myTeam.tag}]
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap font-tech text-[10px] uppercase tracking-[0.1em] text-white/55">
                    <span style={{ color: rank.text }}>{rank.name}</span>
                    <span className="text-white/25">·</span>
                    {profile?.points ?? 0} pts
                    <span className="text-white/25">·</span>
                    Niv. {levelFor(profile?.xp ?? 0)}
                  </span>
                </span>
                <RankEmblem rank={rank} size={40} animated={false} />
              </span>
            </Link>
            {profile && !profile.activision_id ? (
              <Link href="/cod/profile" className="mt-2 flex items-center gap-2.5 border border-gold/30 bg-gold/[0.08] px-4 py-3 text-sm text-gold">
                <LuTriangleAlert aria-hidden className="h-4 w-4 shrink-0" />
                Ajoute ton identifiant Activision pour jouer
              </Link>
            ) : null}
            {active ? (
              <Link
                href={active.kind === "division" ? `/cod/equipes/match/${active.id}` : `/cod/match/${active.id}`}
                className="mt-2 flex items-center gap-2.5 border border-loss/40 bg-loss/10 px-4 py-3 font-display text-base font-bold uppercase tracking-[0.12em] text-white"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-loss" />
                </span>
                {pending.confirm ? "Résultat à confirmer" : "Match en cours"}
                <LuArrowRight aria-hidden className="ml-auto h-4 w-4" />
              </Link>
            ) : null}
          </motion.div>
        ) : loading ? null : (
          <Button fullWidth onClick={() => signInWithDiscord()}>
            <FaDiscord aria-hidden className="h-5 w-5" />
            Connexion Discord
          </Button>
        )}

        {/* Jouer : les trois modes, à leurs couleurs. */}
        {MODE_SUBMENU ? (
          <motion.section variants={MENU_GROUP} className="mt-6">
            <h2 className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">Jouer</h2>
            <div className="grid grid-cols-3 gap-2">
              {LINKS[1].children.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Link
                    key={mode.href}
                    href={mode.href}
                    aria-current={here(mode.href) ? "page" : undefined}
                    style={{ "--mode": mode.color, borderColor: here(mode.href) ? mode.color : undefined }}
                    className="flex flex-col items-center gap-2 border border-white/10 bg-[color-mix(in_srgb,var(--mode)_9%,transparent)] px-2 py-4"
                  >
                    <Icon aria-hidden className="h-6 w-6" style={{ color: mode.color }} />
                    <span className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white">{mode.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        ) : null}

        <motion.nav variants={MENU_GROUP} aria-label="Navigation mobile" className="mt-6 grid grid-cols-3 gap-2">
          {LINKS.filter((link) => ["/", "/cod", "/gta6"].includes(link.href)).map((link) => {
            const current = link.href === "/cod" ? pathname === "/cod" : here(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-univers={link.univers}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "border-b-2 py-2.5 text-center font-display text-base font-bold uppercase tracking-[0.12em]",
                  current ? "border-gold text-gold" : "border-white/10 text-white/70",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </motion.nav>

        {user ? (
          <MobileSection title="Mon compte">
            <MobileTile href="/cod/profile" icon={LuUser} active={pathname === "/cod/profile"}>
              Mon profil
            </MobileTile>
            {myTeam || pending.invites ? (
              <MobileTile href={teamHref} icon={LuUsers} active={pathname === "/cod/equipe"} badge={teamCount}>
                Mon équipe
              </MobileTile>
            ) : null}
            {MY_MATCHES_ENABLED ? (
              <MobileTile href="/cod/matchs" icon={LuSwords} active={here("/cod/matchs")}>
                Mes matchs
              </MobileTile>
            ) : null}
            <MobileTile href="/cod/profile?cartes=1" icon={LuIdCard} badge={pending.cards}>
              Mes cartes de visite
            </MobileTile>
            <MobileTile href="/cod/pass" icon={LuTicket} active={here("/cod/pass")}>
              Pass de saison
            </MobileTile>
            <MobileTile icon={LuBell} onClick={onNotifications}>
              Mes notifications
            </MobileTile>
          </MobileSection>
        ) : null}

        <MobileSection title="Communauté">
          <MobileTile href="/clips" icon={LuClapperboard} active={here("/clips")}>
            Clips
          </MobileTile>
          <MobileTile href="/renommee" icon={LuCrown} active={here("/renommee")}>
            Renommée
          </MobileTile>
          <MobileTile href="/calendrier" icon={LuCalendarDays} active={here("/calendrier")}>
            Calendrier
          </MobileTile>
          <MobileTile href="/nouveautes" icon={LuSparkles} active={here("/nouveautes")}>
            Nouveautés
          </MobileTile>
          {user ? null : (
            <MobileTile href="/cod/pass" icon={LuTicket} active={here("/cod/pass")}>
              Pass de saison
            </MobileTile>
          )}
        </MobileSection>

        <MobileSection title="Infos">
          <MobileTile href="/reglement" icon={LuScrollText} active={here("/reglement")}>
            Règlement
          </MobileTile>
          <MobileTile href="/faq" icon={LuCircleHelp} active={here("/faq")}>
            FAQ
          </MobileTile>
          <MobileTile href="/founders" icon={LuUser} active={here("/founders")}>
            Fondateurs
          </MobileTile>
          <MobileTile href="/partners" icon={LuUsers} active={here("/partners")}>
            Partenaires
          </MobileTile>
        </MobileSection>

        <motion.div variants={MENU_GROUP} className="mt-6 space-y-1 border-t border-white/10 pt-4">
          <InstallButton variant="menu" />
          {user && isReferee(user.role) ? (
            <Link href="/admin" className={MOBILE_ITEM}>
              <LuShieldCheck aria-hidden className="h-4 w-4" />
              Administration
            </Link>
          ) : null}
          {user ? (
            <button type="button" onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:text-loss">
              <LuLogOut aria-hidden className="h-4 w-4" />
              Déconnexion
            </button>
          ) : null}
        </motion.div>
      </Container>
    </motion.div>
  );
}

/** Lien du menu du profil (icône + libellé). */
function MenuItem({ href, icon: Icon, children }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-2.5 px-4 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold">
      <Icon aria-hidden className="h-4 w-4" />
      {children}
    </Link>
  );
}

/**
 * Avatar + pseudo, avec un menu déroulant : carte du joueur (rang, points, niveau, équipe), rappel de l'identifiant
 * Activision, match en cours, les trois modes, le compte, les pages utiles, l'administration, la déconnexion.
 */
function UserMenu({ user, onNotifications }) {
  const myTeam = useTeamTags([user.id]).get(user.id);
  const active = useActiveMatch();
  const profile = user.profile ?? null;
  const points = profile?.points ?? 0;
  const rank = rankFor(points);
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const { pathname, asPath } = useRouter();

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
        <LuChevronDown aria-hidden className={cn("h-4 w-4 text-white/50 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden border border-white/12 bg-ink-800 shadow-2xl shadow-black/60"
          >
            {/* Carte du joueur sur sa carte de visite équipée : rang et points du Classé, niveau, équipe. */}
            <Link role="menuitem" href="/cod/profile" className="relative block overflow-hidden border-b border-white/10 px-4 py-6 transition-[filter] hover:brightness-110">
              <MenuCard cardKey={profile?.calling_card} />
              <span className="relative flex items-center gap-3">
                <Avatar src={user.avatar} name={user.username} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-lg font-black uppercase leading-none tracking-wide">{user.username}</span>
                    {myTeam ? (
                      <span className="shrink-0 font-tech text-[10px] font-bold tracking-[0.16em]" style={{ color: myTeam.color }}>
                        [{myTeam.tag}]
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap font-tech text-[10px] uppercase tracking-[0.1em] text-white/50">
                    <span style={{ color: rank.text }}>{rank.name}</span>
                    <span className="text-white/25">·</span>
                    {points} pts
                    <span className="text-white/25">·</span>
                    Niv. {levelFor(profile?.xp ?? 0)}
                  </span>
                </span>
                <RankEmblem rank={rank} size={40} animated={false} />
              </span>
            </Link>
            {profile && !profile.activision_id ? (
              <Link role="menuitem" href="/cod/profile" className="flex items-center gap-2.5 border-b border-white/10 bg-gold/[0.08] px-4 py-2.5 text-xs text-gold transition-colors hover:bg-gold/15">
                <LuTriangleAlert aria-hidden className="h-4 w-4 shrink-0" />
                Ajoute ton identifiant Activision pour jouer
              </Link>
            ) : null}
            {active ? (
              <Link
                role="menuitem"
                href={active.kind === "division" ? `/cod/equipes/match/${active.id}` : `/cod/match/${active.id}`}
                className="flex items-center gap-2.5 border-b border-white/10 bg-loss/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-loss/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-loss" />
                </span>
                Match en cours
                <LuArrowRight aria-hidden className="ml-auto h-4 w-4" />
              </Link>
            ) : null}

            {/* Jouer : les trois modes, à leurs couleurs. */}
            {MODE_SUBMENU ? (
              <div className="grid grid-cols-3 gap-1.5 border-b border-white/10 p-2.5">
                {LINKS[1].children.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Link
                      key={mode.href}
                      role="menuitem"
                      href={mode.href}
                      style={{ "--mode": mode.color }}
                      className="flex flex-col items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2 py-2.5 transition-colors hover:border-[var(--mode)] hover:bg-[color-mix(in_srgb,var(--mode)_10%,transparent)]"
                    >
                      <Icon aria-hidden className="h-4 w-4" style={{ color: mode.color }} />
                      <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white/80">{mode.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            <div className="py-1.5">
              <MenuItem href="/cod/profile" icon={LuUser}>
                Mon profil
              </MenuItem>
              {myTeam ? (
                <MenuItem href="/cod/equipe" icon={LuUsers}>
                  Mon équipe
                </MenuItem>
              ) : null}
              <MenuItem href="/cod/profile?cartes=1" icon={LuIdCard}>
                Mes cartes de visite
              </MenuItem>
              <MenuItem href="/cod/pass" icon={LuTicket}>
                Pass de saison
              </MenuItem>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNotifications();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
              >
                <LuBell aria-hidden className="h-4 w-4" />
                Mes notifications
              </button>
              {MY_MATCHES_ENABLED ? (
                <MenuItem href="/cod/matchs" icon={LuSwords}>
                  Mes matchs
                </MenuItem>
              ) : null}
              {MODE_SUBMENU ? null : (
                <MenuItem href="/cod/ranked" icon={LuCrosshair}>
                  Classé
                </MenuItem>
              )}
            </div>
            <div className="border-t border-white/10 py-1.5">
              <MenuItem href="/calendrier" icon={LuCalendarDays}>
                Calendrier
              </MenuItem>
              <MenuItem href="/clips" icon={LuClapperboard}>
                Clips
              </MenuItem>
              <MenuItem href="/renommee" icon={LuCrown}>
                Renommée
              </MenuItem>
              <MenuItem href="/nouveautes" icon={LuSparkles}>
                Nouveautés
              </MenuItem>
              <MenuItem href="/reglement" icon={LuScrollText}>
                Règlement
              </MenuItem>
              <MenuItem href="/faq" icon={LuCircleHelp}>
                FAQ
              </MenuItem>
            </div>
            {isReferee(user.role) ? (
              <div className="border-t border-white/10 py-1.5">
                <MenuItem href="/admin" icon={LuShieldCheck}>
                  Administration
                </MenuItem>
              </div>
            ) : null}
            <div className="border-t border-white/10 py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-loss"
              >
                <LuLogOut aria-hidden className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
