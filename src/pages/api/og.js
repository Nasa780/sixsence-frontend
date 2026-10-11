import { ImageResponse } from "next/og";

export const config = { runtime: "edge" };

/**
 * Image d'aperçu des liens (Discord, X, WhatsApp…), 1200 x 630.
 * Paramètre facultatif : ?title=Classement%20COD
 */
export default function handler(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Plateforme multigaming").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.28), transparent 55%), #0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <path d="M16 2 28 9v14L16 30 4 23V9L16 2Z" stroke="#d4af37" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M8 16c2.4-3.4 5-5 8-5s5.6 1.6 8 5c-2.4 3.4-5 5-8 5s-5.6-1.6-8-5Z" stroke="#d4af37" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M16 13.2 18.8 16 16 18.8 13.2 16 16 13.2Z" fill="#d4af37" />
          </svg>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
            Six<span style={{ color: "#d4af37" }}>Sence</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>{title}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "rgba(255,255,255,0.65)" }}>
            Classé Call of Duty MW4 · Événements GTA 6 · Connexion Discord
          </div>
        </div>

        <div style={{ display: "flex", height: 6, width: "100%", background: "linear-gradient(90deg, #9c7c1c, #f1d77a, #d4af37, #ff9a5c)" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
