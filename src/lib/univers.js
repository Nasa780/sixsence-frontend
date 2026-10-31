import { createContext, useContext, useEffect } from "react";

/**
 * Couleur d'accent de la page (data-univers posé par _app.js d'après l'adresse). Une page peut l'imposer quand l'adresse
 * ne suffit pas (feuille d'un match de coupe sous /cod/equipes/match : rouge des tournois) : menu et pied de page suivent.
 */
export const UniversContext = createContext(() => {});

/** Impose la couleur `univers` (classe, division, tournoi, gta, or) tant que la page est affichée ; null = celle de l'adresse. */
export function usePageUnivers(univers) {
  const setUnivers = useContext(UniversContext);
  useEffect(() => {
    setUnivers(univers ?? null);
    return () => setUnivers(null);
  }, [setUnivers, univers]);
}
