import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../utils/auth";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, "", "/");
    }

    if (!isAuthenticated()) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0B0812] text-white overflow-hidden">

      {/* --------------------------- BACKGROUND + PARTICLES --------------------------- */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Tactical Background */}
        <img
          src="/assets/TacticalBackground.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />

        {/* Particles */}
        <img
          src="/assets/Particles.png"
          alt="Particles"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* --------------------------- HEADER --------------------------- */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <img src="/assets/Header.png" alt="Six Sence" className="h-12" />

        <a
          href="https://sixsence-backend.onrender.com/auth/discord"
          className="px-5 py-2 bg-[#5865F2] rounded-lg font-semibold"
        >
          Discord
        </a>
      </header>

      {/* --------------------------- MAIN CONTENT --------------------------- */}
      <main className="relative z-10 text-center mt-20 px-4">

        {/* MAIN CONTENT IMAGE */}
        <img
          src="/assets/MainContent.png"
          alt="Main Visual"
          className="mx-auto mb-10 w-full max-w-[1200px] pointer-events-none select-none"
        />

        {/* SAISON */}
        <p className="text-white/60 tracking-widest text-sm uppercase">
          SAISON 1 — COMPÉTITION OUVERTE
        </p>

        {/* TITRE SIX SENCE */}
        <h1 className="font-raj font-bold text-[160px] leading-[140px] tracking-[3px] uppercase bg-gradient-to-b from-[#FFD66B] to-white bg-clip-text text-transparent">
          SIX SENCE
        </h1>

        {/* SOUS-TITRE */}
        <p className="font-raj font-semibold text-[16px] leading-[24px] tracking-[8px] uppercase text-white/60 mt-4">
          MATCHMAKING STRUCTURÉ, MODE RANKED, PROGRESSION RÉELLE.
        </p>

        {/* PARAGRAPHE */}
        <p className="font-inter text-[15px] leading-[25px] text-white/70 w-[360px] mx-auto mt-4">
          La plateforme de compétition nouvelle génération.  
          Matchmaking en temps réel, classement dynamique.
        </p>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-10">
          <button className="px-8 py-3 bg-[#FFB84C] text-black font-raj font-bold rounded-[3px] shadow-[0_0_20px_rgba(255,184,76,0.4)]">
            JOUEZ GRATUITEMENT
          </button>

          <a
            href="https://sixsence-backend.onrender.com/auth/discord"
            className="px-8 py-3 bg-[#1A1F3C] text-[#9BB0FF] font-raj font-bold rounded-[3px]"
          >
            REJOINDRE DISCORD
          </a>
        </div>

        {/* --------------------------- APP CARD --------------------------- */}
        <img
          src="/assets/AppCard.png"
          alt="Application Card"
          className="mx-auto mt-16 w-[400px]"
        />

      </main>
    </div>
  );
}
