import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useRef } from "react";
import { cn } from "../../lib/cn";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

/** Signes qui défilent pendant le décodage (style écran tactique). */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/<>_";

/**
 * Texte qui se décode façon écran militaire (GSAP ScrambleText) : les lettres défilent puis se fixent de gauche à
 * droite. Rejoué quand `text` ou `replay` change. Le texte final est toujours dans la page (lecteurs d'écran,
 * référencement) ; rien n'est animé si l'utilisateur réduit les animations.
 *   fromBlank : part d'un texte vide (écrans qui s'ouvrent) ; sinon le texte déjà affiché se brouille puis se fixe
 *   (titre envoyé par le serveur : pas d'éclair où il disparaît).
 */
export function ScrambleText({ text, as: Tag = "span", duration = 1.1, delay = 0, replay = 0, fromBlank = true, className = "" }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !ref.current) return;
      const to = { duration, delay, ease: "none", scrambleText: { text, chars: CHARS, revealDelay: duration * 0.3, speed: 0.7 } };
      if (fromBlank) gsap.fromTo(ref.current, { scrambleText: { text: " ", chars: CHARS } }, to);
      else gsap.to(ref.current, to);
    },
    { dependencies: [text, replay, fromBlank], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag className={cn("relative", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </Tag>
  );
}
