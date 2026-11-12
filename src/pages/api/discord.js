import { DISCORD_INVITE_URL } from "../../lib/config";

/**
 * Chiffres du serveur Discord pour l'accueil (`home/DiscordLive`) : membres et membres en ligne, lus sur l'invitation
 * publique (aucun réglage du serveur nécessaire). Demandé ici plutôt que par le navigateur : l'adresse des visiteurs
 * ne part pas chez Discord, et la réponse reste 5 minutes dans le cache de Vercel (une seule demande à Discord).
 */
const CODE = DISCORD_INVITE_URL.split("/").pop();

export default async function handler(req, res) {
  try {
    const answer = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(CODE)}?with_counts=true`, { signal: AbortSignal.timeout(5000) });
    if (!answer.ok) return res.status(502).json({ members: null, online: null });
    const invite = await answer.json();
    const members = Number(invite.approximate_member_count) || null;
    const online = Number(invite.approximate_presence_count) || null;
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ members, online });
  } catch {
    return res.status(502).json({ members: null, online: null });
  }
}
