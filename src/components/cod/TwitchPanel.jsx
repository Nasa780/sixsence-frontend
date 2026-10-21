import { useEffect, useState } from "react";
import { FaTwitch } from "react-icons/fa6";
import { LuLoaderCircle, LuPlay, LuSave, LuX } from "react-icons/lu";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

const TWITCH = "#9146ff";
const VALID = /^[A-Za-z0-9_]{4,25}$/;

/** Accepte « pseudo », « twitch.tv/pseudo » ou l'adresse complète ; renvoie l'identifiant de la chaîne. */
export function parseTwitch(value) {
  const clean = value.trim().replace(/^https?:\/\//, "").replace(/^(www\.|m\.)?twitch\.tv\//i, "").replace(/[/?#].*$/, "");
  return clean;
}

/**
 * Chaîne Twitch du joueur (profil) : lien vers la chaîne et lecteur intégré, chargé seulement au clic
 * (le lecteur affiche le direct, ou la chaîne hors ligne). Rien n'est affiché sans chaîne liée.
 */
export function TwitchPanel({ channel }) {
  const [playing, setPlaying] = useState(false);
  const [host, setHost] = useState(null);
  useEffect(() => setHost(window.location.hostname), []);
  if (!channel) return null;
  return (
    <TacticalCard cut={22} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full blur-3xl" style={{ background: `${TWITCH}33` }} />
      <div className="relative flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center" style={{ background: TWITCH }}>
          <FaTwitch aria-hidden className="h-6 w-6 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-tech text-[10px] uppercase tracking-[0.26em]" style={{ color: "#bf94ff" }}>
            Chaîne Twitch
          </p>
          <a href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer" className="mt-1 block truncate font-display text-3xl font-black uppercase leading-none hover:text-[#bf94ff]">
            {channel}
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setPlaying((value) => !value)}>
            {playing ? <LuX aria-hidden className="h-4 w-4" /> : <LuPlay aria-hidden className="h-4 w-4" />}
            {playing ? "Fermer le lecteur" : "Regarder ici"}
          </Button>
          <a
            href={`https://www.twitch.tv/${channel}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 px-4 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:brightness-110"
            style={{ background: TWITCH }}
          >
            <FaTwitch aria-hidden className="h-4 w-4" />
            Ouvrir Twitch
          </a>
        </div>
      </div>
      {playing && host ? (
        <div className="relative aspect-video w-full border-t border-white/10 bg-black">
          <iframe
            title={`Chaîne Twitch de ${channel}`}
            src={`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${host}&autoplay=true&muted=true`}
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : null}
    </TacticalCard>
  );
}

/** Lier, changer ou retirer sa chaîne Twitch (son profil). Écrit directement dans Supabase (colonne autorisée). */
export function TwitchForm({ user, onSaved = null }) {
  const [value, setValue] = useState(user?.profile?.twitch || "");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function save(event) {
    event.preventDefault();
    const channel = parseTwitch(value);
    if (channel && !VALID.test(channel)) {
      setNotice({ tone: "error", text: "Nom de chaîne invalide : 4 à 25 lettres, chiffres ou _ (ex. sixsence ou twitch.tv/sixsence)." });
      return;
    }
    setSaving(true);
    setNotice(null);
    const { error } = await supabase.from("cod_profiles").update({ twitch: channel || null }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", text: "Enregistrement impossible. Réessaie dans un instant." });
      return;
    }
    setValue(channel);
    setNotice({ tone: "success", text: channel ? "Chaîne Twitch liée : elle s'affiche sur ton profil." : "Chaîne Twitch retirée." });
    await user.reload?.();
    onSaved?.();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label htmlFor="twitch-channel" className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
        <FaTwitch aria-hidden className="h-3.5 w-3.5" style={{ color: "#bf94ff" }} />
        Chaîne Twitch (facultatif)
      </label>
      <div className="flex gap-2">
        <input
          id="twitch-channel"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="twitch.tv/tonpseudo"
          maxLength={60}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 border border-white/12 bg-ink px-4 text-base text-white placeholder:text-white/30 focus:border-[#9146ff] focus:outline-none"
        />
        <Button type="submit" variant="outline" disabled={saving}>
          {saving ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSave aria-hidden className="h-5 w-5" />}
          <span className="hidden sm:inline">Enregistrer</span>
        </Button>
      </div>
      <p className="text-xs text-white/40">Laisse vide puis enregistre pour retirer ta chaîne.</p>
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
    </form>
  );
}
