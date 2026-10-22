import { useRef, useState } from "react";
import { LuImageUp, LuLoaderCircle } from "react-icons/lu";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";

const TESSERACT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

/** Charge Tesseract (lecture de texte dans une image) une seule fois, à la demande. */
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TESSERACT;
    script.async = true;
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("Lecture indisponible pour le moment."));
    document.head.appendChild(script);
  });
}

/** Identifiant Activision (Pseudo#1234567) et niveau du compte lus dans le texte d'une capture. */
export function parseProfileText(text) {
  const clean = text.replace(/[|]/g, "I");
  const id = /([A-Za-z0-9_.\-À-ÿ]{2,24})\s?#\s?(\d{4,9})/.exec(clean);
  const level = /(?:niveau|level|niv\.?|lvl)\s*[:.]?\s*(\d{1,4})/i.exec(clean);
  return { activisionId: id ? `${id[1]}#${id[2]}` : null, level: level ? Number(level[1]) : null };
}

/**
 * Lecture automatique d'une capture du profil Call of Duty (anti-smurf) : tout se passe dans le navigateur,
 * l'image n'est envoyée nulle part. L'identifiant Activision lu remplit le formulaire ; le niveau du compte
 * est transmis au backend (POST /cod/smurf-check), qui prévient le staff si un compte très récent est déjà
 * haut classé. Aucune sanction automatique.
 */
export function ScreenshotReader({ onRead }) {
  const input = useRef(null);
  const [state, setState] = useState(null);
  const [progress, setProgress] = useState(0);

  async function read(file) {
    if (!file) return;
    setState({ tone: "pending", text: "Lecture de la capture…" });
    setProgress(0);
    try {
      const Tesseract = await loadTesseract();
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m) => m.status === "recognizing text" && setProgress(Math.round(m.progress * 100)),
      });
      const result = parseProfileText(data.text || "");
      if (result.level) api("/cod/smurf-check", { method: "POST", body: { level: result.level } }).catch(() => {});
      if (result.activisionId) {
        onRead(result.activisionId);
        setState({ tone: "success", text: `Identifiant lu : ${result.activisionId}${result.level ? ` · niveau ${result.level}` : ""}. Vérifie-le puis enregistre.` });
      } else {
        setState({ tone: "error", text: "Identifiant introuvable sur cette capture. Prends ton profil COD bien net (avec Pseudo#1234567), ou saisis-le à la main." });
      }
    } catch (caught) {
      setState({ tone: "error", text: caught.message || "Lecture impossible." });
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => read(event.target.files?.[0])} />
      <Button type="button" size="sm" variant="outline" disabled={state?.tone === "pending"} onClick={() => input.current?.click()}>
        {state?.tone === "pending" ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImageUp aria-hidden className="h-4 w-4" />}
        {state?.tone === "pending" ? `Lecture… ${progress}%` : "Remplir depuis une capture"}
      </Button>
      <p className="text-xs text-white/40">Capture de ton profil Call of Duty : lue directement dans ton navigateur, elle n&apos;est envoyée nulle part.</p>
      {state && state.tone !== "pending" ? <Notice tone={state.tone}>{state.text}</Notice> : null}
    </div>
  );
}
