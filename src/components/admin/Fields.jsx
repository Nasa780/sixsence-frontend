import { useState } from "react";
import { LuImagePlus, LuLoaderCircle } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { uploadEventImage } from "../../lib/cups";

/** Briques de formulaire de l'administration, au style du site. */

const INPUT =
  "w-full border border-white/12 bg-ink px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none";

/**
 * Champ décrit par un objet :
 *   { key, label, type: "text" | "textarea" | "url" | "number" | "datetime" | "select" | "image", required, options, placeholder, hint }
 *   image : adresse https collée, ou image envoyée depuis l'ordinateur (bouton), avec un aperçu.
 */
export function Field({ field, value, onChange }) {
  const id = `champ-${field.key}`;
  const common = {
    id,
    name: field.key,
    required: field.required,
    placeholder: field.placeholder,
    value: value ?? "",
    onChange: (event) => onChange(field.key, event.target.value),
  };

  let control;
  if (field.type === "textarea") control = <textarea {...common} rows={4} className={cn(INPUT, "resize-y")} />;
  else if (field.type === "image") control = <ImageInput common={common} value={value} onPick={(url) => onChange(field.key, url)} />;
  else if (field.type === "select")
    control = (
      <select {...common} className={INPUT}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  else
    control = (
      <input
        {...common}
        type={field.type === "datetime" ? "datetime-local" : field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
        // Année limitée à 4 chiffres : sans borne, le navigateur en accepte 6 et l'heure tapée à la suite part dans l'année.
        {...(field.type === "datetime" ? { min: "2020-01-01T00:00", max: "2099-12-31T23:59" } : {})}
        className={INPUT}
      />
    );

  return (
    <div className={cn(field.type === "textarea" && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
        {field.label}
        {field.required ? <span className="text-gold"> *</span> : null}
      </label>
      {control}
      {field.hint ? <p className="mt-1 text-xs text-white/40">{field.hint}</p> : null}
    </div>
  );
}

/** Image : adresse https, ou fichier de l'ordinateur envoyé dans le stockage du site (adresse remplie toute seule). */
function ImageInput({ common, value, onPick }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function pick(file) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onPick(await uploadEventImage(file));
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input {...common} type="url" placeholder="https://… ou envoie une image" className={INPUT} />
        <label className={cn("flex shrink-0 cursor-pointer items-center gap-2 border border-white/15 px-3 text-xs font-semibold uppercase tracking-wide text-white/75 hover:border-gold hover:text-gold", busy && "pointer-events-none opacity-50")}>
          {busy ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
          <span className="hidden sm:inline">Envoyer</span>
          <span className="sr-only sm:hidden">Envoyer une image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
        </label>
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Aperçu de l'image" className="aspect-video w-full max-w-xs border border-white/10 bg-ink object-cover" />
      ) : null}
      {error ? <p className="text-xs text-loss">{error}</p> : null}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <div>
      <label htmlFor="recherche-admin" className="sr-only">
        {label}
      </label>
      <input id="recherche-admin" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={INPUT} />
    </div>
  );
}

/** Date ISO -> valeur d'un champ datetime-local (heure locale du navigateur). */
export function toLocalInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Valeur datetime-local -> date ISO (ou null). */
export function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : null;
}
