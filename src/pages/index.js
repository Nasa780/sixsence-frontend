import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../utils/auth2";


export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Récupération du token dans l'URL
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, "", "/");
    }

    // Si pas authentifié → on ne fetch pas /me
    if (!isAuthenticated()) return;

    // Récupération des infos utilisateur
    fetch("https://sixsence-backend.onrender.com/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#07070D] text-white">

      {/* ---------------------- TOP BAR ---------------------- */}
      <header className="flex justify-end items-center p-6">
        <img src="/assets/fr.png" className="w-8 mr-4" alt="FR" />

        {/* Bouton Discord */}
        <a
          href="https://sixsence-backend.onrender.com/auth/discord"
          className="px-4 py-2 bg-[#5865f2] rounded-lg font-semibold"
        >
          Discord
        </a>
      </header>

      {/* ---------------------- HERO SECTION (Figma) ---------------------- */}
      <main className="text-center mt-20 px-4">

        {/* SAISON */}
        <p className="text-whiteDim tracking-widest text-sm uppercase">
          SAISON 1 — COMPÉTITION OUVERTE
        </p>

        {/* TITRE SIX SENCE */}
        <h1 className="font-raj font-bold text-[168px] leading-[148px] tracking-[3.36px] uppercase bg-heroText bg-clip-text text-transparent text-center">
          SIX SENCE
        </h1>

        {/* SOUS-TITRE */}
        <p className="font-raj font-semibold text-[15.68px] leading-[24px] tracking-[8.1536px] uppercase text-whiteDim text-center mt-4">
          MATCHMAKING STRUCTURÉ, MODE RANKED, PROGRESSION RÉELLE.
        </p>

        {/* PARAGRAPHE */}
        <p className="font-inter text-[14.08px] leading-[25px] text-whiteSoft text-center w-[349px] mx-auto mt-4">
          La plateforme de compétition nouvelle génération.  
          Matchmaking en temps réel, classement dynamique.
        </p>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-10">
          <button className="px-8 py-3 bg-accent text-black font-raj font-bold rounded-[3px] shadow-accent">
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
        <div className="mt-16 mx-auto w-[400px] bg-[#0B0B12] rounded-[6px] p-6 flex flex-col items-center">
          <div className="flex gap-2 mb-4">
            <span className="font-raj font-bold text-[11.2px] tracking-[2.464px] uppercase text-white">
              Application
            </span>
            <span className="font-raj font-semibold text-[11.2px] tracking-[2.464px] uppercase text-whiteDim">
              Windows
            </span>
          </div>

          <button className="w-[202px] h-[34.8px] bg-accent rounded-[3px] shadow-accent font-raj font-bold uppercase">
            INSTALLER L’APPLICATION
          </button>
        </div>
      </main>
    </div>
  );
}
