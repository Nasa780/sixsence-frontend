import Head from "next/head";
import { useRouter } from "next/router";
import { Inter, Orbitron, Saira_Condensed } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
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
  const { pathname } = useRouter();
  const bare = BARE_PAGES.includes(pathname);

  return (
    <div className={`${saira.variable} ${orbitron.variable} ${inter.variable} flex min-h-dvh flex-col overflow-x-hidden font-sans`}>
      <Head>
        <title>SixSence — Plateforme multigaming COD &amp; GTA 6</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          name="description"
          content="Classé Call of Duty en 5v5 avec matchmaking automatique et classement en direct, événements GTA 6 avec inscriptions. Connexion avec Discord."
        />
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
