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
    <div className="relative min-h-screen bg-[#07070D] text-white overflow-hidden">

      {/* ---------------------- PARTICLES BACKGROUND ---------------------- */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/particles.png"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* ---------------------- HEADER ---------------------- */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <img src="/assets/logo.png" alt="Six Sence" className="h-10" />

        <a
          href="https://sixsence-backend.onrender.com/auth/discord"
          className="px-5 py-2 bg-[#5865F2] rounded-lg font-semibold"
        >
          Discord
        </a>
      </header>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <main className="relative z-10 text-center mt-20 px-4">

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

        {/* ---------------------- WINDOWS APP BOX ---------------------- */}
        <div className="mt-16 mx-auto w-[400px] bg-[#0B0B12] rounded-[6px] p-6 flex flex-col items-center border border-white/10">
          <div className="flex gap-2 mb-4">
            <span className="font-raj font-bold text-[12px] tracking-[2px] uppercase text-white">
              Application
            </span>
            <span className="font-raj font-semibold text-[12px] tracking-[2px] uppercase text-white/60">
              Windows
            </span>
          </div>

          <button className="w-[200px] h-[36px] bg-[#FFB84C] rounded-[3px] shadow-[0_0_20px_rgba(255,184,76,0.4)] font-raj font-bold uppercase">
            INSTALLER L’APPLICATION
          </button>
        </div>
      </main>
    </div>
  );
}
