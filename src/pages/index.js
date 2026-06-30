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
    <div className="min-h-screen bg-[#0B0812] text-white flex justify-center">

      {/* PAGE */}
      <div className="w-[2189px] h-[1304px] relative">

        {/* HEADER */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6">
          <img src="/assets/SixSenceLogo.png" className="h-12" />
          <a href="https://sixsence-backend.onrender.com/auth/discord">
            <img src="/assets/Buttondiscord.png" className="h-12" />
          </a>
        </div>

        {/* SAISON */}
        <img
          src="/assets/Saison 1 — Compétition Ouverte.png"
          className="absolute left-[254px] top-[28px]"
        />

        {/* TITRE */}
        <img
          src="/assets/SIX SENCE.png"
          className="absolute left-[730px] top-[148px]"
        />

        {/* SOUS-TITRE */}
        <img
          src="/assets/Matchmaking structuré, mode Ranked, progression ré.png"
          className="absolute left-[857px] top-[24px]"
        />

        {/* PARAGRAPHE */}
        <img
          src="/assets/La plateforme de compétition nouvelle génération..png"
          className="absolute left-[349px] top-[51px]"
        />

        {/* BOUTON JAUNE */}
        <img
          src="/assets/Buttonjaune.png"
          className="absolute left-[246px] top-[310px] cursor-pointer hover:opacity-90 transition"
        />

        {/* BOUTON BLEU */}
        <img
          src="/assets/Buttonbleu.png"
          className="absolute left-[246px] top-[380px] cursor-pointer hover:opacity-90 transition"
        />

        {/* PARAGRAPHE APPLICATION */}
        <img
          src="/assets/Paragraphapplication.png"
          className="absolute left-[84px] top-[850px]"
        />

        {/* WINDOWS APPLICATION */}
        <img
          src="/assets/Paragraphwindows.png"
          className="absolute left-[86px] top-[900px]"
        />

        {/* BOUTON INSTALLER */}
        <img
          src="/assets/Buttonapp.png"
          className="absolute left-[202px] top-[950px] cursor-pointer hover:opacity-90 transition"
        />

      </div>
    </div>
  );
}
