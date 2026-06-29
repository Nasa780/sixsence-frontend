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

      {/* --------------------------- BACKGROUND + PARTICLES --------------------------- */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Tactical Background */}
        <img
          src="/assets/TacticalBackground.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />

        {/* Particles */}
        <img
          src="/assets/Particles.png"
          alt="Particles"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* --------------------------- HEADER --------------------------- */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <img src="/assets/Header.png" alt="Six Sence" className="h-12" />

{/* BOUTON DISCORD IMAGE */}
<a
  href="https://sixsence-backend.onrender.com/auth/discord"
  className="block"
>
  <img
    src="/assets/Buttondiscord.png"
    alt="Rejoindre Discord"
    className="h-12 pointer-events-auto hover:opacity-90 transition"
  />
</a>
      </header>

      {/* --------------------------- MAIN CONTENT --------------------------- */}
      <main className="relative z-10 text-center mt-20 px-4">

        {/* MAIN CONTENT IMAGE */}
        <img
          src="/assets/MainContent.png"
          alt="Main Visual"
          className="mx-auto mb-10 w-full max-w-[1200px] pointer-events-none select-none"
        />

        {/* --------------------------- APP CARD --------------------------- */}
        <img
          src="/assets/AppCard.png"
          alt="Application Card"
          className="mx-auto mt-16 w-[400px]"
        />

      </main>
    </div>
  );
}
