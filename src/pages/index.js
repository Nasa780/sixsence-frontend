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
<div className="min-h-screen bg-[#0B0812] text-white overflow-x-auto">
  <div className="relative" style={{ width: "2189px", height: "1304px" }}>

    {/* HEADER */}
    <img src="/assets/SixSenceLogo.png" className="absolute left-[50px] top-[40px] h-12" />
    <a href="https://sixsence-backend.onrender.com/auth/discord">
      <img src="/assets/Buttondiscord.png" className="absolute right-[50px] top-[40px] h-12" />
    </a>

    {/* SAISON */}
    <img src="/assets/Saison 1 — Compétition Ouverte.png" className="absolute left-[260px] top-[115px]" />

    {/* TITRE */}
    <img src="/assets/SIX SENCE.png" className="absolute left-[720px] top-[260px]" />

    {/* SOUS-TITRE */}
    <img src="/assets/Matchmaking structuré, mode Rank....png" className="absolute left-[720px] top-[360px]" />

    {/* PARAGRAPHE */}
    <img src="/assets/La plateforme de compétition nouv....png" className="absolute left-[720px] top-[430px]" />

    {/* BOUTON JAUNE */}
    <img src="/assets/Buttonjaune.png" className="absolute left-[720px] top-[520px]" />

    {/* BOUTON BLEU */}
    <img src="/assets/Buttonbleu.png" className="absolute left-[720px] top-[600px]" />

    {/* PARAGRAPHE APPLICATION */}
    <img src="/assets/Paragraphapplication.png" className="absolute left-[150px] top-[900px]" />

    {/* WINDOWS APPLICATION */}
    <img src="/assets/Containerapp.png" className="absolute left-[150px] top-[950px]" />

    {/* BOUTON INSTALLER */}
    <img src="/assets/Buttonapp.png" className="absolute left-[260px] top-[1030px]" />

  </div>
</div>
  );
} 
