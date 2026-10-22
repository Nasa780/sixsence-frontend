import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts, supabaseRest } from "../../../lib/og";

export const config = { runtime: "edge" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { gold, goldLight, ink } = OG_COLORS;
const CUT = 34;
const FRAME = `polygon(${CUT}px 0, 1200px 0, 1200px ${630 - CUT}px, ${1200 - CUT}px 630px, 0 630px, 0 ${CUT}px)`;
const frameLine = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><polygon points="${CUT},1 1199,1 1199,${630 - CUT} ${1200 - CUT},629 1,629 1,${CUT}" fill="none" stroke="${color}" stroke-opacity="0.6" stroke-width="2"/></svg>`,
  )}`;

/**
 * Carte d'équipe (aperçu du lien d'une fiche d'équipe sur Discord, X…), 1200 x 630 : lueur à la couleur
 * de l'équipe, blason ou logo, nom et tag, place en Division, points, bilan, trophées ; coins taillés.
 * /api/og/team?id=<équipe>  (invite=1 : bandeau « Invitation » pour un lien d'invitation ; v ne sert qu'à forcer le rafraîchissement).
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const invite = searchParams.get("invite") === "1";
  if (!UUID.test(id)) return new Response("Équipe invalide", { status: 400 });

  const [fonts, teams, members] = await Promise.all([
    loadFonts(origin),
    supabaseRest(`teams?id=eq.${id}&select=name,tag,color,logo_url,points,wins,losses,trophies,disbanded_at,cup_tournament`),
    supabaseRest(`team_members?team_id=eq.${id}&select=user_id`),
  ]);
  const team = teams[0];
  if (!team || team.cup_tournament) return new Response("Équipe introuvable", { status: 404 });

  const [position, logo, logoMark, fallbackFonts] = await Promise.all([
    team.disbanded_at ? null : supabaseRest(`teams?disbanded_at=is.null&cup_tournament=is.null&points=gt.${team.points}&select=id`, { count: true }).then((r) => r.count + 1),
    team.logo_url && /\.(png|jpe?g)(\?|$)/i.test(team.logo_url) ? dataUrl(team.logo_url) : null,
    dataUrl(`${origin}/images/logo.png`, "image/png"),
    loadFallbackFonts(`${team.name} ${team.tag}`),
  ]);

  const color = /^#[0-9a-f]{6}$/i.test(team.color) ? team.color : gold;
  const played = team.wins + team.losses;
  const trophies = team.trophies ?? [];
  const golds = trophies.filter((t) => t.place === "or" || t.place === "winner").length;
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const stats = [
    { label: "Division", value: position ? `#${position}` : "—" },
    { label: "Points", value: String(team.points) },
    { label: "V / D", value: `${team.wins} / ${team.losses}` },
    { label: "Victoires", value: played ? `${Math.round((team.wins / played) * 100)}%` : "—" },
    { label: "Trophées", value: trophies.length ? `${trophies.length}${golds ? ` · ${golds} or` : ""}` : "0" },
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: ink, color: "#fff", clipPath: FRAME }}>
        {/* Lueurs à la couleur de l'équipe et grille fine */}
        <div style={{ position: "absolute", left: -200, top: -220, width: 900, height: 900, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${color}55 0%, ${color}00 65%)` }} />
        <div style={{ position: "absolute", right: -260, bottom: -320, width: 800, height: 800, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${gold}33 0%, ${gold}00 65%)` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.07, backgroundImage: `linear-gradient(${gold} 1px, transparent 1px), linear-gradient(90deg, ${gold} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        {/* Tag géant en filigrane */}
        <div style={{ position: "absolute", right: 40, top: 30, display: "flex", fontFamily: display, fontWeight: 900, fontSize: 260, lineHeight: 1, color: `${color}1c` }}>{team.tag.toUpperCase()}</div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", padding: "64px 72px" }}>
          {/* En-tête : SixSence · Division */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {logoMark ? <img src={logoMark} width={44} height={44} style={{ objectFit: "contain" }} /> : null}
            <div style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: goldLight }}>SIXSENCE</div>
            <div style={{ display: "flex", width: 40, height: 2, background: `${gold}88`, marginLeft: 8, marginRight: 8 }} />
            <div style={{ display: "flex", fontFamily: text, fontSize: 20, letterSpacing: 6, color: "#22d3ee" }}>DIVISION</div>
            {invite ? (
              <div style={{ display: "flex", marginLeft: "auto", padding: "10px 22px", background: gold, color: ink, fontFamily: display, fontWeight: 900, fontSize: 24, letterSpacing: 4 }}>INVITATION</div>
            ) : null}
          </div>

          {/* Blason, nom, tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 56 }}>
            <div style={{ display: "flex", width: 190, height: 190, alignItems: "center", justifyContent: "center", border: `3px solid ${color}`, background: `${color}1f`, boxShadow: `0 0 60px ${color}55` }}>
              {logo ? (
                <img src={logo} width={176} height={176} style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 70, color }}>{team.tag.toUpperCase()}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
              <div style={{ display: "flex", fontFamily: text, fontWeight: 700, fontSize: 30, letterSpacing: 4, color }}>[{team.tag}]</div>
              <div style={{ display: "flex", fontFamily: [display, ...fallbackFonts.map((f) => f.name)].join(", "), fontWeight: 900, fontSize: team.name.length > 14 ? 92 : 118, lineHeight: 0.95, textTransform: "uppercase" }}>{team.name}</div>
              {team.disbanded_at ? <div style={{ display: "flex", marginTop: 10, fontFamily: text, fontSize: 24, color: "#ffffff88" }}>Équipe dissoute</div> : null}
            </div>
          </div>

          {/* Chiffres */}
          <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 22px", borderLeft: `3px solid ${color}`, background: "rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", fontFamily: text, fontSize: 16, letterSpacing: 4, color: "#ffffff80", textTransform: "uppercase" }}>{stat.label}</div>
                <div style={{ display: "flex", marginTop: 6, fontFamily: display, fontWeight: 900, fontSize: 46, color: stat.label === "Division" ? goldLight : "#fff" }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontFamily: text, fontSize: 18, color: "#ffffff60" }}>
            {members.length} joueur{members.length > 1 ? "s" : ""} · sixsence.fr
          </div>
        </div>
        <img src={frameLine(color)} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...fonts, ...fallbackFonts],
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
    },
  );
}
