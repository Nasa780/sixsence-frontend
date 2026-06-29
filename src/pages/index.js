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

        {/* TITRE SIX SENCE (VERSION Figma) */}
        <h1 className="text-[168px] leading-[148px] font-extrabold mt-4 bg-gradient-to-b from-[#ffe27a] to-white text-transparent bg-clip-text uppercase">
          SIX SENCE
        </h1>

        {/* SOUS-TITRE */}
        <p className="text-gray-300 text-lg mt-4 uppercase tracking-[8px]">
          MATCHMAKING STRUCTURÉ, MODE RANKED, PROGRESSION RÉELLE.
        </p>

        {/* PARAGRAPHE */}
        <p className="text-gray-400 max-w-xl mx-auto mt-4 text-[17px]">
          La plateforme de compétition Call of Duty nouvelle génération en SND Hardcore.
        </p>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-10">
          <button className="px-6 py-3 bg-[#ff7a00] rounded-xl font-semibold">
            JOUEZ GRATUITEMENT
          </button>

          <a
            href="https://sixsence-backend.onrender.com/auth/discord"
            className="px-6 py-3 bg-[#1a1f3c] text-[#9bb0ff] rounded-xl font-semibold"
          >
            REJOINDRE DISCORD
          </a>
        </div>

        {/* ---------------------- WINDOWS APP BOX (VERSION Figma) ---------------------- */}
        <div className="mt-16 mx-auto w-[320px] bg-white/5 border border-white/10 p-5 rounded-xl text-left">
          <p className="text-[#ff7a00] text-sm font-semibold tracking-[2.4px] uppercase">
            APPLICATION WINDOWS
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Installez SixSence sur votre PC pour une expérience optimale.
          </p>
          <button className="mt-4 px-4 py-2 bg-[#ff7a00] rounded-lg font-semibold">
            INSTALLER L’APPLICATION
          </button>
        </div>
      </main>

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
