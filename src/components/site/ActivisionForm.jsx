import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Notice, PrimaryButton } from "./ui";

/**
 * Saisie de l'identifiant Activision et de la plateforme du joueur.
 * Obligatoire avant d'entrer dans la file : l'hôte du match s'en sert pour
 * inviter les autres joueurs dans la partie privée.
 *
 * Écrit directement dans Supabase : les règles de la base n'autorisent un
 * joueur qu'à modifier CES deux champs, et uniquement sur sa propre ligne.
 */
export default function ActivisionForm({ user, onSaved = null }) {
  const [activisionId, setActivisionId] = useState(user?.profile?.activision_id || "");
  const [platform, setPlatform] = useState(user?.profile?.platform || "pc");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const save = async (event) => {
    event.preventDefault();
    const value = activisionId.trim();
    if (value.length < 3 || value.length > 40) {
      setNotice({ tone: "error", text: "L'identifiant Activision doit contenir entre 3 et 40 caractères (ex. Pseudo#1234567)." });
      return;
    }
    setSaving(true);
    setNotice(null);
    const { error } = await supabase
      .from("cod_profiles")
      .update({ activision_id: value, platform })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", text: "Enregistrement impossible. Réessaie dans un instant." });
      return;
    }
    setNotice({ tone: "success", text: "Profil enregistré." });
    await user.reload?.();
    onSaved?.();
  };

  const field =
    "h-10 px-3 rounded-[10px] bg-[rgba(10,22,40,0.7)] border border-solid border-[rgba(26,107,220,0.25)] text-[#e8f0fa] font-[Inter] text-sm outline-none focus:border-[#1a6bdc]";

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <label className="flex-1 min-w-[200px] flex flex-col gap-1 text-xs text-[#5b7fa8] font-[Inter]">
          Identifiant Activision
          <input
            className={field}
            value={activisionId}
            onChange={(event) => setActivisionId(event.target.value)}
            placeholder="Pseudo#1234567"
            maxLength={40}
          />
        </label>
        <label className="w-[160px] max-sm:flex-1 flex flex-col gap-1 text-xs text-[#5b7fa8] font-[Inter]">
          Plateforme
          <select className={field} value={platform} onChange={(event) => setPlatform(event.target.value)}>
            <option value="pc">PC</option>
            <option value="playstation">PlayStation</option>
            <option value="xbox">Xbox</option>
          </select>
        </label>
      </div>
      <PrimaryButton type="submit" disabled={saving} className="self-start py-2.5">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </PrimaryButton>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
    </form>
  );
}
