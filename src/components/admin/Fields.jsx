import { cn } from "../../lib/cn";

/** Briques de formulaire de l'administration, au style du site. */

const INPUT =
  "w-full border border-white/12 bg-ink px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none";

/**
 * Champ décrit par un objet :
 *   { key, label, type: "text" | "textarea" | "url" | "number" | "datetime" | "select", required, options, placeholder, hint }
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
