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

// 📱 Version mobile Ranked
import HeaderMobile from "../components/HeaderMobile";
import SectionmarginrankedMobile from "../components/SectionmarginrankedMobile";
import Sectionmarginranked2Mobile from "../components/Sectionmarginranked2Mobile";
import Sectionmarginranked3Mobile from "../components/Sectionmarginranked3Mobile";
import Sectionmarginranked4Mobile from "../components/Sectionmarginranked4Mobile";
import Sectionmarginranked5Mobile from "../components/Sectionmarginranked5Mobile";
import Sectionmarginranked6Mobile from "../components/Sectionmarginranked6Mobile";
import FooterrankedMobile from "../components/FooterrankedMobile";

import Background from "../components/Background";

export default function Ranked() {

  // 🔥 Récupération du token JWT dans l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("session", token);
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

      {/* 📱 MOBILE */}
      <div className="flex md:hidden flex-col items-center justify-center w-full px-4">
        <HeaderMobile />
        <SectionmarginrankedMobile />
        <Sectionmarginranked2Mobile />
        <Sectionmarginranked3Mobile />
        <Sectionmarginranked4Mobile />
        <Sectionmarginranked5Mobile />
        <Sectionmarginranked6Mobile />
        <FooterrankedMobile />
      </div>

    </div>
  );
}
