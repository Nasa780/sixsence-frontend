import React, { useEffect, useState } from "react";

/**
 * SIX SENCE — Esports landing page
 * Single-file React component, styled with Tailwind CSS.
 * Drop this in as index.js (or import the default export wherever needed).
 */

// ---------- tiny inline icons (no external icon lib required) ----------
const IconPlay = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconDiscord = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3c-.21.375-.444.879-.608 1.282a18.27 18.27 0 0 0-5.55 0A9.55 9.55 0 0 0 9.115 3a19.736 19.736 0 0 0-4.435 1.37C1.5 9.045.838 13.58 1.17 18.057A19.9 19.9 0 0 0 7.05 21c.49-.67.927-1.382 1.303-2.13a12.78 12.78 0 0 1-2.05-.99c.172-.127.34-.258.502-.393 3.953 1.83 8.24 1.83 12.148 0 .164.135.331.266.502.393-.652.392-1.34.722-2.053.99.376.748.812 1.46 1.303 2.13a19.86 19.86 0 0 0 5.881-2.943c.39-5.193-.665-9.687-2.759-13.688ZM8.68 15.331c-1.183 0-2.157-1.09-2.157-2.428 0-1.337.955-2.428 2.157-2.428 1.21 0 2.176 1.1 2.157 2.428 0 1.338-.946 2.428-2.157 2.428Zm6.64 0c-1.183 0-2.157-1.09-2.157-2.428 0-1.337.955-2.428 2.157-2.428 1.21 0 2.176 1.1 2.157 2.428 0 1.338-.937 2.428-2.157 2.428Z" />
  </svg>
);

const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHex = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

const IconWindows = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 5.5L10.4 4.5V11.3H3V5.5Z" />
    <path d="M11.3 4.36L21 3V11.2H11.3V4.36Z" />
    <path d="M3 12.3H10.4V19.1L3 18.1V12.3Z" />
    <path d="M11.3 12.3H21V20.6L11.3 19.24V12.3Z" />
  </svg>
);

// ---------- decorative background ----------
function Starfield() {
  const stars = [
    { top: "10%", left: "23%", s: 2 }, { top: "16%", left: "82%", s: 1.5 },
    { top: "8%", left: "62%", s: 1.5 }, { top: "26%", left: "8%", s: 1.5 },
    { top: "33%", left: "55%", s: 1.5 }, { top: "41%", left: "20%", s: 1 },
    { top: "47%", left: "92%", s: 1.5 }, { top: "62%", left: "30%", s: 1.5 },
    { top: "70%", left: "65%", s: 1.5 }, { top: "78%", left: "10%", s: 1.5 },
    { top: "85%", left: "75%", s: 1.5 }, { top: "92%", left: "45%", s: 1.5 },
    { top: "55%", left: "5%", s: 1 }, { top: "20%", left: "40%", s: 1 },
    { top: "65%", left: "88%", s: 1 }, { top: "37%", left: "73%", s: 1 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* diagonal light streaks */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-[18%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
        <div className="absolute top-0 left-[44%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
        <div className="absolute top-0 right-[10%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
      </div>
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-slate-400/70"
          style={{ top: st.top, left: st.left, width: st.s, height: st.s }}
        />
      ))}
      {/* outline diamonds */}
      <div className="absolute top-[60px] left-[110px] h-4 w-4 rotate-45 border border-amber-500/40" />
      <div className="absolute bottom-[40px] right-[100px] h-4 w-4 rotate-45 border border-amber-500/30" />
    </div>
  );
}

// ---------- install app toast (bottom-left) ----------
function InstallToast() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="absolute bottom-6 left-6 w-[260px] rounded-md border border-amber-500/20 bg-[#0b0e16]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
      <button
        onClick={() => setOpen(false)}
        aria-label="Fermer"
        className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-300"
      >
        <IconClose className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-amber-500/15 text-amber-400">
          <IconWindows className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.15em] text-white">APPLICATION</p>
          <p className="text-[10px] tracking-[0.15em] text-slate-500">WINDOWS</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-slate-400">
        Installez SixSence sur votre PC pour une expérience optimale.
      </p>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-amber-500 py-2.5 text-[11px] font-bold tracking-[0.1em] text-[#15110a] transition hover:bg-amber-400">
        <IconDownload className="h-3.5 w-3.5" />
        INSTALLER L'APPLICATION
      </button>
    </div>
  );
}

export default function App() {
  // load condensed display font for the headline / nav
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#0a0c13] text-white"
      style={{ fontFamily: "'Rajdhani', sans-serif" }}
    >
      <Starfield />

      {/* ---------------- NAV ---------------- */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <IconHex className="h-6 w-6 text-amber-400" />
          <span
            className="text-sm font-bold tracking-[0.3em] text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            SIX SENCE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-slate-300">
            <span className="text-base leading-none">🇫🇷</span>
            FR
          </div>
          <button className="flex items-center gap-2 rounded bg-[#5865F2] px-4 py-2 text-xs font-bold tracking-wide text-white transition hover:bg-[#4752c4]">
            <IconDiscord className="h-4 w-4" />
            Discord
          </button>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-24 text-center sm:pt-28">
        {/* eyebrow badge */}
        <div className="mb-8 flex items-center gap-2 rounded border border-amber-500/40 bg-amber-500/[0.06] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span
            className="text-[11px] font-semibold tracking-[0.2em] text-amber-400"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            SAISON 1 — COMPÉTITION OUVERTE
          </span>
        </div>

        {/* headline */}
        <h1
          className="select-none text-[88px] font-bold leading-[0.9] tracking-tight sm:text-[120px] md:text-[150px]"
          style={{
            fontFamily: "'Oswald', sans-serif",
            backgroundImage: "linear-gradient(180deg, #ffffff 0%, #ffffff 35%, #f5a623 75%, #d9870f 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 40px rgba(245,166,35,0.25))",
          }}
        >
          SIX SENCE
        </h1>

        {/* divider */}
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60 sm:w-28" />
          <span className="text-amber-500/70">⟨⟨</span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-amber-500/70">⟩⟩</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60 sm:w-28" />
        </div>

        {/* tagline */}
        <p
          className="mt-6 text-xs font-semibold tracking-[0.35em] text-slate-300 sm:text-sm"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          MATCHMAKING STRUCTURÉ, MODE RANKED, PROGRESSION RÉELLE.
        </p>

        {/* description */}
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
          La plateforme de compétition nouvelle génération.
          <br />
          Matchmaking en temps réel, classement dynamique.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="flex items-center justify-center gap-2 rounded bg-amber-500 px-7 py-3.5 text-[13px] font-bold tracking-[0.1em] text-[#15110a] shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
            <IconPlay className="h-4 w-4" />
            JOUEZ GRATUITEMENT
          </button>
          <button className="flex items-center justify-center gap-2 rounded border border-cyan-400/60 px-7 py-3.5 text-[13px] font-bold tracking-[0.1em] text-cyan-300 transition hover:bg-cyan-400/10">
            <IconDiscord className="h-4 w-4" />
            REJOINDRE DISCORD
          </button>
        </div>

        {/* scroll indicator */}
        <IconChevronDown className="mt-20 h-5 w-5 animate-bounce text-slate-600" />
      </main>

      <InstallToast />
    </div>
  );
}