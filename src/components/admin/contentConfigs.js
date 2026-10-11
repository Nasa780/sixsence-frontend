import { fromLocalInput, toLocalInput } from "./Fields";

/** Configuration des listes gérées par CrudPanel. */

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

const EVENT_STATUS = { published: "Publié", draft: "Brouillon", cancelled: "Annulé" };

export const EVENTS = {
  table: "gta_events",
  endpoint: "events",
  order: ["starts_at", false],
  noun: "un événement",
  title: (item) => item.title,
  subtitle: (item) => [formatDate(item.starts_at), item.category, EVENT_STATUS[item.status], item.max_slots ? `${item.max_slots} places` : "places illimitées"].filter(Boolean).join(" · "),
  fields: [
    { key: "title", label: "Titre", required: true },
    { key: "category", label: "Catégorie", placeholder: "session, course, braquage…" },
    { key: "starts_at", label: "Début", type: "datetime", required: true },
    { key: "ends_at", label: "Fin", type: "datetime" },
    { key: "location", label: "Lieu", placeholder: "Serveur, ville…" },
    { key: "max_slots", label: "Places", type: "number", hint: "Vide = illimité" },
    { key: "cover_url", label: "Image (https)", type: "url" },
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "published", label: "Publié" },
        { value: "draft", label: "Brouillon (invisible)" },
        { value: "cancelled", label: "Annulé" },
      ],
    },
    { key: "description", label: "Description", type: "textarea" },
  ],
  toForm: (item) => ({
    title: item.title ?? "",
    category: item.category ?? "session",
    starts_at: toLocalInput(item.starts_at),
    ends_at: toLocalInput(item.ends_at),
    location: item.location ?? "",
    max_slots: item.max_slots ?? "",
    cover_url: item.cover_url ?? "",
    status: item.status ?? "published",
    description: item.description ?? "",
  }),
  fromForm: (values) => ({
    ...values,
    starts_at: fromLocalInput(values.starts_at),
    ends_at: fromLocalInput(values.ends_at),
    max_slots: values.max_slots === "" ? null : Number(values.max_slots),
  }),
};

export const FOUNDERS = {
  table: "founders",
  endpoint: "founders",
  order: ["sort_order", true],
  noun: "un fondateur",
  title: (item) => item.name,
  subtitle: (item) => [item.role, item.discord_tag].filter(Boolean).join(" · "),
  fields: [
    { key: "name", label: "Nom", required: true },
    { key: "role", label: "Rôle", required: true },
    { key: "avatar_url", label: "Photo (https)", type: "url" },
    { key: "discord_tag", label: "Pseudo Discord" },
    { key: "steam_url", label: "Profil Steam", type: "url", placeholder: "https://steamcommunity.com/…" },
    { key: "sort_order", label: "Ordre d'affichage", type: "number" },
    { key: "bio", label: "Présentation", type: "textarea" },
  ],
  toForm: (item) => ({
    name: item.name ?? "",
    role: item.role ?? "",
    avatar_url: item.avatar_url ?? "",
    discord_tag: item.discord_tag ?? "",
    steam_url: item.steam_url ?? "",
    sort_order: item.sort_order ?? 0,
    bio: item.bio ?? "",
  }),
  fromForm: (values) => values,
};

export const PARTNERS = {
  table: "partners",
  endpoint: "partners",
  order: ["sort_order", true],
  noun: "un partenaire",
  title: (item) => item.name,
  subtitle: (item) => [item.tier, item.website_url].filter(Boolean).join(" · "),
  fields: [
    { key: "name", label: "Nom", required: true },
    {
      key: "tier",
      label: "Niveau",
      type: "select",
      options: [
        { value: "platinum", label: "Platine" },
        { value: "gold", label: "Or" },
        { value: "silver", label: "Argent" },
        { value: "community", label: "Communauté" },
      ],
    },
    { key: "logo_url", label: "Logo (https)", type: "url" },
    { key: "website_url", label: "Site web (https)", type: "url" },
    { key: "sort_order", label: "Ordre d'affichage", type: "number" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  toForm: (item) => ({
    name: item.name ?? "",
    tier: item.tier ?? "community",
    logo_url: item.logo_url ?? "",
    website_url: item.website_url ?? "",
    sort_order: item.sort_order ?? 0,
    description: item.description ?? "",
  }),
  fromForm: (values) => values,
};
