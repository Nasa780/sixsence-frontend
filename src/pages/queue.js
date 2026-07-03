import { useEffect } from "react";
import Image from "next/image";

// 🖥️ Version desktop Queue
import Appqueue from "../components/Appqueue";

/*
// 📱 Version mobile Queue
import AppqueueMobile from "../components/AppqueueMobile";
import SectionqueueMobile from "../components/SectionqueueMobile";
import Sectionqueue2Mobile from "../components/Sectionqueue2Mobile";
import Sectionqueue3Mobile from "../components/Sectionqueue3Mobile";
import FooterqueueMobile from "../components/FooterqueueMobile";
*/

export default function Queue() {

  // 🔥 Récupération du token Discord dans l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("discord_token", token);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND GRADIENT */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(145deg, #06070F 6.17%, #080B14 36.85%, #0A0C10 63.15%, #07080C 93.83%)"
        }}
      />

      {/* PATTERN HEXAGONAL (ton image Figma) */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.25]"
        style={{
          backgroundImage: "url('/pattern-hex.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto"
        }}
      />

      {/* 🔵 HALO BLEU */}
      <div className="absolute inset-0 -z-5 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(26,107,220,0.25),_transparent_70%)]" />

      {/* 🖥️ DESKTOP */}
      <div className="hidden md:flex flex-col items-center justify-center w-full">
        <Appqueue />
      </div>

      {/* 📱 MOBILE */}
      {/*
      <div className="flex md:hidden flex-col items-center justify-center w-full px-4">
        <AppqueueMobile />
        <SectionqueueMobile />
        <Sectionqueue2Mobile />
        <Sectionqueue3Mobile />
        <FooterqueueMobile />
      </div>
      */}
    </div>
  );
}
