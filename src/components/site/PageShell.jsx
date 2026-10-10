import Head from "next/head";
import Background from "../Background";
import SiteNav from "./SiteNav";

/**
 * Gabarit des pages du site : fond dégradé bleu nuit + motif hexagonal
 * (comme la page Ranked), barre de navigation, contenu centré, pied de page.
 */
export default function PageShell({ active, title, children, width = 1200 }) {
  const fullTitle = title ? `${title} — SixSence` : "SixSence — Competitive Platform";
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col text-[#e8eaf0]">
      <Head>
        <title>{fullTitle}</title>
      </Head>

      <div
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(145deg, #06070F 6.17%, #080B14 36.85%, #0A0C10 63.15%, #07080C 93.83%)",
        }}
      />
      <Background />

      <SiteNav active={active} />

      <main className="flex-1 w-full mx-auto px-6 pt-10 pb-16 box-border max-sm:px-4 max-sm:pt-6" style={{ maxWidth: width }}>
        {children}
      </main>

      <footer className="w-full bg-[rgba(8,12,20,0.95)] border-t border-solid border-[rgba(26,107,220,0.12)] py-7 px-6 text-center text-[13px] text-[#2e3d52] font-[Inter]">
        © 2026 SixSence — Tous droits réservés
      </footer>
    </div>
  );
}
