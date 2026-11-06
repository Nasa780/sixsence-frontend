import { useState } from "react";
import { LuFlag, LuShieldAlert } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { ARBITRATION_REASONS } from "../../lib/moderation";
import { Button } from "../ui/Button";
import { ReasonDialog } from "../ui/ReasonDialog";

/** Durée lisible : « 23 h 41 », « 45 min ». */
export const formatHours = (hours) => {
  const minutes = Math.max(0, Math.floor(hours * 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
};

/**
 * Demande d'arbitrage d'un joueur du match, ou de correction pendant 24 h après la validation, et suivi de ses demandes.
 * Commun aux feuilles Classé, Division et coupes. `path` : adresse du match sur le serveur ; `hoursLeft` : temps restant
 * pour demander une correction, null pendant le match.
 */
export function MatchArbitration({ path, canAsk, hoursLeft = null, requests = [], onSent, className = "" }) {
  const [open, setOpen] = useState(false);
  const correction = hoursLeft !== null;
  return (
    <>
      {canAsk ? (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
          <p className="text-sm text-white/55">
            {correction
              ? `Le résultat est faux (mauvais clic, erreur de déclaration) ? Tu peux demander une correction pendant encore ${formatHours(hoursLeft)}.`
              : "Un problème pendant le match (triche, joueur absent, partie impossible…) ?"}
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {correction ? <LuFlag aria-hidden className="h-4 w-4" /> : <LuShieldAlert aria-hidden className="h-4 w-4" />}
            {correction ? "Demander une correction" : "Demander un arbitrage"}
          </Button>
        </div>
      ) : null}
      {requests.length > 0 ? (
        <ul className="space-y-2">
          {requests.map((request) => (
            <li key={request.id} className="flex flex-wrap items-center gap-2 border-l-2 border-gold/40 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
              <LuShieldAlert aria-hidden className="h-4 w-4 text-gold" />
              Ta demande « {ARBITRATION_REASONS[request.reason] ?? request.reason} » :
              <span className={cn("font-semibold", request.status === "open" ? "text-gold" : request.status === "resolved" ? "text-win" : "text-white/60")}>
                {request.status === "open" ? "en attente d'un arbitre" : request.status === "resolved" ? "traitée" : "classée sans suite"}
              </span>
              {request.resolution ? <span className="text-white/50">— {request.resolution}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <ReasonDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Demander un arbitrage"
        intro="Un arbitre est prévenu et peut consulter le tchat et les captures du match. Tu pourras ajouter une capture juste après."
        reasons={ARBITRATION_REASONS}
        submitLabel="Envoyer la demande"
        onSubmit={async ({ reason, details }) => {
          await api(`${path}/arbitration`, { method: "POST", body: { reason, details } });
          await onSent();
        }}
      />
    </>
  );
}
