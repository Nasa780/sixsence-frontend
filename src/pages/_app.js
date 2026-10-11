import Head from "next/head";
import { useRouter } from "next/router";
import { Inter, Orbitron, Saira_Condensed } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { SITE_URL } from "../lib/config";
import "../styles/globals.css";

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
  // Pages GTA 6 : palette coucher de soleil (voir globals.css).
  const univers = pathname.startsWith("/gta6") ? "gta" : undefined;

  return (
    <div
      data-univers={univers}
      className={`${saira.variable} ${orbitron.variable} ${inter.variable} flex min-h-dvh flex-col overflow-x-hidden font-sans`}
    >
      <Head>
        <title>SixSence — Plateforme multigaming COD &amp; GTA 6</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          key="description"
          name="description"
          content="Classé Call of Duty en 5v5 avec matchmaking automatique et classement en direct, événements GTA 6 avec inscriptions. Connexion avec Discord."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {/* Aperçu des liens partagés (Discord, X, WhatsApp…). */}
        <meta property="og:site_name" content="SixSence" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:type" content="website" />
        <meta key="og:title" property="og:title" content="SixSence — Plateforme multigaming COD & GTA 6" />
        <meta
          key="og:description"
          property="og:description"
          content="Classé Call of Duty en 5v5, classement en direct et événements GTA 6. Connexion avec Discord."
        />
        <meta property="og:url" content={`${SITE_URL}${asPath.split(/[?#]/)[0]}`} />
        <meta key="og:image" property="og:image" content={`${SITE_URL}/api/og`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
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
            <Component {...pageProps} />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
