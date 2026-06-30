import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../utils/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [scale, setScale] = useState(1);

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

    const updateScale = () => {
      const s = window.innerWidth / 2189;
      setScale(s);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Fonction utilitaire pour scaler les positions
  const pos = (value) => value * scale;

  return (
    <div className="min-h-screen bg-[#0B0812] text-white flex flex-col">

      {/* HEADER — COLLÉ EN HAUT */}
      <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6">
        <img src="/assets/SixSenceLogo.png" alt="Six Sence" className="h-12" />

        <a href="https://sixsence-backend.onrender.com/auth/discord">
          <img
            src="/assets/Buttondiscord.png"
            alt="Rejoindre Discord"
            className="h-12 hover:opacity-90 transition"
          />
        </a>
      </header>

      {/* MAIN */}
      <main className="flex justify-center items-start mt-0 pt-0">

        {/* CONTENEUR FIGMA SCALÉ */}
        <div
          className="relative"
          style={{
            width: `${2189 * scale}px`,
            height: `${1304 * scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >

          {/* BACKGROUND */}
          <img
            src="/assets/HomePage.png"
            className="absolute inset-0 w-[2189px] h-[1304px] pointer-events-none"
          />

          {/* SAISON */}
          <img
            src="/assets/Saison 1 — Compétition Ouverte.png"
            style={{
              position: "absolute",
              left: pos(254),
              top: pos(28),
            }}
          />

          {/* TITRE SIX SENCE */}
          <img
            src="/assets/SIX SENCE.png"
            style={{
              position: "absolute",
              left: pos(730),
              top: pos(148),
            }}
          />

          {/* SOUS-TITRE */}
          <img
            src="/assets/Matchmaking structuré, mode Ra....png"
            style={{
              position: "absolute",
              left: pos(857),
              top: pos(24),
            }}
          />

          {/* PARAGRAPHE */}
          <img
            src="/assets/La plateforme de compétition mo....png"
            style={{
              position: "absolute",
              left: pos(349),
              top: pos(51),
            }}
          />

          {/* BOUTON JAUNE */}
          <img
            src="/assets/Buttonjaune.png"
            style={{
              position: "absolute",
              left: pos(246.41),
              top: pos(47.92),
            }}
            className="cursor-pointer hover:opacity-90 transition"
          />

          {/* BOUTON BLEU */}
          <a href="https://sixsence-backend.onrender.com/auth/discord">
            <img
              src="/assets/Buttonbleu.png"
              style={{
                position: "absolute",
                left: pos(246.41),
                top: pos(120),
              }}
              className="cursor-pointer hover:opacity-90 transition"
            />
          </a>

          {/* PARAGRAPHE APPLICATION */}
          <img
            src="/assets/Paragraphapplication.png"
            style={{
              position: "absolute",
              left: pos(84),
              top: pos(14),
            }}
          />

          {/* WINDOWS APPLICATION */}
          <img
            src="/assets/Containerapp.png"
            style={{
              position: "absolute",
              left: pos(86.19),
              top: pos(51),
            }}
          />

          {/* BOUTON INSTALLER */}
          <img
            src="/assets/Buttonapp.png"
            style={{
              position: "absolute",
              left: pos(202),
              top: pos(34.8),
            }}
            className="cursor-pointer hover:opacity-90 transition"
          />

        </div>
      </main>
    </div>
  );
}
