import { ImageResponse } from "next/og";
import { SUPABASE_URL } from "../../../lib/config";
import { mapImage } from "../../../lib/maps";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts, ogCache } from "../../../lib/og";

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 500;
/** Un code couleur par mode : Classé vert, Division cyan, Tournoi rouge. */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d" };
const clip = (value, max) => [...(value ?? "")].slice(0, max).join("");
const points = (value) => (/^[+-]\d{1,3}$/.test(value ?? "") ? value : null);

/** Image d'un tiers : seulement Supabase, Discord ou le site, en PNG ou JPEG (next/og ne lit ni le WebP ni le GIF). */
function safeImage(value, origin) {
  if (!value) return null;
  if (/^\/images\/[\w./-]+\.(png|jpe?g)$/.test(value)) return `${origin}${value}`;
  try {
    const url = new URL(value);
    const trusted = url.origin === new URL(SUPABASE_URL).origin || url.origin === "https://cdn.discordapp.com";
    return trusted && /\.(png|jpe?g)$/i.test(url.pathname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Carte de résultat du bot Discord (backend services/resultCardPolicy.ts), 1200 x 500 : mode, tour de coupe, équipes, logos,
 * points, score, maps (ou nom de la map jouée, en Classé) et meilleur joueur.
 * /api/og/resultat?k=division&l=<libellé>&ph=<tour>&a=<équipe>&b=<équipe>&w=A&s=2-1&m=Plaza:6-4,Mumbai:2-6&map=Plaza&pa=&pb=&ga=+25&gb=-25&la=&lb=&f=1&best=&bs=&bk=
 * Meilleur joueur : bandeau en bas (ba=<avatar>&bp=<poses>&bd=<désam.>).
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const color = COLORS[searchParams.get("k")] ?? OG_COLORS.gold;
  const phase = clip(searchParams.get("ph"), 24);
  const label = [clip(searchParams.get("l"), 40), phase].filter(Boolean).join(" · ");
  const winner = searchParams.get("w") === "B" ? "B" : "A";
  const sides = [
    { id: "A", name: clip(searchParams.get("a"), 30), players: clip(searchParams.get("pa"), 70), gain: points(searchParams.get("ga")), logoUrl: safeImage(searchParams.get("la"), origin) },
    { id: "B", name: clip(searchParams.get("b"), 30), players: clip(searchParams.get("pb"), 70), gain: points(searchParams.get("gb")), logoUrl: safeImage(searchParams.get("lb"), origin) },
  ];
  const series = /^\d{1,2}-\d{1,2}$/.test(searchParams.get("s") ?? "") ? searchParams.get("s").split("-") : null;
  const forfeit = searchParams.get("f") === "1";
  const maps = (searchParams.get("m") ?? "")
    .split(",")
    .map((item) => item.match(/^(.{1,24}):(\d{1,2})-(\d{1,2})$/))
    .filter(Boolean)
    .slice(0, 5);
  // Map jouée (Classé, BO1) : son nom s'affiche quand il n'y a pas de score par map (Division, tournoi).
  const mapName = maps.length ? "" : clip(searchParams.get("map"), 24);
  const best = clip(searchParams.get("best"), 28);
  const bestScore = Number(searchParams.get("bs")) || 0;
  const bestKills = Number(searchParams.get("bk")) || 0;
  const bestPlants = Number(searchParams.get("bp")) || 0;
  const bestDefuses = Number(searchParams.get("bd")) || 0;

  const names = [...sides.flatMap((side) => [side.name, side.players]), best].join(" ");
  const [fonts, fallbackFonts, background, logoA, logoB, bestAvatar] = await Promise.all([
    loadFonts(origin),
    loadFallbackFonts(names),
    dataUrl(`${origin}${mapImage(searchParams.get("map"), { og: true }) ?? "/images/og/classe-bg.jpg"}`),
    sides[0].logoUrl ? dataUrl(sides[0].logoUrl) : null,
    sides[1].logoUrl ? dataUrl(sides[1].logoUrl) : null,
    best ? dataUrl(safeImage(searchParams.get("ba"), origin) ?? "") : null,
  ]);
  const logos = { A: logoA, B: logoB };
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const titleFont = [display, ...fallbackFonts.map((font) => font.name)].join(", ");
  const bodyFont = [text, ...fallbackFonts.map((font) => font.name)].join(", ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: "#0a0a0a", color: "#fff", padding: "34px 44px" }}>
        {background ? <img src={background} width={WIDTH} height={HEIGHT} style={{ position: "absolute", left: 0, top: 0, objectFit: "cover" }} /> : null}
        <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, display: "flex", background: "linear-gradient(180deg, rgba(7,6,4,0.7), rgba(7,6,4,0.9))" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 8, height: HEIGHT, display: "flex", background: color }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: display, fontWeight: 800, fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
          <span style={{ color }}>{label}</span>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{forfeit ? "Forfait" : "Résultat"}</span>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          {[sides[0], null, sides[1]].map((side, index) => {
            if (!side) {
              return (
                <div key="score" style={{ display: "flex", width: 240, justifyContent: "center", fontFamily: display, fontWeight: 900, fontSize: 96, lineHeight: 1 }}>
                  {series ? <span style={{ color: winner === "A" ? "#fff" : "rgba(255,255,255,0.5)" }}>{series[0]}</span> : null}
                  {series ? <span style={{ margin: "0 14px", color: "rgba(255,255,255,0.3)" }}>–</span> : null}
                  {series ? <span style={{ color: winner === "B" ? "#fff" : "rgba(255,255,255,0.5)" }}>{series[1]}</span> : null}
                </div>
              );
            }
            const won = side.id === winner;
            return (
              <div key={side.id} style={{ display: "flex", flexDirection: "column", width: 410, alignItems: index === 0 ? "flex-start" : "flex-end", textAlign: index === 0 ? "left" : "right" }}>
                <span style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 20, letterSpacing: 5, color: won ? color : "rgba(255,255,255,0.45)" }}>{won ? "VICTOIRE" : "DÉFAITE"}</span>
                <div style={{ display: "flex", flexDirection: index === 0 ? "row" : "row-reverse", alignItems: "center", gap: 14, marginTop: 6 }}>
                  {logos[side.id] ? <img src={logos[side.id]} width={64} height={64} style={{ objectFit: "contain", opacity: won ? 1 : 0.65 }} /> : null}
                  <span style={{ display: "flex", fontFamily: titleFont, fontWeight: 900, fontSize: side.name.length > 18 ? 42 : 56, lineHeight: 1.05, textTransform: "uppercase", color: won ? "#fff" : "rgba(255,255,255,0.6)" }}>{side.name}</span>
                </div>
                {side.players ? <span style={{ display: "flex", marginTop: 8, fontFamily: bodyFont, fontSize: 20, color: "rgba(255,255,255,0.65)" }}>{side.players}</span> : null}
                {side.gain ? <span style={{ display: "flex", marginTop: 8, fontFamily: display, fontWeight: 900, fontSize: 30, color: won ? color : "rgba(255,255,255,0.55)" }}>{`${side.gain} pts`}</span> : null}
              </div>
            );
          })}
        </div>

        {mapName ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 18px", background: "rgba(255,255,255,0.08)", borderLeft: `3px solid ${color}` }}>
              <span style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 16, letterSpacing: 4, color: "rgba(255,255,255,0.6)" }}>MAP</span>
              <span style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 24, letterSpacing: 2, textTransform: "uppercase" }}>{mapName}</span>
            </div>
          </div>
        ) : null}

        {maps.length ? (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
            {maps.map(([, name, left, right]) => (
              <div key={name} style={{ display: "flex", gap: 10, padding: "6px 14px", background: "rgba(255,255,255,0.08)", fontFamily: text, fontSize: 19, fontWeight: 600 }}>
                <span style={{ color: "rgba(255,255,255,0.65)" }}>{name}</span>
                <span>{`${left} – ${right}`}</span>
              </div>
            ))}
          </div>
        ) : null}

        {best ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", background: "rgba(0,0,0,0.45)" }}>
            {bestAvatar ? <img src={bestAvatar} width={58} height={58} style={{ borderRadius: 29, objectFit: "cover" }} /> : null}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 16, letterSpacing: 4, color: OG_COLORS.goldLight }}>MEILLEUR JOUEUR</span>
              <span style={{ display: "flex", fontFamily: titleFont, fontWeight: 900, fontSize: 32, lineHeight: 1.05, textTransform: "uppercase" }}>{best}</span>
            </div>
            {[["Score", bestScore.toLocaleString("fr-FR")], ["Élim.", bestKills], ["Poses", bestPlants], ["Désam.", bestDefuses]].map(([title, value]) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96 }}>
                <span style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 32, lineHeight: 1 }}>{String(value)}</span>
                <span style={{ display: "flex", marginTop: 2, fontFamily: text, fontSize: 15, color: "rgba(255,255,255,0.6)" }}>{title}</span>
              </div>
            ))}
          </div>
        ) : (
        <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: bodyFont, fontSize: 21, color: "rgba(255,255,255,0.45)" }}>
          <span>sixsence.fr</span>
        </div>
        )}
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: [...fonts, ...fallbackFonts], headers: { "Cache-Control": ogCache("public, s-maxage=31536000, immutable", fonts, fallbackFonts) } },
  );
}
