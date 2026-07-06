import { useEffect } from "react";
import Image from "next/image";
{/*
// 🖥️ Version desktop Profile
import Profile1 from "../components/profile1";
import Profile2 from "../components/Profile2";
import Profile3 from "../components/Profile3";
import Profile4 from "../components/Profile4";
import Profile5 from "../components/Profile5";
import Profile6 from "../components/Profile6";
import Profile7 from "../components/Profile7";
import Profile8 from "../components/Profile8";
import Profile9 from "../components/Profile9";*/}
import Profile1 from "../components/profile1"; 
import Profile11 from "../components/Profile11";
 {/*
// 📱 Version mobile Profile
import Profile1Mobile from "../components/Profile1Mobile";
import Profile2Mobile from "../components/Profile2Mobile";
import Profile3Mobile from "../components/Profile3Mobile";
import Profile4Mobile from "../components/Profile4Mobile";
import Profile5Mobile from "../components/Profile5Mobile";
import Profile6Mobile from "../components/Profile6Mobile";
import Profile7Mobile from "../components/Profile7Mobile";
import Profile8Mobile from "../components/Profile8Mobile";
import Profile9Mobile from "../components/Profile9Mobile";
import Profile10Mobile from "../components/Profile10Mobile"; */}

export default function Profile() {

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

<div    
  className="relative min-h-screen overflow-hidden"
  style={{
    backgroundImage: "url('/images/gold1.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
>

      {/* 🖥️ DESKTOP */}
   <div className="hidden md:flex flex-col items-center justify-center w-full">
  {/*<Profile1 />
        <Profile2 />
     <Profile3 />
        <Profile4 />
        <Profile5 />
        <Profile6 />
        <Profile7 />
        <Profile8 />
        <Profile9 />*/}
        <Profile1 /> 
        <Profile11 />
      </div>

      {/* 📱 MOBILE */}
 {/*  <div className="flex md:hidden flex-col items-center justify-center w-full px-4">
        <Profile1Mobile />
        <Profile2Mobile />
        <Profile3Mobile />
        <Profile4Mobile />
        <Profile5Mobile />
        <Profile6Mobile />
        <Profile7Mobile />
        <Profile8Mobile />
        <Profile9Mobile />
        <Profile10Mobile />
      </div>  */}
    </div>
  );
}
