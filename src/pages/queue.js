import { useEffect } from "react";
import Image from "next/image";

// 🖥️ Version desktop Queue
import Appqueue from "../components/Appqueue";
import Appqueue2 from "../components/Appqueue2";
import Appqueue3 from "../components/Appqueue3"; 

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
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0F1923" }}   
    >

      {/* 🖥️ DESKTOP */}
      <div className="hidden md:flex flex-col items-center justify-center w-full">
        <Appqueue />
        <Appqueue2 />
        <Appqueue3 />
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
