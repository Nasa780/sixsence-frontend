import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * Outils des images d'aperçu générées à la volée (routes /api/og*, exécution « edge »).
 * Aucune dépendance au navigateur : fetch uniquement.
 */

let fontsPromise = null;

async function googleFont(family, weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
  const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
  if (!url) throw new Error("police introuvable");
  return (await fetch(url)).arrayBuffer();
}

/** Polices du site (Saira Condensed 900, Inter 500/700) ; tableau vide en cas d'échec. */
export function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([googleFont("Saira+Condensed", 900), googleFont("Inter", 500), googleFont("Inter", 700)])
      .then(([saira, inter, interBold]) => [
        { name: "Saira", data: saira, weight: 900, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ])
      .catch(() => {
        fontsPromise = null;
        return [];
      });
  }
  return fontsPromise;
}

/**
 * Polices de secours pour les caractères absents des polices du site (pseudos en
 * écritures étrangères, lettres « stylées » 𝓪𝓫𝓬, symboles…). Seuls les caractères du
 * texte sont téléchargés (paramètre text de Google Fonts), donc chaque police est minuscule.
 */
const FALLBACK_FAMILIES = [
  "Noto+Sans",
  "Noto+Sans+Math",
  "Noto+Sans+Symbols",
  "Noto+Sans+Symbols+2",
  "Noto+Sans+Tai+Viet",
  "Noto+Sans+JP",
  "Noto+Sans+KR",
  "Noto+Sans+SC",
  "Noto+Sans+Arabic",
  "Noto+Sans+Thai",
  "Noto+Sans+Devanagari",
];

/** Vrai si les octets sont bien une police TrueType / OpenType / WOFF (et non une page d'erreur). */
function isFontFile(data) {
  if (!data || data.byteLength < 4) return false;
  const tag = new TextDecoder("latin1").decode(new Uint8Array(data, 0, 4));
  return tag === "\0\u0001\0\0" || tag === "OTTO" || tag === "true" || tag === "wOFF";
}

export async function loadFallbackFonts(text) {
  // Caractères hors ASCII uniquement : le reste est couvert par les polices du site.
  const special = [...new Set([...String(text || "")].filter((char) => char.codePointAt(0) > 0x7f))].join("");
  if (!special) return [];
  const fonts = await Promise.all(
    FALLBACK_FAMILIES.map(async (family, index) => {
      try {
        const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(special)}`)).text();
        const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
        if (!url) return null;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.arrayBuffer();
        return isFontFile(data) ? { name: `Secours${index}`, data, weight: 400, style: "normal" } : null;
      } catch {
        return null;
      }
    }),
  );
  return fonts.filter(Boolean);
}

/** Image distante -> data URL (null si indisponible). */
export async function dataUrl(url, type = "image/jpeg") {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:${res.headers.get("content-type") || type};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/** Lecture publique dans Supabase (RLS en lecture publique), sans le client JS. */
export async function supabaseRest(path, { count = false } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      ...(count ? { Prefer: "count=exact", Range: "0-0" } : {}),
    },
  });
  if (!res.ok) return count ? { rows: [], count: 0 } : [];
  const rows = await res.json();
  if (!count) return rows;
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
  return { rows, count: Number.isFinite(total) ? total : 0 };
}

/** Avatar Discord en PNG (le moteur d'images ne lit pas le WebP). */
export function discordAvatarPng(url) {
  if (!url || !/^https:\/\/cdn\.discordapp\.com\//.test(url)) return null;
  const clean = url.split("?")[0].replace(/\.(webp|gif|jpg|jpeg)$/i, ".png");
  return `${clean}?size=256`;
}

export const OG_COLORS = {
  gold: "#d4af37",
  goldLight: "#f1d77a",
  goldPale: "#f8ecc0",
  goldDark: "#9c7c1c",
  sunset: "#ff9a5c",
  ink: "#070604",
};
