import { supabase } from "./supabase";
import { toWebp } from "./teams";

/**
 * Affiches des coupes (migration 0055 du backend) : image envoyée par un admin dans le bucket public cup-posters,
 * compressée en WebP (900 px de large), sinon affiche générée par /api/og/affiche.
 */

const MAX_FILE = 8 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Envoie une affiche et renvoie son adresse publique (à enregistrer ensuite par l'API d'administration). */
export async function uploadCupPoster(file) {
  if (!TYPES.includes(file.type)) throw new Error("Image PNG, JPEG ou WebP uniquement.");
  if (file.size > MAX_FILE) throw new Error("Image trop lourde (8 Mo au plus).");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from("cup-posters").upload(path, await toWebp(file, 900), { contentType: "image/webp" });
  if (error) throw new Error("Envoi de l'affiche impossible. Réessaie dans un instant.");
  return supabase.storage.from("cup-posters").getPublicUrl(path).data.publicUrl;
}

/** Affiche envoyée par un admin (et non générée) ? */
export const isCustomPoster = (url) => Boolean(url && url.includes("/storage/v1/object/public/cup-posters/"));

/** Aperçu de l'affiche générée, pour le formulaire de l'admin (mêmes paramètres que le backend). */
export function generatedPoster({ kind, name, size, bestOf, bracket, teamSize }) {
  const players = teamSize ?? 4;
  const params = new URLSearchParams({
    kind,
    name: (name || "Coupe").slice(0, 60),
    format: [`${players}v${players}`, `BO${bestOf}`, bracket === "double" ? "Double élimination" : "Élimination directe"].join(" · "),
    places: `${size} ${kind === "anubis" ? "équipes" : "places"}`,
  });
  return `/api/og/affiche?${params.toString()}`;
}
