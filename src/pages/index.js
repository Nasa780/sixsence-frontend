import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../../utils/auth";

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
    <div className="min-h-screen bg-[#05060a] text-white">

      {/* ---------------------- TOP BAR ---------------------- */}
      <header className="flex justify-end items-center p-6">
        <img src="/assets/fr.png" className="w-8 mr-4" />
        <a
          href="https://sixsence-backend.onrender.com/auth/discord"
          className="px-4 py-2 bg-[#5865f2] rounded-lg font-semibold"
        >
          Discord
        </a>
      </header>

      {/* ---------------------- HERO SECTION (VERSION FUSIONNÉE) ---------------------- */}
      <main className="text-center mt-20 px-4">

{/* SAISON */}
<p className="text-gray-300 tracking-widest text-sm">
  SAISON 1 — COMPÉTITION OUVERTE
</p>

{/* TITRE SIX SENCE (Figma) */}
<h1 className="font-raj font-bold text-[168px] leading-[148px] tracking-[3.36px] uppercase bg-heroText bg-clip-text text-transparent text-center">
  SIX SENCE
</h1>

{/* SOUS-TITRE */}
<p className="font-raj font-semibold text-[15.68px] leading-[24px] tracking-[8.1536px] uppercase text-[rgba(255,255,255,0.45)] text-center mt-4">
  MATCHMAKING STRUCTURÉ, MODE RANKED, PROGRESSION RÉELLE.
</p>

{/* PARAGRAPHE */}
<p className="font-inter text-[14.08px] leading-[25px] text-[rgba(175,175,200,0.6)] text-center w-[349px] mx-auto mt-4">
  La plateforme de compétition nouvelle génération.
</p>

{/* CTA */}
<div className="flex justify-center gap-4 mt-10">
  <button className="px-8 py-3 bg-white text-black font-raj font-bold rounded-[3px] shadow">
    Créer un compte
  </button>

  <button className="px-8 py-3 bg-accent text-black font-raj font-bold rounded-[3px] shadow-accent">
    Télécharger l'application
  </button>
</div>


        {/* ---------------------- WINDOWS APP BOX (VERSION Figma) ---------------------- */}
<div className="mt-16 mx-auto w-[400px] bg-[#0B0B12] rounded-[6px] p-6 flex flex-col items-center">
  <div className="flex gap-2 mb-4">
    <span className="font-raj font-bold text-[11.2px] tracking-[2.464px] uppercase text-white">
      Application
    </span>
    <span className="font-raj font-semibold text-[11.2px] tracking-[2.464px] uppercase text-[rgba(255,255,255,0.4)]">
      Windows
    </span>
  </div>

  <button className="w-[202px] h-[34.8px] bg-accent rounded-[3px] shadow-accent font-raj font-bold uppercase">
    Installer l'application
  </button>
</div>


      {/* ---------------------- TERMINAL SOG SI USER CONNECTÉ ---------------------- */}
      {user && (
        <div
          className="min-h-screen flex items-center justify-center text-sog-green font-sog crt-scanlines crt-grain bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/maxresdefault.jpg')" }}
        >
          <div className="sog-panel w-[600px] crt-glitch crt-flicker text-center">
            <h1 className="sog-title mb-10">
              ► SIXSENCE OPERATIONS TERMINAL<span className="blink">_</span>
            </h1>

            <div className="flex flex-col items-center gap-4 mb-10">
              <img
                src={user.avatar}
                className="w-20 h-20 rounded-full border border-sog-green shadow-sog"
              />
              <p className="text-xl">
                CONNECTÉ : <span className="text-sog-green">{user.username}</span>
              </p>
            </div>

            <div className="space-y-4 mx-auto w-[300px] flex flex-col items-center">
              <a href="/queue" className="sog-button block w-full">
                ► MODE CLASSÉ
              </a>

              <a href="/profile" className="sog-button block w-full">
                ► PROFIL
              </a>

              <a href="/leaderboard" className="sog-button block w-full">
                ► CLASSEMENT
              </a>

              <a href="/settings" className="sog-button block w-full">
                ► PARAMÈTRES
              </a>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                className="sog-button block w-full text-red-400 border-red-600 hover:bg-red-900/40"
              >
                ► DÉCONNEXION
              </button>
            </div>

            <p className="opacity-60 mt-10 text-sm">
              SOG BUNKER SYSTEM — ACCESS LEVEL 3
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
