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
    <div className="min-h-screen bg-[#0B0812] text-white flex justify-center overflow-x-auto">

      {/* CONTENEUR FIGMA EXACT */}
      <div className="relative w-[2189px] h-[1304px]">

        {/* BACKGROUND */}
        <img
          src="/assets/HomePage.png"
          className="absolute inset-0 w-[2189px] h-[1304px] pointer-events-none"
        />

        {/* HEADER DANS LE DESIGN */}
        <header className="absolute left-0 top-0 w-full flex justify-between items-center px-8 py-6">
          <img src="/assets/SixSenceLogo.png" alt="Six Sence" className="h-12" />

          <a href="https://sixsence-backend.onrender.com/auth/discord">
            <img
              src="/assets/Buttondiscord.png"
              alt="Rejoindre Discord"
              className="h-12 hover:opacity-90 transition"
            />
          </a>
        </header>

        {/* SAISON */}
        <img
          src="/assets/Saison 1 — Compétition Ouverte.png"
          className="absolute left-[254px] top-[28px]"
        />

        {/* TITRE SIX SENCE */}
        <img
          src="/assets/SIX SENCE.png"
          className="absolute left-[730px] top-[148px]"
        />

        {/* SOUS-TITRE */}
        <img
          src="/assets/Matchmaking structuré, mode Ra....png"
          className="absolute left-[857px] top-[24px]"
        />

        {/* PARAGRAPHE */}
        <img
          src="/assets/La plateforme de compétition mo....png"
          className="absolute left-[349px] top-[51px]"
        />

        {/* BOUTON JAUNE */}
        <img
          src="/assets/Buttonjaune.png"
          className="absolute left-[246.41px] top-[47.92px] cursor-pointer hover:opacity-90 transition"
        />

        {/* BOUTON BLEU */}
        <a href="https://sixsence-backend.onrender.com/auth/discord">
          <img
            src="/assets/Buttonbleu.png"
            className="absolute left-[246.41px] top-[120px] cursor-pointer hover:opacity-90 transition"
          />
        </a>

        {/* PARAGRAPHE APPLICATION */}
        <img
          src="/assets/Paragraphapplication.png"
          className="absolute left-[84px] top-[14px]"
        />

        {/* WINDOWS APPLICATION */}
        <img
          src="/assets/Containerapp.png"
          className="absolute left-[86.19px] top-[51px]"
        />

        {/* BOUTON INSTALLER */}
        <img
          src="/assets/Buttonapp.png"
          className="absolute left-[202px] top-[34.8px] cursor-pointer hover:opacity-90 transition"
        />

      </div>
    </div>
  );
}
