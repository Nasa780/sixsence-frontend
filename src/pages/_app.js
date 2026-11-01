import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Inter, Orbitron, Saira_Condensed } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { ActiveMatchBar } from "../components/layout/ActiveMatchBar";
import { RouteLoader } from "../components/layout/RouteLoader";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { PageFade } from "../components/effects/PageFade";
import { GROUPS_ENABLED, MATCH_TEAM_ENABLED, SITE_URL } from "../lib/config";
import NotFound from "./404";
import { installErrorReporting } from "../lib/monitoring";
import { registerServiceWorker } from "../lib/push";
import "../styles/globals.css";
import { codModeOf } from "../components/cod/CodModeNav";
import usePresence from "../hooks/usePresence";
import { UniversContext } from "../lib/univers";

/**
 * Polices, auto-hébergées par next/font (aucune requête vers Google côté visiteur).
 * Chaque police expose une variable CSS, reprise dans globals.css :
 *   Saira Condensed -> titres (font-display)
 *   Orbitron        -> accents techniques, chiffres HUD (font-tech)
 *   Inter           -> texte courant (font-sans)
 */
const saira = Saira_Condensed({ subsets: ["latin"], weight: ["600", "700", "900"], variable: "--font-saira", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-orbitron", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Pages affichées sans la navigation ni le pied de page. */
const BARE_PAGES = ["/auth/callback"];

export default function App({ Component, pageProps }) {
  // Compteur « En ligne maintenant » : chaque onglet ouvert se signale.
  usePresence();
  const { pathname, asPath } = useRouter();
  const bare = BARE_PAGES.includes(pathname);
  // Division en pause : ses pages (et celle du tournoi) sont introuvables.
  const teamPaused =
    (!MATCH_TEAM_ENABLED && (pathname === "/cod/equipe" || pathname === "/cod/division" || pathname.startsWith("/cod/equipes") || pathname.startsWith("/cod/tournoi") || pathname.startsWith("/cod/circuit") || pathname.startsWith("/invite/equipe"))) || (!GROUPS_ENABLED && pathname.startsWith("/invite/groupe"));
  // Pages GTA 6 : palette coucher de soleil (voir globals.css).
  // Couleur d'accent : coucher de soleil sur GTA 6, vert pour le Classé, cyan pour la Division, rouge pour le Tournoi.
  const codMode = codModeOf(pathname);
  const pathUnivers = pathname.startsWith("/gta6") ? "gta" : codMode === "classe" ? "classe" : codMode === "team" ? "division" : codMode === "tournoi" ? "tournoi" : undefined;
  // Couleur imposée par la page (usePageUnivers), sinon celle de l'adresse.
  const [pageUnivers, setPageUnivers] = useState(null);
  const univers = pageUnivers ?? pathUnivers;

  // Service worker (appli installable, notifications push) et signalement des erreurs à l'équipe.
  useEffect(() => {
    registerServiceWorker();
    installErrorReporting();
    // Polices aussi sur <body> : les fenêtres plein écran (Portal) y sont placées, hors de la page.
    document.body.classList.add(saira.variable, orbitron.variable, inter.variable);
  }, []);

  return (
    <UniversContext.Provider value={setPageUnivers}>
    <div
      data-univers={univers}
      className={`${saira.variable} ${orbitron.variable} ${inter.variable} flex min-h-dvh flex-col overflow-x-hidden font-sans`}
    >
      <Head>
        <title>SixSence — Compétition COD &amp; Événements GTA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Couleur de la barre de l'aperçu Discord (et de la barre du navigateur sur téléphone) : or SixSence. */}
        <meta name="theme-color" content="#d4af37" />
        <meta
          key="description"
          name="description"
          content="La plateforme gaming de la communauté : classé Call of Duty MW4 en solo, Division en équipe 4v4 et tournoi de fin de saison, événements GTA 6. Gratuit, connexion avec Discord."
        />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-v2.png" />
        {/* Appli installable (PWA) : voir public/manifest.webmanifest et public/sw.js. */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SixSence" />
        {/* Aperçu des liens partagés (Discord, X, WhatsApp…). */}
        <meta property="og:site_name" content="SixSence" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:type" content="website" />
        <meta key="og:title" property="og:title" content="SixSence · La saison 1 est ouverte" />
        <meta
          key="og:description"
          property="og:description"
          content="Classé MW4 en solo, Division en 4v4, Coupes Horus et Anubis. La première place est à prendre : gratuit, connexion avec Discord. GTA 6 bientôt."
        />
        <meta property="og:url" content={`${SITE_URL}${asPath.split(/[?#]/)[0]}`} />
        <meta key="og:image" property="og:image" content={`${SITE_URL}/og/banniere-sixsence.jpg`} />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="640" />
        <meta key="og:image:alt" property="og:image:alt" content="Bannière SixSence : sixsence.fr, le sixième sens du jeu compétitif. Tournois, communauté, site web, Discord." />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {bare ? (
        <Component {...pageProps} />
      ) : (
        <>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
          >
            Aller au contenu
          </a>
          <Navbar />
          <ActiveMatchBar />
          <main id="contenu" className="flex-1">
            <ErrorBoundary resetKey={asPath}>
              {/* Fondu court à chaque changement de page. */}
              <PageFade pageKey={asPath.split(/[?#]/)[0]}>{teamPaused ? <NotFound /> : <Component {...pageProps} />}</PageFade>
            </ErrorBoundary>
          </main>
          <Footer />
          {/* Changement de page lent : écran de chargement SixSence avec une astuce. */}
          <RouteLoader />
        </>
      )}
    </div>
    </UniversContext.Provider>
  );
}
