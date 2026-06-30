export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#0b0b12] overflow-hidden text-white">

      {/* GLOW AMBER TOP-LEFT */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/20 blur-[180px]" />

      {/* GLOW CYAN RIGHT */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/20 blur-[180px]" />

      {/* RADIAL AMBER CENTER */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[900px] h-[900px] bg-amber-500/10 rounded-full blur-[200px]" />
      </div>

      {/* VIGNETTE BOTTOM */}
      <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-t from-black/60 to-transparent" />

      {/* DIAGONAL LINES */}
      <svg className="absolute inset-0 opacity-[0.12]" width="100%" height="100%">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#FFC76A" strokeWidth="1" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#00D2E8" strokeWidth="1" />
      </svg>

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-12 py-10">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" className="text-amber-400">
            <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>

          <span className="font-bold tracking-[3.94px] text-[20px]" style={{ fontFamily: "Rajdhani" }}>
            SIX SENCE
          </span>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="flex items-center gap-4">

          {/* FR BUTTON */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded bg-white/10 opacity-70">
            <svg width="20" height="14">
              <rect width="20" height="14" fill="#0055A4" />
              <rect width="13.3" height="14" fill="#FFFFFF" />
              <rect width="6.6" height="14" fill="#EF4135" />
            </svg>
            <span className="text-sm font-semibold">FR</span>
          </div>

          {/* DISCORD BUTTON */}
          <button className="px-5 py-2.5 rounded bg-[#5865F2] shadow-[0_0_22px_rgba(88,101,242,0.32)] font-bold text-sm tracking-wide">
            Discord
          </button>
        </div>
      </header>
      {/* HERO */}
      <main className="relative z-20 flex flex-col items-center text-center mt-20">

        {/* BADGE */}
        <div className="flex items-center gap-2 px-5 py-2 rounded border border-amber-500/20 bg-amber-500/10">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FFA800]" />
          <span className="text-[12px] font-semibold tracking-[0.3em]" style={{ fontFamily: "Rajdhani" }}>
            SAISON 1 — COMPÉTITION OUVERTE
          </span>
        </div>

        {/* TITLE */}
        <h1
          className="mt-10 text-[168px] font-bold leading-[0.9] tracking-tight"
          style={{
            fontFamily: "Rajdhani",
            backgroundImage: "linear-gradient(180deg, #ffffff 0%, #ffffff 35%, #FFA800 75%, #CC8600 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 110px rgba(255,168,0,0.45))",
          }}
        >
          SIX SENCE
        </h1>

        {/* DECORATIVE LINE */}
        <svg width="260" height="40" className="mt-6 opacity-80">
          <line x1="0" y1="20" x2="260" y2="20" stroke="#FFA800" strokeWidth="2" />
          <line x1="130" y1="10" x2="140" y2="30" stroke="#00D2E8" strokeWidth="2" />
        </svg>

        {/* SUBTITLE */}
        <p
          className="mt-6 text-[20px] tracking-[8.15px] opacity-45"
          style={{ fontFamily: "Rajdhani" }}
        >
          MATCHMAKING STRUCTURÉ — MODE RANKED — PROGRESSION RÉELLE
        </p>

        {/* PARAGRAPH */}
        <p className="mt-4 text-[18px] leading-relaxed text-[rgba(175,175,200,0.6)]" style={{ fontFamily: "Inter" }}>
          La plateforme de compétition nouvelle génération.
          <br />
          Matchmaking en temps réel, classement dynamique.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex gap-6">

          {/* AMBER BUTTON */}
          <button className="px-10 py-4 rounded bg-amber-500 text-[#15110a] font-bold text-[15px] tracking-wide shadow-[0_0_28px_rgba(255,168,0,0.42)]">
            JOUEZ GRATUITEMENT
          </button>

          {/* DISCORD OUTLINE */}
          <button className="px-10 py-4 rounded border border-[rgba(0,210,232,0.38)] text-cyan-300 font-bold text-[15px] tracking-wide shadow-[inset_0_0_18px_rgba(0,210,232,0.25)]">
            REJOINDRE DISCORD
          </button>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="mt-20 opacity-30">
          <div className="w-1 h-10 bg-white/40 mx-auto mb-2" />
          <svg width="20" height="20" className="mx-auto">
            <path d="M5 7l5 5 5-5" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </main>
      {/* APP CARD */}
      <div className="absolute bottom-10 left-10 z-20 w-[320px] p-5 rounded bg-[rgba(9,9,16,0.88)] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">

        {/* AMBER BAR */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-700" />

        {/* ICON + TEXT */}
        <div className="flex items-center gap-4">
          <svg width="36" height="36" viewBox="0 0 24 24">
            <rect x="2" y="2" width="8" height="8" fill="rgba(255,255,255,0.9)" />
            <rect x="14" y="2" width="8" height="8" fill="rgba(255,255,255,0.65)" />
            <rect x="2" y="14" width="8" height="8" fill="rgba(255,255,255,0.65)" />
            <rect x="14" y="14" width="8" height="8" fill="rgba(255,255,255,0.45)" />
          </svg>

          <div>
            <p className="text-[12px] font-bold tracking-[0.2em]" style={{ fontFamily: "Rajdhani" }}>
              APPLICATION
            </p>
            <p className="text-[11px] tracking-[0.2em] text-white/50" style={{ fontFamily: "Rajdhani" }}>
              WINDOWS
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-4 text-[14px] text-[rgba(175,175,200,0.6)]" style={{ fontFamily: "Inter" }}>
          Installez SixSence sur votre PC pour une expérience optimale.
        </p>

        {/* BUTTON */}
        <button className="mt-5 w-full py-3 rounded bg-amber-500 text-[#15110a] font-bold tracking-wide shadow-[0_0_22px_rgba(255,168,0,0.42)]">
          INSTALLER L'APPLICATION
        </button>
      </div>
    </div>
  );
}
