import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Affiche son contenu directement dans <body>, hors de la page.
 *
 * Indispensable pour les fenêtres en plein écran (position: fixed) : placées dans un
 * élément découpé (clip-path des cartes « tactiques »), transformé ou flouté, elles
 * seraient sinon enfermées et rognées par cet élément.
 */
export function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
