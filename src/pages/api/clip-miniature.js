/**
 * Miniature d'un clip Medal : l'adresse de l'image, signée par Medal, expire au bout de quelques heures. On la
 * redemande donc à Medal (oEmbed public) et on redirige vers elle ; la réponse reste 1 h dans le cache de Vercel.
 */
const VALID_ID = /^[\w-]{5,40}$/;

export default async function handler(req, res) {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!VALID_ID.test(id)) return res.status(400).end();
  try {
    const answer = await fetch(`https://medal.tv/api/oembed?url=${encodeURIComponent(`https://medal.tv/clips/${id}`)}`, { signal: AbortSignal.timeout(5000) });
    const thumbnail = answer.ok ? (await answer.json()).thumbnail_url : null;
    if (typeof thumbnail !== "string" || !thumbnail.startsWith("https://cdn.medal.tv/")) return res.status(404).end();
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    return res.redirect(302, thumbnail);
  } catch {
    return res.status(404).end();
  }
}
