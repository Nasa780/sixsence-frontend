import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts } from "../../../lib/og";

export const config = { runtime: "edge" };

const { gold, goldLight, ink } = OG_COLORS;
const CUT = 34;
const FRAME = `polygon(${CUT}px 0, 1200px 0, 1200px ${630 - CUT}px, ${1200 - CUT}px 630px, 0 630px, 0 ${CUT}px)`;
const frameLine = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><polygon points="${CUT},1 1199,1 1199,${630 - CUT} ${1200 - CUT},629 1,629 1,${CUT}" fill="none" stroke="${color}" stroke-opacity="0.6" stroke-width="2"/></svg>`,
  )}`;

/** Type d'annonce : étiquette, couleur (codes couleur du site) et visuel éventuel à droite. */
const TYPES = {
  annonce: { label: "ANNONCE", color: gold, glow: gold },
  nouveautes: { label: "NOUVEAUTÉS", color: gold, glow: gold },
  horus: { label: "COUPE HORUS", color: "#e5484d", glow: "#e5484d", art: "/images/trophees/horus-or.png" },
  anubis: { label: "COUPE ANUBIS", color: "#e5484d", glow: "#e5484d", art: "/images/trophees/anubis-or.png" },
  gta: { label: "GTA 6 · ÉVÉNEMENT", color: "#ff9a5c", glow: "#ff5c8a" },
  saison: { label: "SAISON", color: "#34d399", glow: "#34d399" },
};

/**
 * Bandeau des annonces illustrées du bot Discord (backend services/announcements.ts), 1200 x 630 :
 * étiquette du type, titre, sous-titre, logo SixSence, trophée ou médaille pour les coupes ; coins taillés.
 * /api/og/annonce?type=horus&title=…&sub=…
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const kind = TYPES[searchParams.get("type")] ? searchParams.get("type") : "annonce";
  const spec = TYPES[kind];
  const title = (searchParams.get("title") ?? "SixSence").slice(0, 90);
  const sub = (searchParams.get("sub") ?? "").slice(0, 120);

  const [fonts, logoMark, art, fallbackFonts] = await Promise.all([
    loadFonts(origin),
    dataUrl(`${origin}/images/logo.png`, "image/png"),
    spec.art ? dataUrl(`${origin}${spec.art}`, "image/png") : null,
    loadFallbackFonts(`${title} ${sub}`),
  ]);
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const titleFont = [display, ...fallbackFonts.map((f) => f.name)].join(", ");
  const width = art ? 700 : 1000;
  const size = title.length > 48 ? 70 : title.length > 28 ? 88 : 110;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: ink, color: "#fff", clipPath: FRAME }}>
        {/* Lueurs et grille fine */}
        <div style={{ position: "absolute", left: -260, top: -300, width: 900, height: 900, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${spec.glow}44 0%, ${spec.glow}00 65%)` }} />
        <div style={{ position: "absolute", right: -200, bottom: -340, width: 900, height: 900, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${spec.color}38 0%, ${spec.color}00 65%)` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.07, backgroundImage: `linear-gradient(${gold} 1px, transparent 1px), linear-gradient(90deg, ${gold} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        {art ? <img src={art} width={430} height={430} style={{ position: "absolute", right: 50, top: 100, objectFit: "contain" }} /> : null}

        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", padding: "64px 72px" }}>
          {/* En-tête : SixSence · type */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {logoMark ? <img src={logoMark} width={44} height={44} style={{ objectFit: "contain" }} /> : null}
            <div style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: goldLight }}>SIXSENCE</div>
            <div style={{ display: "flex", width: 40, height: 2, background: `${gold}88`, marginLeft: 8, marginRight: 8 }} />
            <div style={{ display: "flex", fontFamily: text, fontWeight: 700, fontSize: 20, letterSpacing: 6, color: spec.color }}>{spec.label}</div>
          </div>

          {/* Titre et sous-titre */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: "auto", maxWidth: width }}>
            <div style={{ display: "flex", width: 90, height: 6, background: spec.color, marginBottom: 26 }} />
            <div style={{ display: "flex", fontFamily: titleFont, fontWeight: 900, fontSize: size, lineHeight: 0.95, textTransform: "uppercase" }}>{title}</div>
            {sub ? <div style={{ display: "flex", marginTop: 22, fontFamily: text, fontWeight: 500, fontSize: 30, color: "#ffffffb0" }}>{sub}</div> : null}
          </div>

          <div style={{ display: "flex", fontFamily: text, fontSize: 20, letterSpacing: 2, color: "#ffffff70" }}>sixsence.fr</div>
        </div>
        <img src={frameLine(spec.color)} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...fonts, ...fallbackFonts],
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
