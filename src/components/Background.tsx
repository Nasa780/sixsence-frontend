export default function App() {
  // Hex geometry — flat-top orientation for cleaner tiling
  // r = circumradius, the pattern tile is w × h
  const r = 22;
  const hexW = r * Math.sqrt(3);        // ~38.1
  const hexH = r * 2;                   // 44
  const tileW = hexW;
  const tileH = hexH * 1.5;            // 66 — one full tile row
  const tw = tileW.toFixed(4);
  const th = tileH.toFixed(4);

  // Pointy-top hex centered at (cx, cy)
  const hex = (cx: number, cy: number, inset = 0) => {
    const ri = r - inset;
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(cx + ri * Math.cos(a)).toFixed(3)},${(cy + ri * Math.sin(a)).toFixed(3)}`;
    }).join(" ");
  };

  // Two hexes per tile to create the offset brick pattern
  const cx1 = hexW / 2;
  const cy1 = r;
  const cx2 = 0;          // left edge (also right edge via repeat)
  const cy2 = r * 2.5;
  const cx3 = hexW;       // right edge
  const cy3 = r * 2.5;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#06070F",
      }}
    >
      {/* ── 1. Base gradient — very subtle diagonal variation ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(140deg, #080B14 0%, #06070F 22%, #0A0C10 48%, #07080C 70%, #080B14 88%, #06070F 100%)",
        }}
      />

      {/* ── 2. Blue-teal ambient top-left glow (matches source image) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 40% at 20% 22%, rgba(8,22,52,0.6) 0%, rgba(6,14,32,0.3) 45%, transparent 70%)",
        }}
      />

      {/* ── 3. Tileable hex grid ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* — Base blue-grey hex pattern — */}
          <pattern
            id="hexBase"
            x="0"
            y="0"
            width={tw}
            height={th}
            patternUnits="userSpaceOnUse"
          >
            {/* Centre hex */}
            <polygon
              points={hex(cx1, cy1)}
              fill="none"
              stroke="#3a5580"
              strokeWidth="0.5"
              opacity="0.18"
            />
            {/* Bottom-left + bottom-right (shared edges) */}
            <polygon
              points={hex(cx2, cy2)}
              fill="none"
              stroke="#3a5580"
              strokeWidth="0.5"
              opacity="0.18"
            />
            <polygon
              points={hex(cx3, cy3)}
              fill="none"
              stroke="#3a5580"
              strokeWidth="0.5"
              opacity="0.18"
            />
          </pattern>

          {/* Diagonal overlay mask — slightly denser in center, lighter at edges */}
          <radialGradient id="centerBoost" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.55" />
          </radialGradient>
          <mask id="hexVignette">
            <rect width="100%" height="100%" fill="url(#centerBoost)" />
          </mask>

          {/* Subtle glow for gold lines */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grain texture */}
          <filter id="grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* Hex base layer — full coverage with vignette softness */}
        <rect
          width="100%"
          height="100%"
          fill="url(#hexBase)"
          mask="url(#hexVignette)"
        />

        {/* ── Diagonal golden accent lines ── */}
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5A800" stopOpacity="0" />
            <stop offset="15%" stopColor="#F5A800" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#FFC200" stopOpacity="0.3" />
            <stop offset="85%" stopColor="#F5A800" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5A800" stopOpacity="0" />
            <stop offset="20%" stopColor="#F5A800" stopOpacity="0.1" />
            <stop offset="55%" stopColor="#FFC200" stopOpacity="0.16" />
            <stop offset="88%" stopColor="#F5A800" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5A800" stopOpacity="0" />
            <stop offset="30%" stopColor="#F5A800" stopOpacity="0.07" />
            <stop offset="60%" stopColor="#FFC200" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Lines rendered in a transformed group to avoid viewBox dependency */}
        <g filter="url(#softGlow)" transform="rotate(-33, 50%, 50%)">
          {/* Main streak */}
          <line x1="-10%" y1="38%" x2="110%" y2="38%" stroke="url(#g1)" strokeWidth="0.85" />
          <line x1="-10%" y1="39.4%" x2="110%" y2="39.4%" stroke="url(#g2)" strokeWidth="0.45" />
          {/* Secondary streak */}
          <line x1="-10%" y1="55%" x2="110%" y2="55%" stroke="url(#g2)" strokeWidth="0.55" />
          <line x1="-10%" y1="56%" x2="110%" y2="56%" stroke="url(#g3)" strokeWidth="0.35" />
          {/* Tertiary faint */}
          <line x1="10%" y1="22%" x2="90%" y2="22%" stroke="url(#g3)" strokeWidth="0.4" />
          <line x1="5%" y1="70%" x2="75%" y2="70%" stroke="url(#g3)" strokeWidth="0.3" />
        </g>

        {/* Grain overlay */}
        <rect
          width="100%"
          height="100%"
          filter="url(#grain)"
          opacity="0.025"
          style={{ mixBlendMode: "screen" }}
        />
      </svg>

      {/* ── Edge vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(3,4,8,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
