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

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/HomePage.png"
          className="absolute inset-0 w-[2189px] h-[1304px]"
        />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex justify-between items-center">
        <img src="/assets/SixSenceLogo.png" alt="Six Sence" className="h-12" />

        {/* ✔ Bouton Discord EN HAUT */}
        <a href="https://sixsence-backend.onrender.com/auth/discord">
          <img
            src="/assets/Buttondiscord.png"
            alt="Rejoindre Discord"
            className="h-12 hover:opacity-90 transition"
          />
        </a>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex justify-center">

        <div className="relative mx-auto w-[2189px] h-[1304px]">

          {/* SAISON */}
          <img
            src="/assets/Saison 1 — Compétition Ouverte.png"
            alt="Saison"
            className="absolute left-[???px] top-[???px]"
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

          {/* ✔ BOUTON JAUNE */}
          <img
            src="/assets/Buttonjaune.png"
            alt="Jouez Maintenant"
            className="absolute left-[246.41px] top-[47.92px] cursor-pointer hover:opacity-90 transition"
          />

          {/* ✔ BOUTON BLEU À CÔTÉ DU JAUNE */}
          <a href="https://sixsence-backend.onrender.com/auth/discord">
            <img
              src="/assets/Buttonbleu.png"
              alt="Discord"
              className="absolute left-[246.41px] top-[120px] cursor-pointer hover:opacity-90 transition"
            />
          </a>

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
      </main>
    </div>
  );
}
