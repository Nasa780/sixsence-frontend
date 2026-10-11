import { useCallback, useEffect, useState } from "react";
import { LuLoaderCircle, LuPencil, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Field } from "./Fields";

/**
 * Gestion d'une liste de contenus (événements, fondateurs, partenaires).
 * Lecture directe dans Supabase (lecture publique, brouillons visibles pour les admins),
 * écriture par le backend : POST /admin/<endpoint>, PATCH et DELETE /admin/<endpoint>/:id.
 *
 * config : {
 *   table, endpoint, order: [colonne, croissant], fields,
 *   title(item), subtitle(item),
 *   toForm(item) -> valeurs du formulaire, fromForm(values) -> corps de la requête,
 *   noun : « un événement », etc.
 * }
 */
export function CrudPanel({ config }) {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | élément
  const [values, setValues] = useState({});
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    const [column, ascending] = config.order;
    const { data, error: loadError } = await supabase.from(config.table).select("*").order(column, { ascending }).limit(200);
    if (loadError) setError("Lecture impossible : " + loadError.message);
    setItems(data || []);
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  function open(item) {
    setEditing(item);
    setValues(item === "new" ? config.toForm({}) : config.toForm(item));
    setError(null);
    setMessage(null);
  }

  async function save(event) {
    event.preventDefault();
    setPending("save");
    setError(null);
    try {
      const body = config.fromForm(values);
      if (editing === "new") await api(`/admin/${config.endpoint}`, { method: "POST", body });
      else await api(`/admin/${config.endpoint}/${editing.id}`, { method: "PATCH", body });
      setMessage(editing === "new" ? "Ajouté." : "Modifications enregistrées.");
      setEditing(null);
      await load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Supprimer définitivement « ${config.title(item)} » ?`)) return;
    setPending(item.id);
    setError(null);
    try {
      await api(`/admin/${config.endpoint}/${item.id}`, { method: "DELETE" });
      setMessage("Supprimé.");
      await load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/55">{items ? `${items.length} élément${items.length > 1 ? "s" : ""}` : ""}</p>
        {editing ? null : (
          <Button size="sm" onClick={() => open("new")}>
            <LuPlus aria-hidden className="h-4 w-4" />
            Ajouter {config.noun}
          </Button>
        )}
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      {editing ? (
        <TacticalCard highlight cut={20} innerClassName="p-6">
          <form onSubmit={save} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-2xl font-black uppercase">{editing === "new" ? `Nouveau · ${config.noun}` : config.title(editing)}</p>
              <button type="button" onClick={() => setEditing(null)} className="p-1 text-white/50 hover:text-white" aria-label="Fermer le formulaire">
                <LuX aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {config.fields.map((field) => (
                <Field key={field.key} field={field} value={values[field.key]} onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))} />
              ))}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={pending === "save"}>
                {pending === "save" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
                Enregistrer
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Annuler
              </Button>
            </div>
          </form>
        </TacticalCard>
      ) : null}

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState title="Rien pour l'instant">Ajoute {config.noun} avec le bouton ci-dessus.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-l-2 border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold uppercase tracking-wide">{config.title(item)}</p>
                <p className="truncate text-xs text-white/45">{config.subtitle(item)}</p>
              </div>
              <button type="button" onClick={() => open(item)} className="p-2 text-white/55 hover:text-gold" aria-label={`Modifier ${config.title(item)}`}>
                <LuPencil aria-hidden className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(item)}
                disabled={pending === item.id}
                className="p-2 text-white/55 hover:text-loss disabled:opacity-40"
                aria-label={`Supprimer ${config.title(item)}`}
              >
                {pending === item.id ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuTrash2 aria-hidden className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
