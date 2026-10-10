import { useEffect, useState } from "react";

/**
 * true sur ordinateur (≥ 768 px, comme la classe Tailwind `md:`), false sur
 * mobile, null tant que la page n'est pas chargée dans le navigateur.
 *
 * Les pages qui ont une version ordinateur ET une version mobile s'en servent
 * pour ne monter qu'une seule des deux : sinon la version masquée ouvrirait,
 * elle aussi, ses connexions temps réel.
 */
export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
