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

      {/* --------------------------- BACKGROUND --------------------------- */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/TacticalBackground.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <img
          src="/assets/Particles.png"
          alt="Particles"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* --------------------------- HEADER --------------------------- */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <img src="/assets/SixSenceLogo.png" alt="Six Sence" className="h-12" />

        <a
          href="https://sixsence-backend.onrender.com/auth/discord"
          className="block"
        >
          <img
            src="/assets/Buttonbleu.png"
            alt="Discord"
            className="h-12 hover:opacity-90 transition"
          />
        </a>
      </header>

      {/* --------------------------- MAIN CONTENT --------------------------- */}
      <main className="relative z-10 flex justify-center mt-20 px-4">

        {/* CONTAINER GLOBAL FIGMA — 2189px */}
        <div className="w-full max-w-[2189px] mx-auto flex justify-between">

          {/* --------------------------- COLONNE GAUCHE --------------------------- */}
          <div className="flex flex-col">

            {/* SAISON */}
            <img
              src="/assets/Saison 1 — Compétition Ouverte.png"
              alt="Saison"
              className="mb-4"
            />

            {/* TITRE SIX SENCE */}
            <img
              src="/assets/SIX SENCE.png"
              alt="Six Sence"
              className="mb-6"
            />

            {/* SOUS-TITRE */}
            <img
              src="/assets/Matchmaking structuré, mode Ra....png"
              alt="Sous titre"
              className="mb-4"
            />

            {/* PARAGRAPHE */}
            <img
              src="/assets/La plateforme de compétition mo....png"
              alt="Paragraphe"
              className="mb-10"
            />

            {/* BOUTONS */}
            <div className="flex gap-4">

              {/* BOUTON JAUNE */}
              <img
                src="/assets/Buttonjaune.png"
                alt="Jouez Maintenant"
                className="cursor-pointer hover:opacity-90 transition"
              />

              {/* BOUTON DISCORD */}
              <a
                href="https://sixsence-backend.onrender.com/auth/discord"
                className="block"
              >
                <img
                  src="/assets/Buttondiscord.png"
                  alt="Rejoindre Discord"
                  className="cursor-pointer hover:opacity-90 transition"
                />
              </a>

            </div>
          </div>

          {/* --------------------------- COLONNE DROITE --------------------------- */}
          <div className="flex flex-col items-end">

            {/* PARAGRAPHE APPLICATION */}
            <img
              src="/assets/Paragraphapplication.png"
              alt="Application"
              className="mb-4"
            />

            {/* CARD APPLICATION */}
            <img
              src="/assets/Containerapp.png"
              alt="Application Windows"
            />

            {/* BOUTON INSTALLER */}
            <img
              src="/assets/Buttonapp.png"
              alt="Installer"
              className="mt-4 cursor-pointer hover:opacity-90 transition"
            />

          </div>

        </div>
      </main>
    </div>
  );
}
