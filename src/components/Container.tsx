import type { NextPage } from "next";
import Image from "next/image";

const Container: NextPage = () => {
  return (
    <div className="w-[236px] shadow-[0px_12px_48px_rgba(0,_0,_0,_0.55),_0px_1px_0px_rgba(255,_255,_255,_0.05)_inset] rounded-[5px] bg-[rgba(9,9,16,0.88)] border-[rgba(255,255,255,0.07)] border-solid border-[1px] box-border flex flex-col items-start pt-[17px] px-[15px] pb-[15px] relative isolate leading-[normal] tracking-[normal] z-[0] text-left text-[11.2px] text-[#fff] font-[Rajdhani]">

      {/* Barre jaune gauche (version Figma) */}
      <div className="w-[3px] h-[calc(100%_-_3px)] absolute top-[1px] bottom-[2px] left-[1px] rounded-tl-[5px] rounded-bl-[5px] [background:linear-gradient(180deg,_#ffa800,_rgba(255,_168,_0,_0.15))] z-[0]" />

      {/* Bouton fermer */}
      <button className="cursor-pointer py-0.5 px-1 bg-transparent absolute top-[7px] right-[9.5px] z-[3]">
        <b className="text-[12.8px] leading-[12.8px] font-[Cousine] text-[rgba(255,255,255,0.2)]">
          ✕
        </b>
      </button>

      {/* Icône + textes */}
      <div className="self-stretch flex items-center py-0 pl-2 pr-0.5 gap-2.5 z-[2]">
        <Image
          width={34}
          height={34}
          alt="App Icon"
          src="/assets/app-icon.svg"
          className="rounded"
        />

        <div className="flex flex-col items-start">
          <b className="tracking-[2.46px] leading-[14px] uppercase">
            Application
          </b>
          <div className="self-stretch flex flex-col items-start text-[rgba(255,255,255,0.4)]">
            <div className="tracking-[2.46px] leading-[14px] uppercase font-semibold">
              Windows
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="self-stretch flex flex-col items-start pt-2.5 pb-0 pl-2 pr-0.5 z-[3] text-[11.1px] text-[rgba(170,170,195,0.5)] font-[Inter]">
        <div className="leading-[18px]">
          Installez SixSence sur votre PC pour une expérience optimale.
        </div>
      </div>

      {/* Réserve d’espace pour le bouton (comme Figma) */}
      <div className="self-stretch h-[47.8px] relative z-[4]" />

      {/* Bouton Installer (absolute, Figma style) */}
      <button className="cursor-pointer absolute bottom-[18px] left-[calc(50%-102px)] z-[5]">
        <Image
          src="/assets/Buttonapp.svg"
          alt="Installer l'application"
          width={202}
          height={48}
          className="select-none"
        />
      </button>
    </div>
  );
};

export default Container;
