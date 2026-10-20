import { supabase } from "./supabase";

/**
 * Équipes du Division : constantes partagées par les pages (mêmes règles que
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

const MAX_IMAGE = 2 * 1024 * 1024;
/** Les GIF animés peuvent peser plus lourd : 5 Mo (limite du bucket team-media, migration 0035). */
const MAX_GIF = 5 * 1024 * 1024;
const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

/**
 * Envoie un logo ou une bannière dans le bucket public team-media (dossier du joueur) et
 * renvoie son adresse publique, à enregistrer ensuite par PATCH /teams/:id.
 */
export async function uploadTeamImage(file, userId, kind) {
  if (!TYPES[file.type]) throw new Error("Image PNG, JPEG, WebP ou GIF uniquement.");
  const gif = file.type === "image/gif";
  if (file.size > (gif ? MAX_GIF : MAX_IMAGE)) throw new Error(gif ? "GIF trop lourd (5 Mo au plus)." : "Image trop lourde (2 Mo au plus).");
  const path = `${userId}/${kind}-${Date.now()}.${TYPES[file.type]}`;
  const { error } = await supabase.storage.from("team-media").upload(path, file, { contentType: file.type });
  if (error) throw new Error("Envoi de l'image impossible. Réessaie dans un instant.");
  return supabase.storage.from("team-media").getPublicUrl(path).data.publicUrl;
}
