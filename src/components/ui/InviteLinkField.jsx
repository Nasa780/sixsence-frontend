import { useState } from "react";
import { LuCheck, LuCopy, LuLink } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { Notice } from "./Feedback";

/**
 * Bloc « Lien d'invitation », le même partout (équipe, groupe) : le lien, « Copier » et, si
 * onReset est fourni, « Nouveau lien » (l'ancien ne marche plus).
 */
export function InviteLinkField({ url, text, onReset = null, resetting = false, error = null, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copie ce lien et envoie-le à tes mates :", url);
    }
  }

  return (
    <div className={cn("space-y-3 border border-gold/30 bg-gold/[0.05] p-4", className)}>
      <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-gold">
        <LuLink aria-hidden className="h-3.5 w-3.5" />
        Lien d&apos;invitation
      </p>
      <p className="text-sm text-white/60">{text}</p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url || "Chargement…"}
          onFocus={(event) => event.target.select()}
          aria-label="Lien d'invitation"
          className="min-w-0 flex-1 border border-white/12 bg-ink px-3 py-2.5 font-tech text-xs text-white/80 focus:border-gold focus:outline-none"
        />
        <Button size="sm" onClick={copy} disabled={!url} className="shrink-0">
          {copied ? <LuCheck aria-hidden className="h-4 w-4" /> : <LuCopy aria-hidden className="h-4 w-4" />}
          {copied ? "Copié" : "Copier"}
        </Button>
        {onReset ? (
          <Button size="sm" variant="ghost" onClick={onReset} disabled={!url || resetting} className="shrink-0">
            Nouveau lien
          </Button>
        ) : null}
      </div>
    </div>
  );
}
