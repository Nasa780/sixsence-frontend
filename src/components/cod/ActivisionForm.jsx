import { useState } from "react";
import { LuLoaderCircle, LuSave } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";

const PLATFORMS = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
];

/**
 * Saisie de l'identifiant Activision et de la plateforme du joueur.
 * Obligatoire avant d'entrer dans la file : l'hôte du match s'en sert pour
 * inviter les autres joueurs dans la partie privée.
 *
 * Écrit directement dans Supabase : les règles de la base n'autorisent un
 * joueur qu'à modifier CES deux champs, et uniquement sur sa propre ligne.
 */
export function ActivisionForm({ user, onSaved = null }) {
  const [activisionId, setActivisionId] = useState(user?.profile?.activision_id || "");
  const [platform, setPlatform] = useState(user?.profile?.platform || "pc");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function save(event) {
    event.preventDefault();
    const value = activisionId.trim();
    if (value.length < 3 || value.length > 40) {
      setNotice({ tone: "error", text: "L'identifiant Activision doit contenir entre 3 et 40 caractères (ex. Pseudo#1234567)." });
      return;
    }
    setSaving(true);
    setNotice(null);
    const { error } = await supabase.from("cod_profiles").update({ activision_id: value, platform }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", text: "Enregistrement impossible. Réessaie dans un instant." });
      return;
    }
    setNotice({ tone: "success", text: "Identifiants enregistrés." });
    await user.reload?.();
    onSaved?.();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <label htmlFor="activision-id" className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
          Identifiant Activision
        </label>
        <input
          id="activision-id"
          value={activisionId}
          onChange={(event) => setActivisionId(event.target.value)}
          placeholder="Pseudo#1234567"
          maxLength={40}
          autoComplete="off"
          className="mt-2 h-12 w-full border border-white/12 bg-ink px-4 text-base text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">Plateforme</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PLATFORMS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center border font-display text-base font-bold uppercase tracking-[0.12em] transition-colors",
                platform === option.value ? "border-gold bg-gold/10 text-gold" : "border-white/12 text-white/60 hover:text-white",
              )}
            >
              <input
                type="radio"
                name="platform"
                value={option.value}
                checked={platform === option.value}
                onChange={() => setPlatform(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={saving}>
        {saving ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSave aria-hidden className="h-5 w-5" />}
        Enregistrer
      </Button>

      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
    </form>
  );
}
