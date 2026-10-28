import { supabase } from "./supabase";

/**
 * Équipes de la Division : constantes partagées par les pages (mêmes règles que
 * services/teamPolicy.ts du backend) et envoi des logos et bannières.
 */

export const TEAM_LIMITS = { maxMembers: 8, qualifyMatches: 25 };

/** Couleurs proposées (identiques à TEAM_COLORS du backend). */
export const TEAM_COLORS = ["#d4af37", "#5cc8ff", "#f87171", "#a78bfa", "#4ade80", "#facc15", "#fb923c", "#f0abfc", "#e5e7eb"];

export const SOCIALS = [
  { key: "discord", label: "Discord" },
  { key: "x", label: "X" },
  { key: "twitch", label: "Twitch" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
];

export const REPORT_REASONS = {
  name: "Nom ou tag inapproprié",
  logo: "Logo inapproprié",
  banner: "Bannière inappropriée",
  description: "Description inappropriée",
  other: "Autre",
};

/** Image choisie (avant compression) : 8 Mo au plus. */
const MAX_IMAGE = 8 * 1024 * 1024;
/** GIF animés envoyés tels quels (pas de compression possible dans le navigateur) : 1 Mo le logo, 2 Mo la bannière. */
const MAX_GIF = { logo: 1024 * 1024, banner: 2 * 1024 * 1024 };
/** Largeur maximale une fois compressée en WebP. */
const MAX_WIDTH = { logo: 512, banner: 1920 };
/** Miniature fixe d'un logo GIF (première image), affichée dans les listes à la place du GIF. */
const MINI_WIDTH = 160;
const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

/** Adresse de la miniature fixe d'un logo GIF (même nom, suffixe .mini.webp). */
export function logoMiniUrl(url) {
  return url && /.gif$/i.test(url) ? `${url}.mini.webp` : null;
}

/** Redimensionne une image (première image pour un GIF) et la compresse en WebP. */
export async function toWebp(file, maxWidth) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Image illisible. Essaie un autre fichier.");
  return blob;
}

async function put(path, body, contentType) {
  const { error } = await supabase.storage.from("team-media").upload(path, body, { contentType });
  if (error) throw new Error("Envoi de l'image impossible. Réessaie dans un instant.");
}

/**
 * Envoie un logo ou une bannière dans le bucket public team-media (dossier du joueur) et
 * renvoie son adresse publique, à enregistrer ensuite par PATCH /teams/:id. Les images fixes sont
 * redimensionnées et compressées en WebP ; un logo GIF part tel quel avec sa miniature fixe.
 */
export async function uploadTeamImage(file, userId, kind) {
  if (!TYPES[file.type]) throw new Error("Image PNG, JPEG, WebP ou GIF uniquement.");
  const stamp = `${userId}/${kind}-${Date.now()}`;
  if (file.type === "image/gif") {
    if (file.size > MAX_GIF[kind]) throw new Error(`GIF trop lourd (${kind === "logo" ? "1 Mo" : "2 Mo"} au plus).`);
    const path = `${stamp}.gif`;
    await put(path, file, "image/gif");
    if (kind === "logo") await put(`${path}.mini.webp`, await toWebp(file, MINI_WIDTH), "image/webp").catch(() => {});
    return supabase.storage.from("team-media").getPublicUrl(path).data.publicUrl;
  }
  if (file.size > MAX_IMAGE) throw new Error("Image trop lourde (8 Mo au plus).");
  const path = `${stamp}.webp`;
  await put(path, await toWebp(file, MAX_WIDTH[kind]), "image/webp");
  return supabase.storage.from("team-media").getPublicUrl(path).data.publicUrl;
}

/** Libellé d'un trophée : Vainqueur / Finaliste (tournoi de saison), Or / Argent / Bronze (Coupe Horus). */
export function trophyLabel(trophy) {
  return { winner: "Vainqueur", finalist: "Finaliste", or: "Or", argent: "Argent", bronze: "Bronze" }[trophy?.place] ?? "Trophée";
}
