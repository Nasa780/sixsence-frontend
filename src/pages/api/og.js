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
          <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
            <path d="M32 4 56.25 18v28L32 60 7.75 46V18L32 4Z" stroke="#d4af37" strokeWidth="3" strokeLinejoin="round" />
            <path d="M32 10.5 50.6 21.25v21.5L32 53.5 13.4 42.75v-21.5L32 10.5Z" stroke="#9c7c1c" strokeWidth="1" strokeLinejoin="round" />
            <path d="M15 32c5-7 10.5-10.5 17-10.5S44 25 49 32c-5 7-10.5 10.5-17 10.5S20 39 15 32Z" stroke="#f1d77a" strokeWidth="2.6" strokeLinejoin="round" />
            <circle cx="32" cy="32" r="6.5" stroke="#d4af37" strokeWidth="1.6" />
            <path d="M32 27.5 36.5 32 32 36.5 27.5 32 32 27.5Z" fill="#f8ecc0" />
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
