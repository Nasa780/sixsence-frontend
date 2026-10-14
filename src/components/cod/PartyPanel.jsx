import { useState } from "react";
import { LuCheck, LuCopy, LuCrown, LuLoaderCircle, LuLogOut, LuUserPlus, LuUsers, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { SITE_URL } from "../../lib/config";
import { groupLabel } from "../../lib/ranks";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * Jouer en groupe : créer un groupe, partager son lien d'invitation, voir ses
 * membres, retirer un joueur (chef) ou quitter le groupe.
 *
 *   party   groupe actuel (ou null)          format  file choisie { format, label, teamSize }
 *   locked  vrai pendant une recherche ou un match (le groupe ne peut pas changer)
 *   onChange(party) : nouvel état du groupe après une action
 */
export function PartyPanel({ party, userId, format, locked, onChange }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function run(key, action) {
    setPending(key);
    setError(null);
    try {
      onChange(await action());
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  const create = () =>
    run("create", async () => (await api("/cod/party", { method: "POST", body: { format: format?.format } })).party);
  const leave = () => run("leave", async () => (await api("/cod/party/leave", { method: "POST" })).party);
  const kick = (member) => {
    if (!window.confirm(`Retirer ${member.username} du groupe ?`)) return;
    run(member.id, async () => (await api("/cod/party/kick", { method: "POST", body: { userId: member.id } })).party);
  };

  const inviteUrl = party ? `${typeof window !== "undefined" ? window.location.origin : SITE_URL}/cod/groupe/${party.inviteCode}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie ce lien et envoie-le à tes coéquipiers :", inviteUrl);
    }
  }

  const spinner = <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" />;

  if (!party) {
    const solo = !format || format.teamSize < 2;
    return (
      <TacticalCard cut={20} className="mt-6" innerClassName="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl font-black uppercase leading-none">
            <LuUsers aria-hidden className="h-5 w-5 text-gold" />
            Jouer en groupe
          </p>
          <p className="mt-2 max-w-md text-sm text-white/55">
            {solo
              ? "Cette file se joue seul. Choisis une file de 2v2 à 5v5 pour jouer avec tes amis."
              : `Crée un groupe et envoie le lien à tes amis (jusqu'à ${format.teamSize} joueurs en ${format.label}).`}
          </p>
          {error ? <p className="mt-2 text-sm text-loss">{error}</p> : null}
        </div>
        <Button variant="outline" onClick={create} disabled={solo || locked || pending !== null}>
          {pending === "create" ? spinner : <LuUserPlus aria-hidden className="h-4 w-4" />}
          Créer un groupe
        </Button>
      </TacticalCard>
    );
  }

  const isLeader = party.leaderId === userId;
  const free = party.maxSize - party.members.length;

  return (
    <TacticalCard cut={20} highlight className="mt-6" innerClassName="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Ton groupe · {party.format}</p>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none">
            {groupLabel(party.members.length)} <span className="text-white/35">· {party.members.length}/{party.maxSize}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={leave} disabled={locked || pending !== null}>
          {pending === "leave" ? spinner : <LuLogOut aria-hidden className="h-4 w-4" />}
          Quitter le groupe
        </Button>
      </div>

      <ul className="mt-5 space-y-2">
        {party.members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 border-l-2 border-gold/40 bg-white/[0.03] px-3 py-2.5">
            <Avatar src={member.avatar_url} name={member.username} size={36} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-display text-lg font-bold uppercase leading-none tracking-wide">
                {member.username}
                {member.isLeader ? <LuCrown aria-label="Chef du groupe" className="h-4 w-4 shrink-0 text-gold" /> : null}
                {member.id === userId ? <span className="text-xs text-gold">· Toi</span> : null}
              </p>
              <p className="mt-1 truncate text-xs text-white/45">{member.activision_id ?? "Identifiant Activision non renseigné"}</p>
            </div>
            {isLeader && member.id !== userId ? (
              <button
                type="button"
                onClick={() => kick(member)}
                disabled={locked || pending !== null}
                className="p-2 text-white/45 transition-colors hover:text-loss disabled:opacity-40"
                aria-label={`Retirer ${member.username} du groupe`}
              >
                {pending === member.id ? spinner : <LuX aria-hidden className="h-4 w-4" />}
              </button>
            ) : null}
          </li>
        ))}
        {Array.from({ length: Math.max(0, free) }, (_, index) => (
          <li key={`libre-${index}`} className="flex items-center gap-3 border-l-2 border-dashed border-white/10 px-3 py-2.5 text-sm text-white/30">
            Place libre
          </li>
        ))}
      </ul>

      {free > 0 ? (
        <div className="mt-5">
          <label htmlFor="lien-invitation" className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
            Lien d&apos;invitation
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="lien-invitation"
              readOnly
              value={inviteUrl}
              onFocus={(event) => event.target.select()}
              className="min-w-0 flex-1 border border-white/12 bg-ink px-3 py-2.5 text-sm text-white/80 focus:border-gold focus:outline-none"
            />
            <Button size="sm" onClick={copy}>
              {copied ? <LuCheck aria-hidden className="h-4 w-4" /> : <LuCopy aria-hidden className="h-4 w-4" />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-white/45">Envoie ce lien à tes amis (sur Discord par exemple) : il leur suffit de l&apos;ouvrir pour rejoindre le groupe.</p>
        </div>
      ) : null}

      {locked ? <p className="mt-4 text-xs text-white/45">Le groupe ne peut pas changer pendant une recherche ou un match.</p> : null}
      {error ? (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      ) : null}
    </TacticalCard>
  );
}
