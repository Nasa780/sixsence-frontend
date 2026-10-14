import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, discordAvatarPng, loadFallbackFonts, loadFonts, supabaseRest } from "../../../lib/og";
import { emblemDataUrl } from "../../../lib/rankEmblem";
import { cardTint } from "../../../lib/cards";
import { RANKS, levelFor, nextRank, rankFor } from "../../../lib/ranks";

export const config = { runtime: "edge" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { gold, goldLight, goldPale, goldDark } = OG_COLORS;

/**
 * Carte de joueur (aperçu du lien d'un profil sur Discord, X…), 1200 x 630 :
 * avatar, pseudo, rang, points, position au classement et statistiques, sur l'ambiance de la
 * carte de visite équipée (couleurs seulement : le motif gênerait la lecture).
 * /api/og/player?id=<joueur>  (le paramètre v ne sert qu'à forcer le rafraîchissement).
 */
export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!UUID.test(id)) return new Response("Joueur invalide", { status: 400 });

  const [fonts, users, profiles] = await Promise.all([
    loadFonts(),
    supabaseRest(`users?id=eq.${id}&select=username,avatar_url`),
    supabaseRest(`cod_profiles?user_id=eq.${id}&select=points,wins,losses,xp,best_streak,badges,platform,calling_card`),
  ]);
  const user = users[0];
  const profile = profiles[0];
  if (!user || !profile) return new Response("Joueur introuvable", { status: 404 });

  const played = profile.wins + profile.losses;
  const [avatar, position, fallbackFonts] = await Promise.all([
    discordAvatarPng(user.avatar_url) ? dataUrl(discordAvatarPng(user.avatar_url), "image/png") : null,
    played > 0 ? supabaseRest(`cod_leaderboard?points=gt.${profile.points}&select=user_id`, { count: true }).then((result) => result.count + 1) : null,
    // Pseudo avec des caractères hors des polices du site (écritures étrangères, lettres stylées…).
    loadFallbackFonts(user.username),
  ]);

  const rank = rankFor(profile.points);
  const next = nextRank(profile.points);
  const winRate = played > 0 ? Math.round((profile.wins / played) * 100) : null;
  const mvpMonths = (profile.badges || []).filter((badge) => /^mvp-\d{4}-\d{2}$/.test(badge)).length;
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const initials = (user.username || "?").slice(0, 2).toUpperCase();
  const tint = cardTint(profile.calling_card ?? "sixsence", RANKS);

  const stats = [
    { label: "Classement", value: position ? `#${position}` : "—" },
    { label: "Victoires", value: winRate === null ? "—" : `${winRate}%` },
    { label: "V / D", value: `${profile.wins} / ${profile.losses}` },
    { label: "Niveau", value: String(levelFor(profile.xp)) },
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: OG_COLORS.ink, color: "#fff" }}>
        {/* Ambiance de la carte de visite équipée, à droite */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: `linear-gradient(105deg, rgba(0,0,0,0) 38%, ${tint}2e 72%, ${tint}66 100%)`,
          }}
        />
        {/* Halo de la couleur du rang, derrière l'avatar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: `radial-gradient(circle at 22% 50%, ${rank.color}40, transparent 42%), radial-gradient(ellipse at 100% 0%, rgba(212,175,55,0.14), transparent 50%)`,
          }}
        />
        {/* Cadre fin */}
        <div style={{ position: "absolute", left: 28, top: 28, width: 1144, height: 574, border: "1px solid rgba(212,175,55,0.28)", display: "flex" }} />

        {/* Colonne gauche : avatar et rang */}
        <div style={{ position: "absolute", left: 80, top: 0, width: 360, height: 630, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 999,
              padding: 8,
              display: "flex",
              background: `linear-gradient(160deg, ${rank.color}, ${goldDark})`,
              boxShadow: `0 0 60px ${rank.color}55`,
            }}
          >
            {avatar ? (
              <img src={avatar} width={244} height={244} style={{ borderRadius: 999, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 244, height: 244, borderRadius: 999, background: "#161616", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontSize: 96, fontWeight: 900, color: goldLight }}>
                {initials}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 28,
              padding: "8px 26px 8px 14px",
              border: `2px solid ${rank.color}`,
              background: `${rank.color}22`,
              color: rank.text,
              fontFamily: display,
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <img src={emblemDataUrl(rank)} width={56} height={56} />
            {rank.name}
          </div>
        </div>

        {/* Colonne droite : identité, points, statistiques */}
        <div style={{ position: "absolute", left: 500, top: 0, width: 620, height: 630, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: text, fontSize: 18, fontWeight: 700, letterSpacing: 7, color: goldLight }}>
            <div style={{ display: "flex" }}>
              SIX<span style={{ color: gold }}>SENCE</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
            <span>CLASSÉ MW4</span>
          </div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: display, fontSize: user.username.length > 14 ? 76 : 96, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>
            {user.username}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                fontFamily: display,
                fontSize: 120,
                fontWeight: 900,
                lineHeight: 0.85,
                backgroundImage: `linear-gradient(180deg, ${goldPale}, ${goldLight} 40%, ${gold} 65%, ${goldDark})`,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {profile.points}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 6, fontFamily: text }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.6)" }}>POINTS</span>
              {next.rank ? (
                <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
                  {next.rank.min - profile.points} pts avant {next.rank.name}
                </span>
              ) : (
                <span style={{ fontSize: 18, fontWeight: 500, color: goldLight }}>Rang maximal</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 2, marginTop: 34, background: "rgba(255,255,255,0.1)" }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "16px 18px", background: "#0d0c0a" }}>
                <span style={{ fontFamily: text, fontSize: 14, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{stat.label}</span>
                <span style={{ fontFamily: display, fontSize: 40, fontWeight: 900, marginTop: 6 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 22, fontFamily: text, fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
            <span>Meilleure série : {profile.best_streak}</span>
            {mvpMonths > 0 ? <span style={{ color: goldLight }}>⭐ MVP du mois ×{mvpMonths}</span> : null}
            <span>sixsence.fr</span>
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, bottom: 0, width: 1200, height: 6, display: "flex", background: `linear-gradient(90deg, ${goldDark}, ${goldLight}, ${gold}, ${rank.color})` }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...fonts, ...fallbackFonts],
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400" },
    },
  );
}
