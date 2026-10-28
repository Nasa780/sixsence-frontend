import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts } from "../../../lib/og";

export const config = { runtime: "edge" };

const { gold, goldLight, ink } = OG_COLORS;
const W = 900;
const H = 1200;
const CUT = 48;
const FRAME = `polygon(${CUT}px 0, ${W}px 0, ${W}px ${H - CUT}px, ${W - CUT}px ${H}px, 0 ${H}px, 0 ${CUT}px)`;
const frameLine = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><polygon points="${CUT},2 ${W - 2},2 ${W - 2},${H - CUT} ${W - CUT},${H - 2} 2,${H - 2} 2,${CUT}" fill="none" stroke="${color}" stroke-opacity="0.7" stroke-width="3"/></svg>`,
  )}`;

/** Type de coupe : étiquette, couleur (rouge Tournoi du site) et trophée ou médaille. */
const KINDS = {
  horus: { label: "COUPE HORUS", color: "#e5484d", art: "/images/trophees/horus-or.png" },
  anubis: { label: "COUPE ANUBIS", color: "#e5484d", art: "/images/trophees/anubis-or.png" },
  saison: { label: "TOURNOI DE FIN DE SAISON", color: "#e5484d", art: "/images/trophees/horus-or.png" },
};

/**
 * Affiche d'une coupe (900 x 1200) quand l'admin n'en a pas envoyé : nom choisi, trophée Horus ou médaille Anubis,
 * date, format et places, aux couleurs SixSence. Adresse construite par le backend (services/cupPosters.ts).
 * /api/og/affiche?kind=horus&name=…&date=…&format=…&places=…
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const kind = KINDS[searchParams.get("kind")] ? searchParams.get("kind") : "horus";
  const spec = KINDS[kind];
  const name = (searchParams.get("name") ?? spec.label).slice(0, 60);
  const date = (searchParams.get("date") ?? "").slice(0, 60);
  const format = (searchParams.get("format") ?? "").slice(0, 80);
  const places = (searchParams.get("places") ?? "").slice(0, 30);

  const [fonts, logoMark, art, fallbackFonts] = await Promise.all([
    loadFonts(origin),
    dataUrl(`${origin}/images/logo.png`, "image/png"),
    dataUrl(`${origin}${spec.art}`, "image/png"),
    loadFallbackFonts(`${name} ${date} ${format}`),
  ]);
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const titleFont = [display, ...fallbackFonts.map((f) => f.name)].join(", ");
  const size = name.length > 34 ? 76 : name.length > 20 ? 96 : 120;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: ink, color: "#fff", clipPath: FRAME }}>
        {/* Lueurs, grille fine et rais de lumière derrière le trophée */}
        <div style={{ position: "absolute", left: -250, top: -120, width: 1400, height: 1000, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${spec.color}55 0%, ${spec.color}00 60%)` }} />
        <div style={{ position: "absolute", left: 150, top: 120, width: 600, height: 600, display: "flex", borderRadius: 9999, background: `radial-gradient(circle, ${gold}40 0%, ${gold}00 65%)` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.07, backgroundImage: `linear-gradient(${gold} 1px, transparent 1px), linear-gradient(90deg, ${gold} 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 620, display: "flex", background: `linear-gradient(180deg, ${ink}00 0%, ${ink}f2 45%, ${ink} 100%)` }} />
        {art ? <img src={art} width={520} height={520} style={{ position: "absolute", left: (W - 520) / 2, top: 150, objectFit: "contain" }} /> : null}

        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", padding: "64px 70px" }}>
          {/* En-tête : SixSence · type de coupe */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {logoMark ? <img src={logoMark} width={48} height={48} style={{ objectFit: "contain" }} /> : null}
            <div style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: goldLight }}>SIXSENCE</div>
          </div>

          {/* Nom, date, format */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ display: "flex", fontFamily: text, fontWeight: 700, fontSize: 24, letterSpacing: 7, color: spec.color }}>{spec.label}</div>
            <div style={{ display: "flex", width: 110, height: 7, background: spec.color, marginTop: 18, marginBottom: 22 }} />
            <div style={{ display: "flex", fontFamily: titleFont, fontWeight: 900, fontSize: size, lineHeight: 0.92, textTransform: "uppercase" }}>{name}</div>
            {date ? <div style={{ display: "flex", marginTop: 30, fontFamily: display, fontWeight: 800, fontSize: 44, letterSpacing: 2, textTransform: "uppercase", color: goldLight }}>{date}</div> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
              {format ? <div style={{ display: "flex", fontFamily: text, fontWeight: 500, fontSize: 26, color: "#ffffffb8" }}>{format}</div> : null}
              {places ? (
                <div style={{ display: "flex", border: `2px solid ${spec.color}aa`, padding: "4px 14px", fontFamily: text, fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: spec.color }}>
                  {places}
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", marginTop: 34, fontFamily: text, fontSize: 20, letterSpacing: 3, color: "#ffffff66" }}>sixsence.fr</div>
          </div>
        </div>
        <img src={frameLine(spec.color)} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [...fonts, ...fallbackFonts],
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
