import { Html, Head, Main, NextScript } from "next/document";

/**
 * Le navigateur propose l'installation de l'appli (événement beforeinstallprompt) dès
 * le chargement, avant même que React ne démarre : ce petit script la met de côté
 * pour le bouton « Installer l'appli » (voir lib/install.js).
 */
const CAPTURE_INSTALL = `
window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  window.__installPrompt = event;
  window.dispatchEvent(new Event("sixsence:installable"));
});
window.addEventListener("appinstalled", function () {
  window.__installPrompt = null;
  window.__appInstalled = true;
  window.dispatchEvent(new Event("sixsence:installed"));
});
`;

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: CAPTURE_INSTALL }} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
