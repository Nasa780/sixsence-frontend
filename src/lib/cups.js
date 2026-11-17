import { supabase } from "./supabase";
import { toWebp } from "./teams";

/**
 * Affiches des coupes (migration 0055 du backend) : image envoyée par un admin dans le bucket public cup-posters,
 * compressée en WebP (900 px de large), sinon affiche générée par /api/og/affiche.
 */

const MAX_FILE = 8 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Envoie une image d'administration (affiche de coupe, image d'événement GTA 6) dans le bucket public cup-posters
 * (envoi réservé aux admins, 2 Mo au plus : l'image est d'abord convertie en WebP à la largeur voulue) et renvoie
 * son adresse publique (à enregistrer ensuite par l'API d'administration).
 */
async function uploadAdminImage(file, width, folder = "") {
  if (!TYPES.includes(file.type)) throw new Error("Image PNG, JPEG ou WebP uniquement.");
  if (file.size > MAX_FILE) throw new Error("Image trop lourde (8 Mo au plus).");
  const path = `${folder}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from("cup-posters").upload(path, await toWebp(file, width), { contentType: "image/webp" });
  if (error) throw new Error("Envoi de l'image impossible. Réessaie dans un instant (2 Mo au plus une fois compressée).");
  return supabase.storage.from("cup-posters").getPublicUrl(path).data.publicUrl;
}

/** Envoie une affiche de coupe et renvoie son adresse publique. */
export const uploadCupPoster = (file) => uploadAdminImage(file, 900);

/** Envoie l'image d'un événement GTA 6 (paysage, 1600 px) et renvoie son adresse publique (2026-11-18). */
export const uploadEventImage = (file) => uploadAdminImage(file, 1600, "evenements/");

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
