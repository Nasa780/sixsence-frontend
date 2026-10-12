import { ImageResponse } from "next/og";
import { dataUrl, loadFonts } from "../../../lib/og";

export const config = { runtime: "edge" };

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f1d77a";
const GOLD_PALE = "#f8ecc0";
const GOLD_DARK = "#9c7c1c";
const SUNSET = "#ff9a5c";

/**
 * Image d'aperçu des liens (Discord, X, WhatsApp…), 1200 x 630.
 * Visuels MW4 (bichromie or) et GTA 6 (bichromie coucher de soleil) séparés par une
 * diagonale dorée, cadre fin, accroche en dégradé or.
 * Paramètre facultatif : ?title=Classement (remplace l'accroche « Entre dans l'arène »).
 *
 * Polices du site chargées depuis Google Fonts au premier appel (voir lib/og.js).
 */
function Emblem({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 4 56.25 18v28L32 60 7.75 46V18L32 4Z" stroke={GOLD} strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 10.5 50.6 21.25v21.5L32 53.5 13.4 42.75v-21.5L32 10.5Z" stroke={GOLD_DARK} strokeWidth="1" strokeLinejoin="round" />
      <path d="M15 32c5-7 10.5-10.5 17-10.5S44 25 49 32c-5 7-10.5 10.5-17 10.5S20 39 15 32Z" stroke={GOLD_LIGHT} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="6.5" stroke={GOLD} strokeWidth="1.6" />
      <path d="M32 27.5 36.5 32 32 36.5 27.5 32 32 27.5Z" fill={GOLD_PALE} />
    </svg>
  );
}

const box = { position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex" };

/** Coin de cadre « tactique » : deux traits dorés. */
function Corner({ x, y, flipX, flipY }) {
  const h = { position: "absolute", width: 44, height: 2, background: GOLD, [flipX ? "right" : "left"]: 0, [flipY ? "bottom" : "top"]: 0 };
  const v = { position: "absolute", width: 2, height: 44, background: GOLD, [flipX ? "right" : "left"]: 0, [flipY ? "bottom" : "top"]: 0 };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 44, height: 44, display: "flex" }}>
      <div style={h} />
      <div style={v} />
    </div>
  );
}

export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const custom = searchParams.get("title")?.slice(0, 32);
  const [fonts, mw4, gta] = await Promise.all([loadFonts(), dataUrl(`${origin}/og/og-mw4.jpg`), dataUrl(`${origin}/og/og-gta6.jpg`)]);
  const display = fonts.length ? "Saira" : "sans-serif";
  const text = fonts.length ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#070604", color: "#fff" }}>
        {/* Visuels en bichromie */}
        {mw4 ? <img src={mw4} width={700} height={630} style={{ position: "absolute", left: -120, top: 0 }} /> : null}
        {gta ? <img src={gta} width={700} height={630} style={{ position: "absolute", left: 620, top: 0 }} /> : null}

        {/* Voiles : centre profond, vignettage, lueurs or (gauche) et coucher de soleil (droite) */}
        <div
          style={{
            ...box,
            background:
              "linear-gradient(90deg, rgba(7,6,4,0.12) 0%, rgba(7,6,4,0.62) 22%, rgba(7,6,4,0.93) 42%, rgba(7,6,4,0.95) 50%, rgba(7,6,4,0.93) 58%, rgba(7,6,4,0.62) 78%, rgba(7,6,4,0.12) 100%)",
          }}
        />
        <div
          style={{
            ...box,
            background:
              "radial-gradient(ellipse 60% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%), radial-gradient(ellipse at 50% 46%, rgba(212,175,55,0.16), transparent 42%), radial-gradient(ellipse at 100% 100%, rgba(255,120,70,0.28), transparent 45%), radial-gradient(ellipse at 0% 100%, rgba(212,175,55,0.22), transparent 45%)",
          }}
        />

        {/* Diagonale dorée sur toute la hauteur, estompée derrière le texte */}
        <div
          style={{
            position: "absolute",
            left: 599,
            top: -60,
            width: 2,
            height: 750,
            transform: "rotate(12deg)",
            background: `linear-gradient(180deg, ${GOLD} 0%, rgba(212,175,55,0.5) 18%, transparent 34%, transparent 66%, rgba(255,154,92,0.5) 82%, ${SUNSET} 100%)`,
          }}
        />

        {/* Cadre fin et coins tactiques */}
        <div style={{ position: "absolute", left: 28, top: 28, width: 1144, height: 574, border: "1px solid rgba(212,175,55,0.28)", display: "flex" }} />
        <Corner x={22} y={22} />
        <Corner x={1134} y={22} flipX />
        <Corner x={22} y={564} flipY />
        <Corner x={1134} y={564} flipX flipY />

        {/* Mentions des deux univers, discrètes, en bas des visuels */}
        <div style={{ position: "absolute", left: 64, bottom: 58, display: "flex", fontFamily: text, fontSize: 15, fontWeight: 700, letterSpacing: 5, color: GOLD_LIGHT, opacity: 0.85 }}>
          CALL OF DUTY · MW4
        </div>
        <div style={{ position: "absolute", right: 64, bottom: 58, display: "flex", fontFamily: text, fontSize: 15, fontWeight: 700, letterSpacing: 5, color: "#ffc2a0", opacity: 0.85 }}>
          GRAND THEFT AUTO VI
        </div>

        {/* Contenu central */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Emblem size={46} />
            <div style={{ display: "flex", fontFamily: display, fontSize: 34, fontWeight: 900, letterSpacing: 9 }}>
              SIX<span style={{ color: GOLD }}>SENCE</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30 }}>
            <div style={{ width: 70, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <div style={{ display: "flex", fontFamily: text, fontSize: 17, fontWeight: 700, letterSpacing: 8, color: GOLD_LIGHT }}>PLATEFORME GAMING</div>
            <div style={{ width: 70, height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: display,
              fontSize: 124,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: 2,
              textTransform: "uppercase",
              backgroundImage: `linear-gradient(180deg, ${GOLD_PALE} 0%, ${GOLD_LIGHT} 38%, ${GOLD} 62%, ${GOLD_DARK} 100%)`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {custom || "Entre dans l'arène"}
          </div>

          <div style={{ display: "flex", marginTop: 22, fontFamily: text, fontSize: 27, fontWeight: 500, color: "rgba(255,255,255,0.86)", letterSpacing: 0.5 }}>
            Matchs classés MW4 · Événements GTA 6
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 34, fontFamily: text, fontSize: 15, fontWeight: 700, letterSpacing: 5, color: "rgba(255,255,255,0.55)" }}>
            <span>SAISON 1</span>
            <span style={{ color: GOLD }}>◆</span>
            <span>ACCÈS GRATUIT</span>
            <span style={{ color: GOLD }}>◆</span>
            <span>CONNEXION DISCORD</span>
          </div>
        </div>
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
