import { useEffect } from "react";
import Image from "next/image";

// 🖥️ Version desktop Ranked
import Appranked from "../components/Appranked";
import Sectionmarginranked from "../components/Sectionmarginranked";
import Sectionmarginranked2 from "../components/Sectionmarginranked2";
import Sectionmarginranked3 from "../components/Sectionmarginranked3";
import Sectionmarginranked4 from "../components/Sectionmarginranked4";
import Sectionmarginranked5 from "../components/Sectionmarginranked5";
import Sectionmarginranked6 from "../components/Sectionmarginranked6";
import Footerranked from "../components/Footerranked";
import Background from "../components/Background";

export default function Ranked() {

  // 🔥 Récupération du token JWT dans l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Stocker le token JWT du backend
      localStorage.setItem("session", token);

      // Nettoyer l’URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(145deg, #06070F 6.17%, #080B14 36.85%, #0A0C10 63.15%, #07080C 93.83%)"
        }}
      />

      {/* HEXAGONAL BACKGROUND */}
      <Background />

      {/* 🖥️ DESKTOP */}
      <div className="hidden md:flex flex-col items-center justify-center w-full">
        <Appranked />
        <Sectionmarginranked />
        <Sectionmarginranked2 />
        <Sectionmarginranked3 />
        <Sectionmarginranked4 />
        <Sectionmarginranked5 />
        <Sectionmarginranked6 />
        <Footerranked />
      </div>
    </div>
  );
}
