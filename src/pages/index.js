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
    src="/assets/HomePage.png"
    className="w-full h-full object-cover"
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
              className="absolute left-[730px] top-[148px]"
            />

            {/* SOUS-TITRE */}
            <img
              src="/assets/Matchmaking structuré, mode Ra....png"
              alt="Sous titre"
              className="absolute left-[857px] top-[24px]"
            />

            {/* PARAGRAPHE */}
            <img
              src="/assets/La plateforme de compétition mo....png"
              alt="Paragraphe"
              className="absolute left-[349px] top-[51px]"
            />

            {/* BOUTONS */}
            <div className="flex gap-4">

              {/* BOUTON JAUNE */}
              <img
                src="/assets/Buttonjaune.png"
                alt="Jouez Maintenant"
                className="absolute left-[246.41px] top-[47.92px] cursor-pointer hover:opacity-90 transition"
              />

              {/* BOUTON DISCORD */}
              <a
                href="https://sixsence-backend.onrender.com/auth/discord"
                className="block"
              >
                <img
                  src="/assets/Buttondiscord.png"
                  alt="Rejoindre Discord"
                  className="absolute left-[238px] top-[48px] cursor-pointer hover:opacity-90 transition"
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
              className="absolute left-[84px] top-[14px]"
            />

            {/* WINDOWS APPLICATION */}
            <img
              src="/assets/Containerapp.png"
              alt="Application Windows"
              className="absolute left-[86.19px] top-[51px]"
            />

            {/* BOUTON INSTALLER */}
            <img
              src="/assets/Buttonapp.png"
              alt="Installer"
              className="absolute left-[202px] top-[34.8px] cursor-pointer hover:opacity-90 transition"
            />

          </div>

        </div>
      </main>
    </div>
  );
}
