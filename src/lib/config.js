/**
 * Adresses publiques du site. Elles peuvent être surchargées par les variables
 * d'environnement NEXT_PUBLIC_* (Vercel > Settings > Environment Variables),
 * mais fonctionnent telles quelles en production.
 *
 * Ces valeurs sont PUBLIQUES : la clé "publishable" de Supabase est faite pour
 * être lue par le navigateur. Les règles RLS de la base décident de ce qu'elle
 * permet (lecture seule, ici). Ne jamais mettre la clé secrète dans le front.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://sixsence-backend.onrender.com").replace(/\/$/, "");

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trlorzjaypvjvnaopsdm.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_b9GLgoUc1BbOaUo1EoKh8w_Nu1FfIcr";

/** Lien d'invitation vers le serveur Discord (facultatif : affiche les boutons « Rejoindre le Discord »). */
export const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/Crynp3C5ru";

/** Adresse publique du site (liens absolus : aperçus de partage, plan du site). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sixsence.fr").replace(/\/$/, "");

/** Adresse WebSocket du backend (file d'attente en temps réel). */
export const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";
