import { useState } from "react";
import { LuCheck, LuDoorClosed, LuDoorOpen, LuGauge, LuLoaderCircle, LuPencil, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { fieldClass, labelClass } from "./TeamParts";

/**
 * Compléments de la fiche d'équipe : force (niveau moyen en Classé), statut de recrutement et son message,
 * réglage du recrutement et devise des joueurs (Leaders, page Mon équipe).
 */

/** Force de l'équipe : moyenne des points Classé de ses joueurs, et sa place parmi les équipes actives. */
export function TeamStrength({ strength, players }) {
  if (!strength) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex items-center gap-4">
        <LuGauge aria-hidden className="h-7 w-7 shrink-0 text-gold" />
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-gold">Force de l&apos;équipe</p>
          <p className="mt-1 font-display text-3xl font-black leading-none tabular-nums">
            {strength.value.toLocaleString("fr-FR")} <span className="text-base text-white/50">pts</span>
          </p>
        </div>
      </div>
      <p className="min-w-0 flex-1 basis-56 text-sm text-white/60">
        Moyenne des points Classé de {players > 1 ? `ses ${players} joueurs` : "son joueur"} :{" "}
        <span className="font-semibold text-white">
          {strength.position === 1 ? "1re" : `${strength.position}e`} équipe la plus forte sur {strength.total}
        </span>
        .
      </p>
    </div>
  );
}

/** Statut de recrutement (fiche publique) : ouvert avec le message des Leaders, ou fermé. */
export function RecruitingBanner({ team }) {
  // Statut inconnu (serveur pas encore à jour) : rien.
  // Fermé : rien (le bouton de l'en-tête indique déjà « Recrutement fermé »).
  if (team.disbanded || !team.recruiting) return null;
  return (
    <div className="flex items-start gap-3 border border-win/30 bg-win/[0.05] px-5 py-4">
      <LuDoorOpen aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-win" />
      <div className="min-w-0">
        <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-win">Recrutement ouvert</p>
        {team.recruitingNote ? <p className="mt-1 text-sm text-white/75">{team.recruitingNote}</p> : null}
      </div>
    </div>
  );
}

/** Réglage du recrutement (Leaders, Mon équipe › Recrutement) : ouvert / fermé et message de 120 caractères. */
export function RecruitingSettings({ team, reload }) {
  const [open, setOpen] = useState(team.recruiting !== false);
  const [note, setNote] = useState(team.recruitingNote ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);
  const changed = open !== (team.recruiting !== false) || note.trim() !== (team.recruitingNote ?? "");

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      await api(`/teams/${team.id}`, { method: "PATCH", body: { recruiting: open, recruitingNote: note.trim() || null } });
      setMessage({ tone: "success", text: open ? "Recrutement ouvert : affiché sur la fiche de l'équipe." : "Recrutement fermé : les candidatures sont refusées." });
      await reload();
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 border border-white/10 bg-white/[0.03] p-4">
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Statut de recrutement</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          [true, LuDoorOpen, "Ouvert", "Les joueurs peuvent candidater."],
          [false, LuDoorClosed, "Fermé", "Invitations seulement."],
        ].map(([value, Icon, label, hint]) => (
          <button
            key={label}
            type="button"
            aria-pressed={open === value}
            onClick={() => setOpen(value)}
            className={cn("border p-3 text-left transition", open === value ? (value ? "border-win bg-win/10" : "border-white/40 bg-white/[0.06]") : "border-white/10 hover:border-white/25")}
          >
            <span className="flex items-center gap-2 font-display text-lg font-bold uppercase">
              <Icon aria-hidden className={cn("h-4 w-4", value ? "text-win" : "text-white/60")} />
              {label}
            </span>
            <span className="mt-1 block text-xs text-white/50">{hint}</span>
          </button>
        ))}
      </div>
      {open ? (
        <div>
          <label htmlFor="recruiting-note" className={labelClass}>
            Qui cherchez-vous ? (facultatif)
          </label>
          <input id="recruiting-note" className={fieldClass} maxLength={120} placeholder="1 joueur, sniper, disponible le soir" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
      ) : null}
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Button size="sm" disabled={pending || !changed} onClick={save}>
        {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
        Enregistrer
      </Button>
    </div>
  );
}

/** Modifier la devise d'un joueur (Leaders) : 40 caractères, vide pour l'effacer. */
export function MottoEditor({ team, member, reload }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(member.motto ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api(`/teams/${team.id}/members/${member.id}`, { method: "PATCH", body: { motto: value.trim() || null } });
      setEditing(false);
      await reload();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-gold">
        <LuPencil aria-hidden className="h-3.5 w-3.5" />
        {member.motto ? "Devise" : "Ajouter une devise"}
      </button>
    );
  }
  return (
    <form onSubmit={save} className="flex w-full items-center gap-2 sm:w-auto">
      <input
        className={cn(fieldClass, "py-1.5 text-sm")}
        maxLength={40}
        autoFocus
        aria-label={`Devise de ${member.username}`}
        placeholder="Le clutch, c'est un état d'esprit"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)} aria-label="Annuler">
        <LuX aria-hidden className="h-4 w-4" />
      </Button>
      {error ? <span className="text-xs text-loss">{error}</span> : null}
    </form>
  );
}
