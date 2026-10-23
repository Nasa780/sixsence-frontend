import { ImageResponse } from "next/og";
import { mapImage } from "../../../lib/maps";
import { OG_COLORS, dataUrl, loadFonts } from "../../../lib/og";

export const config = { runtime: "edge" };

const { gold, goldLight } = OG_COLORS;
const GREEN = "#34d399";

/**
 * Images du message privé Discord « Match trouvé » (backend services/matchFoundDm.ts), seulement les infos de base :
 *   /api/og/match?map=Plaza&format=3v3&mode=…&left=45 (ou none, bannière fixe « PRÊT ? »)   bannière 1200 x 400 : « Match trouvé », map, format, anneau
 *                                               du temps restant (left secondes, 60 par défaut ; rouge sous 15 s)
 *   /api/og/match?bar=4&total=6[&go=1]          barre des joueurs prêts 1200 x 90 (dorée quand tout le monde est prêt)
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const fonts = await loadFonts(origin);
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";
  const cache = { "Cache-Control": "public, s-maxage=31536000, immutable" };

  if (searchParams.has("bar")) {
    const total = Math.min(10, Math.max(2, Number(searchParams.get("total")) || 2));
    const ready = Math.min(total, Math.max(0, Number(searchParams.get("bar")) || 0));
    const go = searchParams.get("go") === "1";
    const color = go ? gold : GREEN;
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 14, padding: "0 36px", background: "#0a0b0c", overflow: "hidden" }}>
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flex: 1,
                height: 30,
                background: index < ready ? color : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
          <div style={{ display: "flex", marginLeft: 14, fontFamily: display, fontWeight: 900, fontSize: 40, color: "#fff" }}>
            {ready}
            <span style={{ color: "rgba(255,255,255,0.45)" }}>/{total}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 90, fonts, headers: cache },
    );
  }

  const map = (searchParams.get("map") ?? "").slice(0, 24).toUpperCase();
  const format = (searchParams.get("format") ?? "").slice(0, 8).toUpperCase();
  const mode = (searchParams.get("mode") ?? "").replace(/hardcore/i, "HC").slice(0, 36).toUpperCase();
  // Fond : l'image de la map tirée (public/images/maps/og), sinon le visuel du Classé.
  const mapOg = mapImage(searchParams.get("map"), { og: true });
  const [bg, logo] = await Promise.all([dataUrl(`${origin}${mapOg ?? "/images/og/classe-bg.jpg"}`), dataUrl(`${origin}/images/logo.png`, "image/png")]);
  // Anneau du décompte : arc proportionnel au temps restant (le message Discord change d'image toutes les 5 s).
  // left=none : bannière fixe du message Discord (anneau plein « PRÊT ? ») ; le décompte est dans le texte, car une
  // image dont l'adresse change à chaque mise à jour clignote dans Discord.
  const fixed = searchParams.get("left") === "none";
  const left = fixed ? 60 : Math.min(60, Math.max(0, Math.round(Number(searchParams.get("left") ?? 60)) || 0));
  const ring = left <= 15 ? "#e5484d" : GREEN;
  const arc = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><circle cx="120" cy="120" r="106" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="14"/><circle cx="120" cy="120" r="106" fill="none" stroke="${ring}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${((2 * Math.PI * 106 * left) / 60).toFixed(1)} 9999" transform="rotate(-90 120 120)"/></svg>`,
  )}`;
  const corner = (style) => <div style={{ position: "absolute", width: 40, height: 40, borderColor: gold, borderStyle: "solid", display: "flex", ...style }} />;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#040506", color: "#fff" }}>
        {bg ? <img src={bg} width={1200} height={400} style={{ position: "absolute", left: 0, top: 0, opacity: 0.35, objectFit: "cover" }} /> : null}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 400, display: "flex", background: "linear-gradient(90deg, #040506 0%, rgba(4,5,6,0.9) 42%, rgba(4,5,6,0.2) 100%)" }} />
        <div style={{ position: "absolute", left: -160, top: -220, width: 760, height: 760, display: "flex", borderRadius: 9999, background: "radial-gradient(circle, rgba(52,211,153,0.38) 0%, rgba(52,211,153,0) 65%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 400, display: "flex", opacity: 0.07, backgroundImage: "linear-gradient(0deg, #fff 1px, transparent 1px)", backgroundSize: "100% 8px" }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "44px 56px", width: 860 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logo ? <img src={logo} width={34} height={34} style={{ objectFit: "contain" }} /> : null}
            <div style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 26, letterSpacing: 8, color: goldLight }}>SIXSENCE</div>
            <div style={{ display: "flex", width: 44, height: 2, background: `${gold}99` }} />
            <div style={{ display: "flex", fontFamily: text, fontWeight: 700, fontSize: 18, letterSpacing: 7, color: GREEN }}>CLASSÉ</div>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontFamily: display, fontWeight: 900, fontSize: 104, lineHeight: 0.88, textShadow: "0 0 40px rgba(52,211,153,0.4)" }}>MATCH TROUVÉ</div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: display, fontWeight: 900, fontSize: 54, lineHeight: 1, letterSpacing: 4, color: goldLight }}>{map}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, fontFamily: text, fontWeight: 700, fontSize: 18, letterSpacing: 5, color: "rgba(255,255,255,0.6)" }}>
            {format ? <div style={{ display: "flex", padding: "6px 14px", border: `2px solid ${gold}88`, color: goldLight }}>{format}</div> : null}
            {mode}
          </div>
        </div>

        {/* Anneau des 60 secondes */}
        <div style={{ position: "absolute", right: 64, top: 80, width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9999, boxShadow: `0 0 40px ${ring}66` }}>
          <img src={arc} width={240} height={240} style={{ position: "absolute", left: 0, top: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {fixed ? (
              <div style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 64, lineHeight: 1, color: "#fff" }}>PRÊT ?</div>
            ) : (
              <>
                <div style={{ display: "flex", fontFamily: display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: left <= 15 ? "#ffb4b4" : "#fff" }}>{left}</div>
                <div style={{ display: "flex", fontFamily: text, fontWeight: 700, fontSize: 16, letterSpacing: 6, color: ring }}>SECONDES</div>
              </>
            )}
          </div>
        </div>

        {corner({ left: 18, top: 18, borderWidth: "4px 0 0 4px" })}
        {corner({ right: 18, top: 18, borderWidth: "4px 4px 0 0" })}
        {corner({ left: 18, bottom: 18, borderWidth: "0 0 4px 4px" })}
        {corner({ right: 18, bottom: 18, borderWidth: "0 4px 4px 0" })}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, display: "flex", background: `linear-gradient(90deg, transparent, ${GREEN}, ${gold}, transparent)` }} />
      </div>
    ),
    { width: 1200, height: 400, fonts, headers: cache },
  );
}
