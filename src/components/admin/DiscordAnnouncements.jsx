import { useCallback, useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { RELEASES } from "../../lib/releases";
import { Button } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";
import { Field } from "./Fields";

const FIELDS = {
  type: {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "annonce", label: "Annonce (rôle 🔔 Annonces)" },
      { value: "nouveautes", label: "Nouveautés (rôle 🔔 Nouveautés)" },
    ],
  },
  title: { key: "title", label: "Titre", required: true, placeholder: "Ex. : La Coupe Anubis arrive !" },
  text: { key: "text", label: "Texte", type: "textarea", required: true, placeholder: "Le message (gras : **texte**)" },
  url: { key: "url", label: "Lien « En savoir plus » (facultatif)", placeholder: "/cod/tournoi ou https://…" },
};

/** Dernière mise à jour du journal (lib/releases.js), mise en forme pour Discord. */
function latestRelease() {
  const release = RELEASES[0];
  return {
    type: "nouveautes",
    title: release.title,
    text: release.items.map((item) => `• **${item.tag}** : ${item.text}`).join("\n"),
    url: "/nouveautes",
  };
}

/**
 * Annonces illustrées du bot (backend services/announcements.ts) : types coupés ou actifs, rôles
 * d'Intégration à créer sur le serveur, publication d'une annonce libre ou de la dernière mise à jour.
 */
export function DiscordAnnouncements() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ type: "annonce", title: "", text: "", url: "" });
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState(null);

  const run = useCallback(async (key, fn, done) => {
    setPending(key);
    setMessage(null);
    try {
      await fn();
      if (done) setMessage({ tone: "ok", text: done });
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(null);
    }
  }, []);

  useEffect(() => {
    api("/admin/discord/announce")
      .then(setSettings)
      .catch((caught) => setMessage({ tone: "error", text: caught.message }));
  }, []);

  const toggle = (type) =>
    run(`toggle-${type}`, async () => {
      const disabled = settings.disabled.includes(type) ? settings.disabled.filter((item) => item !== type) : [...settings.disabled, type];
      setSettings(await api("/admin/discord/announce/settings", { method: "POST", body: { disabled } }));
    });
  const createRoles = () => run("roles", async () => setSettings(await api("/admin/discord/onboarding-roles", { method: "POST" })), "Rôles prêts sur le serveur.");
  const giveMember = () =>
    run("member", () => api("/admin/discord/member-role", { method: "POST" }), "Distribution du rôle Membre lancée : le bilan arrive dans le salon du journal.");
  const publish = (event) => {
    event.preventDefault();
    run(
      "publish",
      async () => {
        await api("/admin/discord/announce", { method: "POST", body: { ...form, url: form.url || undefined } });
        setForm({ type: "annonce", title: "", text: "", url: "" });
      },
      "Annonce publiée sur Discord.",
    );
  };

  const missing = settings?.roles.filter((role) => !role.exists) ?? [];

  return (
    <TacticalCard cut={16} innerClassName="space-y-5 p-5">
      <div>
        <p className="font-display text-xl font-black uppercase leading-none">Annonces Discord</p>
        <p className="mt-1 text-sm text-white/55">
          Annonces illustrées dans le salon des annonces, avec la mention du rôle de notification choisi par les membres dans l’Intégration du serveur.
        </p>
        {settings && !settings.configured ? (
          <p className="mt-2 text-sm text-loss">Salon des annonces non configuré : ajoute DISCORD_ANNOUNCE_CHANNEL_ID sur Render.</p>
        ) : null}
        {message ? <p className={cn("mt-2 text-sm", message.tone === "ok" ? "text-win" : "text-loss")}>{message.text}</p> : null}
      </div>

      {settings ? (
        <>
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Annonces automatiques et manuelles</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {settings.types.map((item) => {
                const on = !settings.disabled.includes(item.type);
                return (
                  <li key={item.type}>
                    <button
                      type="button"
                      onClick={() => toggle(item.type)}
                      disabled={pending !== null}
                      aria-pressed={on}
                      className={cn("flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition-colors", on ? "border-gold/40 bg-gold/[0.06]" : "border-white/10 bg-white/[0.02]")}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-white/85">{item.label}</span>
                        <span className="block text-xs text-white/45">{item.role}</span>
                      </span>
                      <span className={cn("font-tech text-[10px] uppercase tracking-[0.2em]", on ? "text-win" : "text-white/40")}>{on ? "Actif" : "Coupé"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/85">Rôles d’Intégration</p>
              <p className="mt-1 text-xs text-white/50">
                {missing.length === 0 ? "Tous les rôles existent sur le serveur." : `À créer : ${missing.map((role) => role.name).join(", ")}.`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={createRoles} disabled={pending !== null || missing.length === 0}>
              {pending === "roles" ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Créer les rôles
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/85">Rôle Membre pour tous</p>
              <p className="mt-1 text-xs text-white/50">Donne « Membre » à tous ceux déjà sur le serveur (les nouveaux le reçoivent par l’Intégration).</p>
            </div>
            <Button size="sm" variant="outline" onClick={giveMember} disabled={pending !== null}>
              {pending === "member" ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Donner le rôle Membre
            </Button>
          </div>

          <form onSubmit={publish} className="space-y-3 border-t border-white/8 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white/85">Publier une annonce</p>
              <button type="button" onClick={() => setForm(latestRelease())} className="text-xs text-gold underline underline-offset-4 hover:text-gold-light">
                Remplir avec la dernière mise à jour
              </button>
            </div>
            {Object.values(FIELDS).map((field) => (
              <Field key={field.key} field={field} value={form[field.key]} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} />
            ))}
            <Button size="sm" type="submit" disabled={pending !== null || !settings.configured}>
              {pending === "publish" ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Publier sur Discord
            </Button>
          </form>
        </>
      ) : null}
    </TacticalCard>
  );
}
