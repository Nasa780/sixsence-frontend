import Head from "next/head";

// 🖥️ Version desktop Ranked
import Sectionmarginranked from "../../components/Sectionmarginranked";
import Sectionmarginranked2 from "../../components/Sectionmarginranked2";
import Sectionmarginranked3 from "../../components/Sectionmarginranked3";
import Sectionmarginranked4 from "../../components/Sectionmarginranked4";
import Sectionmarginranked5 from "../../components/Sectionmarginranked5";
import Sectionmarginranked6 from "../../components/Sectionmarginranked6";
import Footerranked from "../../components/Footerranked";

// 📱 Version mobile Ranked
import SectionmarginrankedMobile from "../../components/SectionmarginrankedMobile";
import Sectionmarginranked2Mobile from "../../components/Sectionmarginranked2Mobile";
import Sectionmarginranked3Mobile from "../../components/Sectionmarginranked3Mobile";
import Sectionmarginranked4Mobile from "../../components/Sectionmarginranked4Mobile";
import Sectionmarginranked5Mobile from "../../components/Sectionmarginranked5Mobile";
import Sectionmarginranked6Mobile from "../../components/Sectionmarginranked6Mobile";
import FooterrankedMobile from "../../components/FooterrankedMobile";

import Background from "../../components/Background";
import SiteNav from "../../components/site/SiteNav";
import useIsDesktop from "../../hooks/useIsDesktop";

export default function Ranked() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Head>
        <title>Ranked COD — SixSence</title>
      </Head>

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

      {/* NAVIGATION (ordinateur et mobile) */}
      <SiteNav active="ranked" />

      {/* 🖥️ DESKTOP */}
      {isDesktop !== false && (
      <div className="hidden md:flex flex-col items-center justify-center w-full">
        <Sectionmarginranked />
        <Sectionmarginranked2 />
        <Sectionmarginranked3 />
        <Sectionmarginranked4 />
        <Sectionmarginranked5 />
        <Sectionmarginranked6 />
        <Footerranked />
      </div>
      )}

      {/* 📱 MOBILE */}
      {isDesktop !== true && (
      <div className="flex md:hidden flex-col items-center justify-center w-full px-4">
        <SectionmarginrankedMobile />
        <Sectionmarginranked2Mobile />
        <Sectionmarginranked3Mobile />
        <Sectionmarginranked4Mobile />
        <Sectionmarginranked5Mobile />
        <Sectionmarginranked6Mobile />
        <FooterrankedMobile />
      </div>
      )}
    </div>
  );
}
