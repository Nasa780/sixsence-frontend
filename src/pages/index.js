import { useEffect } from "react";

import Header from "../components/Header";
import HeaderMobile from "../components/HeaderMobile";

import MainContent from "../components/MainContent";
import MainContentMobile from "../components/MainContentMobile";

import Container from "../components/Container";
import ContainerMobile from "../components/ContainerMobile";

export default function Home() {

  useEffect(() => {
    const token = localStorage.getItem("session");

    if (!token) {
      console.log("❌ PAS CONNECTÉ");
      return;
    }

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        console.log("🔥 USER CONNECTÉ :", user);
      })
      .catch(() => {
        console.log("❌ Token invalide");
        localStorage.removeItem("session");
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
