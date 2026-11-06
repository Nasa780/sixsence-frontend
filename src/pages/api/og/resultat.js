import { ImageResponse } from "next/og";
import { mapImage } from "../../../lib/maps";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts } from "../../../lib/og";

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 500;
/** Un code couleur par mode : Classé vert, Division cyan, Tournoi rouge. */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d" };
const clip = (value, max) => [...(value ?? "")].slice(0, max).join("");

/**
 * Carte de résultat du bot Discord (backend services/resultCardPolicy.ts), 1200 x 500 : mode, équipes, score, maps et meilleur joueur.
 * /api/og/resultat?k=division&l=<libellé>&a=<équipe>&b=<équipe>&w=A&s=2-1&m=Plaza:6-4,Mumbai:2-6&map=Plaza&pa=&pb=&f=1&best=&bs=&bk=
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const color = COLORS[searchParams.get("k")] ?? OG_COLORS.gold;
  const label = clip(searchParams.get("l"), 40);
  const winner = searchParams.get("w") === "B" ? "B" : "A";
  const sides = [
    { id: "A", name: clip(searchParams.get("a"), 30), players: clip(searchParams.get("pa"), 70) },
    { id: "B", name: clip(searchParams.get("b"), 30), players: clip(searchParams.get("pb"), 70) },
  ];
  const series = /^\d-\d$/.test(searchParams.get("s") ?? "") ? searchParams.get("s").split("-") : null;
  const forfeit = searchParams.get("f") === "1";
  const maps = (searchParams.get("m") ?? "")
    .split(",")
    .map((item) => item.match(/^(.{1,24}):(\d{1,2})-(\d{1,2})$/))
    .filter(Boolean)
    .slice(0, 5);
  const best = clip(searchParams.get("best"), 28);
  const bestScore = Number(searchParams.get("bs")) || 0;
  const bestKills = Number(searchParams.get("bk")) || 0;

  const names = [...sides.flatMap((side) => [side.name, side.players]), best].join(" ");
  const [fonts, fallbackFonts, background] = await Promise.all([
    loadFonts(origin),
    loadFallbackFonts(names),
    dataUrl(`${origin}${mapImage(searchParams.get("map"), { og: true }) ?? "/images/og/classe-bg.jpg"}`),
  ]);
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
          {sides.map((side, index) => {
            const won = side.id === winner;
            return (
              <div key={side.id} style={{ display: "flex", flexDirection: "column", width: 410, alignItems: index === 0 ? "flex-start" : "flex-end", textAlign: index === 0 ? "left" : "right" }}>
                <span style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 20, letterSpacing: 5, color: won ? color : "rgba(255,255,255,0.45)" }}>{won ? "VICTOIRE" : "DÉFAITE"}</span>
                <span style={{ display: "flex", marginTop: 6, fontFamily: titleFont, fontWeight: 900, fontSize: side.name.length > 18 ? 42 : 56, lineHeight: 1.05, textTransform: "uppercase", color: won ? "#fff" : "rgba(255,255,255,0.6)" }}>{side.name}</span>
                {side.players ? <span style={{ display: "flex", marginTop: 8, fontFamily: bodyFont, fontSize: 20, color: "rgba(255,255,255,0.65)" }}>{side.players}</span> : null}
              </div>
            );
          })}
        </div>

        {series ? (
          <div style={{ position: "absolute", left: 500, top: 172, width: 200, display: "flex", justifyContent: "center", fontFamily: display, fontWeight: 900, fontSize: 96, lineHeight: 1 }}>
            <span style={{ color: winner === "A" ? "#fff" : "rgba(255,255,255,0.5)" }}>{series[0]}</span>
            <span style={{ margin: "0 14px", color: "rgba(255,255,255,0.3)" }}>–</span>
            <span style={{ color: winner === "B" ? "#fff" : "rgba(255,255,255,0.5)" }}>{series[1]}</span>
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: bodyFont, fontSize: 21, color: "rgba(255,255,255,0.7)" }}>
          {best ? (
            <span style={{ display: "flex", gap: 10 }}>
              <span style={{ color: OG_COLORS.goldLight, fontWeight: 700 }}>Meilleur joueur</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{best}</span>
              <span>{`${bestScore.toLocaleString("fr-FR")} pts · ${bestKills} élim.`}</span>
            </span>
          ) : (
            <span />
          )}
          <span style={{ color: "rgba(255,255,255,0.45)" }}>sixsence.fr</span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: [...fonts, ...fallbackFonts], headers: { "Cache-Control": "public, s-maxage=31536000, immutable" } },
  );
}
