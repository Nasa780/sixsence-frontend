import { useEffect } from "react";

import Header from "../components/Header";
import HeaderMobile from "../components/HeaderMobile";

import MainContent from "../components/MainContent";
import MainContentMobile from "../components/MainContentMobile";

import Container from "../components/Container";
import ContainerMobile from "../components/ContainerMobile";

export default function Home() {

  // 🔥 Vérifier la session dès l'arrivée sur la Home
  useEffect(() => {
    fetch("https://sixsence-backend.onrender.com/me", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Not logged");
        return res.json();
      })
      .then(user => {
        console.log("🔥 USER CONNECTÉ :", user);
      })
      .catch(() => {
        console.log("❌ PAS CONNECTÉ");
      });
  }, []);

  return (
    <div
      className="w-full min-h-screen text-white flex flex-col relative"
      style={{
        backgroundImage: "url('/assets/Background.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >

      {/* DESKTOP */}
      <div className="hidden md:block">
        <Header />
        <MainContent />

        <div className="absolute bottom-8 left-8">
          <Container />
        </div>
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <HeaderMobile />
        <MainContentMobile />

        <div className="px-4 mt-10">
          <ContainerMobile />
        </div>
      </div>

    </div>
  );
}
