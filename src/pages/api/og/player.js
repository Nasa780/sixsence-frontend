import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, discordAvatarPng, loadFallbackFonts, loadFonts, supabaseRest } from "../../../lib/og";
import { emblemDataUrl } from "../../../lib/rankEmblem";
import { cardInfo } from "../../../lib/cards";
import { RANKS, levelFor, nextRank, rankFor } from "../../../lib/ranks";

export const config = { runtime: "edge" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { gold, goldLight, goldPale, goldDark } = OG_COLORS;
const BANNER = 300;
/** Silhouette de ville et de palmiers (cartes GTA 6). */
const SKYLINE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="110" viewBox="0 0 400 60" preserveAspectRatio="none"><g fill="#12061c"><path d="M0 60V44h10v-8h8v8h6V30h10v14h8v-6h10v6h6V24h12v20h6v-10h8v10h10V36h6v8h8V28h14v16h6v-8h10v8h12V32h8v12h6V20h10v24h8v-6h12v6h10V38h6v6h8V26h12v18h6v-8h10v8h10V34h8v10h10V30h12v14h8v-10h10v10h12V40h10v20Z"/><path d="M330 60 L333 22 L335 22 L337 60Z"/><path d="M334 22 q-14 -4 -22 4 q10 -6 22 -2Z M334 22 q14 -4 22 4 q-10 -6 -22 -2Z M334 22 q-8 -10 -18 -10 q10 2 18 12Z M334 22 q8 -10 18 -10 q-10 2 -18 12Z"/><path d="M372 60 L374 30 L376 30 L377 60Z"/><path d="M375 30 q-11 -3 -17 3 q8 -5 17 -1Z M375 30 q11 -3 17 3 q-8 -5 -17 -1Z M375 30 q-6 -8 -14 -8 q8 2 14 9Z"/></g></svg>',
)}`;
/** Coins taillés (façon interface militaire) : coupe en haut à gauche et en bas à droite. */
const CUT = 34;
const FRAME = `polygon(${CUT}px 0, 1200px 0, 1200px ${630 - CUT}px, ${1200 - CUT}px 630px, 0 630px, 0 ${CUT}px)`;
const frameLine = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><polygon points="${CUT},1 1199,1 1199,${630 - CUT} ${1200 - CUT},629 1,629 1,${CUT}" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="2"/></svg>`,
  )}`;

/**
 * Carte de joueur (aperçu du lien d'un profil sur Discord, X…), 1200 x 630, façon COD :
 * la carte de visite équipée en bannière en haut, l'avatar qui la chevauche, puis pseudo,
 * rang, points, position au classement, statistiques et progression vers le rang suivant ;
 * coins taillés (le fond reste transparent hors du cadre).
 * /api/og/player?id=<joueur>  (le paramètre v ne sert qu'à forcer le rafraîchissement).
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!UUID.test(id)) return new Response("Joueur invalide", { status: 400 });

  const [fonts, users, profiles, seasons] = await Promise.all([
    loadFonts(origin),
    supabaseRest(`users?id=eq.${id}&select=username,avatar_url`),
    supabaseRest(`cod_profiles?user_id=eq.${id}&select=points,wins,losses,xp,best_streak,badges,platform,calling_card`),
    supabaseRest("seasons?is_active=eq.true&select=name&limit=1").catch(() => []),
  ]);
  const user = users[0];
  const profile = profiles[0];
  if (!user || !profile) return new Response("Joueur introuvable", { status: 404 });

  // En développement, ?carte=<clé> permet de prévisualiser une autre carte.
  const preview = process.env.NODE_ENV !== "production" ? searchParams.get("carte") : null;
  const card = cardInfo(preview ?? profile.calling_card ?? "sixsence");
  const played = profile.wins + profile.losses;
  const [avatar, position, fallbackFonts, cardImage] = await Promise.all([
    discordAvatarPng(user.avatar_url) ? dataUrl(discordAvatarPng(user.avatar_url), "image/png") : null,
    played > 0 ? supabaseRest(`cod_leaderboard?points=gt.${profile.points}&select=user_id`, { count: true }).then((result) => result.count + 1) : null,
    // Pseudo avec des caractères hors des polices du site (écritures étrangères, lettres stylées…).
    loadFallbackFonts(user.username),
    // Cartes illustrées ou animées : bannière JPEG prête (public/images/cartes/og/<clé>.jpg).
    card.art.og ? dataUrl(`${origin}${card.art.og}`, "image/jpeg") : null,
  ]);

  const rank = rankFor(profile.points);
  const next = nextRank(profile.points);
  const winRate = played > 0 ? Math.round((profile.wins / played) * 100) : null;
  const mvpMonths = (profile.badges || []).filter((badge) => /^mvp-\d{4}-\d{2}$/.test(badge)).length;
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const initials = (user.username || "?").slice(0, 2).toUpperCase();

  const stats = [
    { label: "Classement", value: position ? `#${position}` : "—" },
    { label: "Victoires", value: winRate === null ? "—" : `${winRate}%` },
    { label: "V / D", value: `${profile.wins} / ${profile.losses}` },
    { label: "Niveau", value: String(levelFor(profile.xp)) },
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: OG_COLORS.ink, color: "#fff", clipPath: FRAME }}>
        {/* Bannière : la carte de visite équipée */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: BANNER, display: "flex", overflow: "hidden" }}>
          <CardBanner card={card} image={cardImage} display={display} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: BANNER, display: "flex", background: "linear-gradient(180deg, rgba(7,6,4,0) 45%, rgba(7,6,4,0.92) 100%)" }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: BANNER - 2, width: 1200, height: 2, display: "flex", background: `linear-gradient(90deg, ${goldDark}, ${goldLight}, ${gold}, ${rank.color})` }} />

        {/* Avatar qui chevauche la bannière, rang en dessous */}
        <div style={{ position: "absolute", left: 64, top: 186, width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 228, height: 228, borderRadius: 999, padding: 7, display: "flex", background: `linear-gradient(160deg, ${rank.color}, ${goldDark})`, boxShadow: `0 0 50px ${rank.color}55` }}>
            {avatar ? (
              <img src={avatar} width={214} height={214} style={{ borderRadius: 999, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 214, height: 214, borderRadius: 999, background: "#161616", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontSize: 84, fontWeight: 900, color: goldLight }}>
                {initials}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 22,
              padding: "6px 20px 6px 10px",
              border: `2px solid ${rank.color}`,
              background: `${rank.color}22`,
              color: rank.text,
              fontFamily: display,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <img src={emblemDataUrl(rank)} width={44} height={44} />
            {rank.name}
          </div>
        </div>

        {/* Identité, points, statistiques */}
        <div style={{ position: "absolute", left: 350, top: BANNER + 2, width: 790, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: text, fontSize: 19, fontWeight: 700, letterSpacing: 5, color: goldLight }}>
            <div style={{ display: "flex" }}>
              SIX<span style={{ color: gold }}>SENCE</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
            <span>CLASSÉ MW4</span>
            {seasons?.[0]?.name ? <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span> : null}
            {seasons?.[0]?.name ? <span style={{ textTransform: "uppercase" }}>{seasons[0].name}</span> : null}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ display: "flex", fontFamily: display, fontSize: user.username.length > 14 ? 58 : 72, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>{user.username}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: display,
                  fontSize: 84,
                  fontWeight: 900,
                  lineHeight: 0.85,
                  backgroundImage: `linear-gradient(180deg, ${goldPale}, ${goldLight} 40%, ${gold} 65%, ${goldDark})`,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {profile.points}
              </div>
              <div style={{ display: "flex", marginBottom: 6, fontFamily: text }}>
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>POINTS</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 2, marginTop: 10, background: "rgba(255,255,255,0.1)" }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "8px 16px", background: "#0d0c0a" }}>
                <span style={{ fontFamily: text, fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>{stat.label}</span>
                <span style={{ fontFamily: display, fontSize: 42, fontWeight: 900, marginTop: 2 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Progression vers le rang suivant */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: text, fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: rank.text }}>{rank.name}</span>
                {next.rank ? <span style={{ color: "rgba(255,255,255,0.35)" }}>→</span> : null}
                {next.rank ? <span style={{ color: next.rank.text }}>{next.rank.name}</span> : null}
              </div>
              <span style={{ color: "rgba(255,255,255,0.55)", letterSpacing: 2 }}>
                {next.rank ? `${profile.points} / ${next.rank.min} pts` : "Rang maximal"}
              </span>
            </div>
            <div style={{ display: "flex", marginTop: 8, height: 10, width: 790, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", height: 10, width: Math.max(8, Math.round(790 * Math.min(1, next.progress))), background: next.rank ? `linear-gradient(90deg, ${rank.color}, ${next.rank.color})` : `linear-gradient(90deg, ${goldDark}, ${goldLight})` }} />
            </div>
            <Footer streak={profile.best_streak} mvpMonths={mvpMonths} text={text} />

          </div>
        </div>

        {/* Liseré du bas, aux couleurs or et rang */}
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 1200, height: 6, display: "flex", background: `linear-gradient(90deg, ${goldDark}, ${goldLight}, ${gold}, ${rank.color})` }} />
        <img src={frameLine(goldLight)} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...fonts, ...fallbackFonts],
      headers: { "Cache-Control": "public, max-age=600, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}

/** Bannière de la carte de visite : image prête, ou dessin simplifié (rang, sigle, emblème du site). */
function CardBanner({ card, image, display }) {
  const box = { position: "absolute", left: 0, top: 0, width: 1200, height: BANNER, display: "flex" };
  const { art } = card;
  if (image) return <img src={image} width={1200} height={BANNER} style={{ ...box, objectFit: "cover" }} />;
  if (art.type === "rank") {
    const r = RANKS.find((item) => item.name === art.rank) ?? RANKS[RANKS.length - 1];
    return (
      <div style={{ ...box, background: `linear-gradient(105deg, #0b0b0b 30%, ${r.dark}cc 70%, ${r.color} 120%)` }}>
        <img src={emblemDataUrl(r)} width={210} height={210} style={{ position: "absolute", left: 760, top: 25 }} />
      </div>
    );
  }
  if (art.type === "sunset") {
    return (
      <div style={{ ...box, background: "linear-gradient(180deg,#1a0b2e 0%,#4a1450 38%,#b3305e 68%,#ff7a4a 88%,#ffb45c 100%)" }}>
        <div style={{ position: "absolute", left: 760, top: 40, width: 220, height: 220, borderRadius: 999, display: "flex", background: "linear-gradient(180deg,#ffe08a 0%,#ffb05c 45%,#ff5f8a 100%)" }} />
        {[150, 175, 198, 218].map((top) => (
          <div key={top} style={{ position: "absolute", left: 740, top, width: 260, height: 7, display: "flex", background: "#c23a63" }} />
        ))}
        <img src={SKYLINE} width={1200} height={110} style={{ position: "absolute", left: 0, top: BANNER - 110 }} />
        {art.glyph ? (
          <div style={{ position: "absolute", left: 1010, top: 30, display: "flex", fontFamily: display, fontSize: 110, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{art.glyph}</div>
        ) : null}
      </div>
    );
  }
  const color = art.color ?? art.hue ?? gold;
  const glyph = art.glyph ?? "VI";
  return (
    <div style={{ ...box, background: `linear-gradient(105deg, #0c0c0c 35%, ${color}40 80%, ${color}80 120%)` }}>
      <div style={{ position: "absolute", left: 700, top: 10, display: "flex", fontFamily: display, fontSize: 200, fontWeight: 900, fontStyle: "italic", color, opacity: 0.55, lineHeight: 1 }}>
        {glyph}
      </div>
    </div>
  );
}

/** Ligne du bas : série record à gauche (et MVP du mois), lien du site discret à droite. */
function Footer({ streak, mvpMonths, text }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontFamily: text, fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
      <div style={{ display: "flex", gap: 24 }}>
        <span style={{ display: "flex", gap: 6 }}>
          <span style={{ color: "#fff", fontWeight: 700 }}>Record</span> : {streak} victoire{streak > 1 ? "s" : ""} d'affilée
        </span>
        {mvpMonths > 0 ? <span style={{ color: goldLight }}>MVP du mois ×{mvpMonths}</span> : null}
      </div>
      {/* Lien discret : l'en-tête affiche déjà SIXSENCE en or. */}
      <span style={{ color: "rgba(255,255,255,0.45)" }}>sixsence.fr</span>
    </div>
  );
}
