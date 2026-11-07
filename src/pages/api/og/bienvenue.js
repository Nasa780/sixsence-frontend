import { ImageResponse } from "next/og";
import { OG_COLORS, dataUrl, loadFallbackFonts, loadFonts, ogCache } from "../../../lib/og";

export const config = { runtime: "edge" };

const { gold, goldLight } = OG_COLORS;
const WIDTH = 1100;
const HEIGHT = 500;
const AVATAR = 190;
const BORDER = 7;
const HEXAGON = "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";

/** Avatar du membre, ou avatar par défaut de Discord ; toujours sur le site d'images de Discord. */
function avatarUrl(id, hash) {
  if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=256`;
  return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(id) >> 22n) % 6}.png`;
}

/**
 * Image de bienvenue du bot Discord (backend services/discordMembers.ts), 1100 x 500 : fond SixSence, avatar en hexagone,
 * pseudo et numéro de membre.
 * /api/og/bienvenue?id=<id Discord>&a=<empreinte de l'avatar>&name=<pseudo>&n=<numéro de membre>
 */
export default async function handler(request) {
  const { searchParams, origin } = new URL(request.url);
  const rawId = searchParams.get("id") ?? "";
  const rawHash = searchParams.get("a") ?? "";
  const id = /^\d{15,22}$/.test(rawId) ? rawId : "0";
  const hash = /^(a_)?[0-9a-f]{32}$/.test(rawHash) ? rawHash : null;
  const name = [...(searchParams.get("name") ?? "Nouveau membre")].slice(0, 32).join("");

  const [fonts, background, avatar, fallbackFonts] = await Promise.all([
    loadFonts(origin),
    dataUrl(`${origin}/images/discord/bienvenue-fond.png`, "image/png"),
    dataUrl(avatarUrl(id, hash), "image/png"),
    loadFallbackFonts(name),
  ]);
  const display = fonts.length ? "Saira" : "sans-serif";
  const titleFont = [display, ...fallbackFonts.map((font) => font.name)].join(", ");
  const size = name.length > 22 ? 46 : name.length > 14 ? 58 : 70;
  const rawNumber = searchParams.get("n") ?? "";
  const number = /^\d{1,7}$/.test(rawNumber) ? Number(rawNumber) : 0;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0a", color: "#fff", alignItems: "center", justifyContent: "center" }}>
        {background ? <img src={background} width={WIDTH} height={HEIGHT} style={{ position: "absolute", left: 0, top: 0 }} /> : null}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 640 }}>
          <div style={{ display: "flex", padding: BORDER, clipPath: HEXAGON, background: `linear-gradient(145deg, ${goldLight}, ${gold} 55%, #9c7c1c)` }}>
            {avatar ? (
              <img src={avatar} width={AVATAR} height={AVATAR} style={{ clipPath: HEXAGON, objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", width: AVATAR, height: AVATAR, clipPath: HEXAGON, background: "#161616" }} />
            )}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontFamily: display, fontWeight: 800, fontSize: 26, letterSpacing: 9, color: goldLight }}>BIENVENUE</div>
          <div style={{ display: "flex", marginTop: 6, fontFamily: titleFont, fontWeight: 900, fontSize: size, lineHeight: 1, textAlign: "center", textTransform: "uppercase" }}>{name}</div>
          {number ? <div style={{ display: "flex", marginTop: 12, fontFamily: display, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "#ffffff90" }}>{`MEMBRE N°${number}`}</div> : null}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: [...fonts, ...fallbackFonts], headers: { "Cache-Control": ogCache("public, s-maxage=86400", fonts, fallbackFonts) } },
  );
}
