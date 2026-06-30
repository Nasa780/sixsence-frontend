import React, { useEffect, useState } from "react";

/* -----------------------------------------------------------
   STARFIELD (effet moderne Claude, compatible conteneur fixe)
----------------------------------------------------------- */
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* light streaks */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-[18%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
        <div className="absolute top-0 left-[44%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
        <div className="absolute top-0 right-[10%] h-[140%] w-px rotate-[18deg] bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
      </div>

      {/* stars */}
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-slate-400/70"
          style={{ top: st.top, left: st.left, width: st.s, height: st.s }}
        />
      ))}

      {/* diamonds */}
      <div className="absolute top-[60px] left-[110px] h-4 w-4 rotate-45 border border-amber-500/40" />
      <div className="absolute bottom-[40px] right-[100px] h-4 w-4 rotate-45 border border-amber-500/30" />
    </div>
  );
}

/* -----------------------------------------------------------
   TOAST WINDOWS (Claude → converti pour tes PNG)
----------------------------------------------------------- */
function InstallToast() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="absolute bottom-[40px] left-[40px] z-50">
      <img src="/assets/Paragraphapplication.png" className="absolute left-0 top-0" />
      <img src="/assets/Containerapp.png" className="absolute left-0 top-[50px]" />
      <img
        src="/assets/Buttonapp.png"
        className="absolute left-[120px] top-[120px] cursor-pointer hover:opacity-90"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}

/* -----------------------------------------------------------
   PAGE PRINCIPALE — VERSION HYBRIDE
----------------------------------------------------------- */
export default function App() {

  /* chargement des polices Claude */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0c13] text-white"
         style={{ fontFamily: "'Rajdhani', sans-serif" }}>

      {/* Effet moderne Claude */}
      <Starfield />

      {/* -----------------------------------------------------
         TON CONTENEUR FIXE 2189×1304 (Figma)
      ----------------------------------------------------- */}
      <div className="relative mx-auto"
           style={{ width: "2189px", height: "1304px" }}>

        {/* -----------------------------------------------------
           NAV (Claude → converti en PNG)
        ----------------------------------------------------- */}
        <img src="/assets/SixSenceLogo.png"
             className="absolute left-[50px] top-[40px] z-20" />

        <a href="https://sixsence-backend.onrender.com/auth/discord">
          <img src="/assets/Buttondiscord.png"
               className="absolute right-[50px] top-[40px] z-20 cursor-pointer hover:opacity-90" />
        </a>

        {/* -----------------------------------------------------
           HERO (Claude → converti en PNG + positions Figma)
        ----------------------------------------------------- */}

        {/* SAISON */}
        <img src="/assets/Saison 1 — Compétition Ouverte.png"
             className="absolute left-[254px] top-[115px] z-20" />

        {/* TITRE */}
        <img src="/assets/SIX SENCE.png"
             className="absolute left-[730px] top-[260px] z-20" />

        {/* SOUS-TITRE */}
        <img src="/assets/Matchmaking structuré, mode Rank....png"
             className="absolute left-[730px] top-[360px] z-20" />

        {/* PARAGRAPHE */}
        <img src="/assets/La plateforme de compétition nouv....png"
             className="absolute left-[730px] top-[430px] z-20" />

        {/* BOUTON JAUNE */}
        <img src="/assets/Buttonjaune.png"
             className="absolute left-[730px] top-[520px] z-20 cursor-pointer hover:opacity-90" />

        {/* BOUTON BLEU */}
        <img src="/assets/Buttonbleu.png"
             className="absolute left-[730px] top-[600px] z-20 cursor-pointer hover:opacity-90" />

        {/* -----------------------------------------------------
           TOAST WINDOWS (Claude → converti PNG)
        ----------------------------------------------------- */}
        <InstallToast />

      </div>
    </div>
  );
}
