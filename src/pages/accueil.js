import { useEffect } from "react";

import Navigationaccueil from "../components/Navigationaccueil";
import Containeraccueil from "../components/Containeraccueil";
import Containeraccueil2 from "../components/Containeraccueil2";
import Sectionaccueil from "../components/Sectionaccueil";
import Appaccueil from "../components/Appaccueil";
import Sectionaccueil2 from "../components/Sectionaccueil2";
import Containermarginaccueil from "../components/Containermarginaccueil";

// 🔥 Version mobile optimisée
import NavigationaccueilMobile from "../components/NavigationaccueilMobile";
import ContaineraccueilMobile from "../components/ContaineraccueilMobile";
import Containeraccueil2Mobile from "../components/Containeraccueil2Mobile";
import SectionaccueilMobile from "../components/SectionaccueilMobile";
import AppaccueilMobile from "../components/AppaccueilMobile";
import Sectionaccueil2Mobile from "../components/Sectionaccueil2Mobile";
import ContainermarginaccueilMobile from "../components/ContainermarginaccueilMobile";

export default function Accueil() {

  // 🔥 Récupération du token Discord dans l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Stocker le token
      localStorage.setItem("discord_token", token);

      // Nettoyer l’URL (enlever ?token=...)
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

      {/* GEOMETRIC SHAPE */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="/assets/GeometricBg.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.45]"
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex flex-col items-center justify-center w-full">
        <Navigationaccueil />
        <Containeraccueil />
        <Containeraccueil2 />
        <Sectionaccueil />
        <Appaccueil />
        <Sectionaccueil2 />
        <Containermarginaccueil />
      </div>

      {/* MOBILE */}
      <div className="flex md:hidden flex-col items-center justify-center w-full px-4">

        <NavigationaccueilMobile />
        <ContaineraccueilMobile />
        <Containeraccueil2Mobile />
        <SectionaccueilMobile />
        <AppaccueilMobile />
        <Sectionaccueil2Mobile />
        <ContainermarginaccueilMobile />

      </div>
    </div>
  );
}
