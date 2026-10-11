import { ImageResponse } from "next/og";

export const config = { runtime: "edge" };

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f1d77a";
const SUNSET = "#ff9a5c";

/**
 * Image d'aperçu des liens (Discord, X, WhatsApp…), 1200 x 630 :
 * visuel MW4 à gauche, GTA 6 à droite, emblème et titre au centre.
 * Paramètre facultatif : ?title=Classement%20MW4 (remplace « Plateforme gaming »).
 *
 * Polices du site (Saira Condensed, Inter) chargées depuis Google Fonts au premier appel ;
 * en cas d'échec, l'image est rendue avec la police par défaut.
 */
let fontsPromise = null;

async function googleFont(family, weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
  const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
  if (!url) throw new Error("police introuvable");
  return (await fetch(url)).arrayBuffer();
}

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([googleFont("Saira+Condensed", 900), googleFont("Inter", 600)])
      .then(([saira, inter]) => [
        { name: "Saira", data: saira, weight: 900, style: "normal" },
        { name: "Inter", data: inter, weight: 600, style: "normal" },
      ])
      .catch(() => {
        fontsPromise = null;
        return [];
      });
  }
  return fontsPromise;
}

async function picture(origin, path) {
  try {
    const res = await fetch(`${origin}${path}`);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function Emblem({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 4 56.25 18v28L32 60 7.75 46V18L32 4Z" stroke={GOLD} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M32 10.5 50.6 21.25v21.5L32 53.5 13.4 42.75v-21.5L32 10.5Z" stroke="#9c7c1c" strokeWidth="1" strokeLinejoin="round" />
      <path d="M15 32c5-7 10.5-10.5 17-10.5S44 25 49 32c-5 7-10.5 10.5-17 10.5S20 39 15 32Z" stroke={GOLD_LIGHT} strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="6.5" stroke={GOLD} strokeWidth="1.6" />
      <path d="M32 27.5 36.5 32 32 36.5 27.5 32 32 27.5Z" fill="#f8ecc0" />
    </svg>
  );
}

export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const custom = searchParams.get("title")?.slice(0, 40);
  const [fonts, mw4, gta] = await Promise.all([loadFonts(), picture(origin, "/og/og-mw4.jpg"), picture(origin, "/og/og-gta6.jpg")]);
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0a", color: "#fff" }}>
        {/* Visuels des deux jeux */}
        {mw4 ? <img src={mw4} width={700} height={630} style={{ position: "absolute", left: -100, top: 0, objectFit: "cover" }} /> : null}
        {gta ? <img src={gta} width={700} height={630} style={{ position: "absolute", left: 600, top: 0, objectFit: "cover" }} /> : null}

        {/* Voiles : centre sombre pour le texte, teinte or à gauche, coucher de soleil à droite */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.86) 22%, rgba(10,10,10,0.93) 50%, rgba(10,10,10,0.86) 78%, rgba(10,10,10,0.6) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "radial-gradient(ellipse at 0% 100%, rgba(212,175,55,0.35), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(255,154,92,0.35), transparent 45%), linear-gradient(180deg, rgba(10,10,10,0.6) 0%, transparent 25%, transparent 70%, rgba(10,10,10,0.85) 100%)",
          }}
        />

        {/* Séparation dorée inclinée entre les deux univers (en haut et en bas, le texte reste lisible) */}
        <div style={{ position: "absolute", left: 598, top: -40, width: 4, height: 150, background: `linear-gradient(180deg, transparent, ${GOLD})`, transform: "rotate(14deg)" }} />
        <div style={{ position: "absolute", left: 598, bottom: -40, width: 4, height: 150, background: `linear-gradient(0deg, transparent, ${SUNSET})`, transform: "rotate(14deg)" }} />

        {/* Contenu */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Emblem size={64} />
            <div style={{ display: "flex", fontFamily: display, fontSize: 52, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>
              Six<span style={{ color: GOLD }}>Sence</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontFamily: display,
              fontSize: custom ? 104 : 132,
              fontWeight: 900,
              lineHeight: 0.9,
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            {custom ? (
              custom
            ) : (
              <>
                Plateforme&nbsp;<span style={{ color: GOLD_LIGHT }}>gaming</span>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 34, fontFamily: text, fontSize: 26, fontWeight: 600 }}>
            <div style={{ display: "flex", padding: "10px 22px", border: `2px solid ${GOLD}`, color: GOLD_LIGHT, background: "rgba(212,175,55,0.12)" }}>
              Classé MW4 · 5v5
            </div>
            <div style={{ display: "flex", padding: "10px 22px", border: `2px solid ${SUNSET}`, color: "#ffc2a0", background: "rgba(255,154,92,0.12)" }}>
              Événements GTA 6
            </div>
          </div>

          <div style={{ display: "flex", marginTop: 30, fontFamily: text, fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
            Gratuit · Connexion avec Discord · sixsence.fr
          </div>
        </div>

        {/* Ligne de signature en bas */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, display: "flex", background: `linear-gradient(90deg, #9c7c1c, ${GOLD_LIGHT}, ${GOLD}, ${SUNSET})` }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
