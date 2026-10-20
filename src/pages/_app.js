import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Inter, Orbitron, Saira_Condensed } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { GROUPS_ENABLED, MATCH_TEAM_ENABLED, SITE_URL } from "../lib/config";
import NotFound from "./404";
import { installErrorReporting } from "../lib/monitoring";
import { registerServiceWorker } from "../lib/push";
import "../styles/globals.css";
import { codModeOf } from "../components/cod/CodModeNav";

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
  const { pathname, asPath } = useRouter();
  const bare = BARE_PAGES.includes(pathname);
  // Division en pause : ses pages (et celle du tournoi) sont introuvables.
  const teamPaused =
    (!MATCH_TEAM_ENABLED && (pathname === "/cod/equipe" || pathname === "/cod/division" || pathname.startsWith("/cod/equipes") || pathname.startsWith("/cod/tournoi"))) || (!GROUPS_ENABLED && pathname.startsWith("/cod/groupe"));
  // Pages GTA 6 : palette coucher de soleil (voir globals.css).
  // Couleur d'accent : coucher de soleil sur GTA 6, argent pour la Division, or blanc pour le Tournoi.
  const codMode = codModeOf(pathname);
  const univers = pathname.startsWith("/gta6") ? "gta" : codMode === "team" ? "division" : codMode === "tournoi" ? "tournoi" : undefined;

  // Service worker (appli installable, notifications push) et signalement des erreurs à l'équipe.
  useEffect(() => {
    registerServiceWorker();
    installErrorReporting();
  }, []);

  return (
    <div
      data-univers={univers}
      className={`${saira.variable} ${orbitron.variable} ${inter.variable} flex min-h-dvh flex-col overflow-x-hidden font-sans`}
    >
      <Head>
        <title>SixSence — Plateforme gaming : classé MW4 &amp; événements GTA 6</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          key="description"
          name="description"
          content="La plateforme gaming de la communauté : matchs classés Call of Duty MW4 avec matchmaking automatique, classement en direct et saisons, événements GTA 6 avec inscriptions. Gratuit, connexion avec Discord."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
        <meta key="og:title" property="og:title" content="SixSence · Entre dans l'arène" />
        <meta
          key="og:description"
          property="og:description"
          content="La plateforme gaming de la communauté : matchs classés MW4, classement en direct, récompenses de saison et événements GTA 6. Accès gratuit avec Discord."
        />
        <meta property="og:url" content={`${SITE_URL}${asPath.split(/[?#]/)[0]}`} />
        <meta key="og:image" property="og:image" content={`${SITE_URL}/api/og?v=4`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta key="og:image:alt" property="og:image:alt" content="SixSence, plateforme gaming : « Entre dans l'arène ». Matchs classés MW4 et événements GTA 6." />
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
          <main id="contenu" className="flex-1">
            <ErrorBoundary resetKey={asPath}>
              {teamPaused ? <NotFound /> : <Component {...pageProps} />}
            </ErrorBoundary>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
