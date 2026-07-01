import type { NextPage } from "next";
import Image from "next/image";

const MainContent: NextPage = () => {
  return (
    <div className="w-full h-[1259.3px] relative flex flex-col items-center justify-center pt-0 px-6 pb-20 box-border leading-[normal] tracking-[normal] text-center text-[10.1px] text-[#ffa800] font-[Rajdhani]">

      {/* Eyebrow */}
      <div className="flex flex-col items-start pt-0 px-0 pb-7">
        <div className="rounded-[3px] bg-[rgba(255,168,0,0.07)] border-[rgba(255,168,0,0.2)] border-solid border-[1px] flex items-center py-[5px] px-3.5 gap-[5px]">
          <div className="h-1.5 w-1.5 relative shadow-[0px_0px_7px_#ffa800] rounded-[3px] bg-[#ffa800] opacity-[0.6]" />
          <b className="tracking-[2.42px] leading-[15.1px] uppercase">
            Saison 1 — Compétition Ouverte
          </b>
        </div>
      </div>

      {/* Title Section */}
      <section className="w-[733.5px] flex flex-col items-center pb-1.5">

        {/* Replace H1 with your SVG */}
        <div className="self-stretch flex flex-col items-center">
          <Image
            src="/assets/Sixsence.svg"
            alt="Six Sence Title"
            width={733}
            height={200}
            className="select-none"
            priority
          />
        </div>

        {/* Decorative line */}
        <div className="self-stretch flex flex-col items-center pt-2">
          <Image
            className="w-full h-3.5"
            loading="lazy"
            width={420}
            height={14}
            alt=""
            src="/assets/Iconligne.svg"
          />
        </div>
      </section>

{/* Tagline */}
<div className="flex flex-col items-center pt-4 pb-5">
  <Image
    src="/assets/tagline.svg"
    alt="Tagline"
    width={700}
    height={80}
    className="select-none"
  />
</div>

      {/* Description */}
      <div className="flex flex-col items-start pb-10 text-[14.1px] text-[rgba(175,175,200,0.6)] font-[Inter]">
        <div className="leading-[25.1px]">
          La plateforme de compétition nouvelle génération.
          <br />
          Matchmaking en temps réel, classement dynamique.
        </div>
      </div>

      {/* Buttons */}
      <div className="w-[501.5px] flex gap-4">

        {/* Yellow Button SVG */}
<button
  onClick={() => window.location.href = "/accueil"}
  className="cursor-pointer flex items-center justify-center"
>
  <Image
    src="/assets/buttonyellow.svg"
    alt="Jouez gratuitement"
    width={250}
    height={70}
    className="select-none"
  />
</button>

        {/* Blue Button SVG */}
<button
  onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
  className="cursor-pointer flex items-center justify-center"
>
  <Image
    src="/assets/buttonblue.svg"
    alt="Rejoindre Discord"
    width={250}
    height={70}
    className="select-none"
  />
</button>

      </div>

      {/* Scroll Indicator */}
      <div className="flex flex-col items-center pt-[52px]">
        <div className="flex flex-col items-center gap-1 opacity-[0.28]">
          <div className="w-px h-[30px] bg-gradient-to-b from-transparent to-white/60" />
          <Image
            className="w-2.5 h-1.5"
            loading="lazy"
            width={10}
            height={6}
            alt=""
            src="/assets/Iconfleche.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
