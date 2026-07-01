import type { NextPage } from "next";
import Image from "next/image";

const Container: NextPage = () => {
  return (
    <div className="w-[236px] shadow-[0px_12px_48px_rgba(0,_0,_0,_0.55),_0px_1px_0px_rgba(255,_255,_255,_0.05)_inset] rounded-[5px] bg-[rgba(9,9,16,0.88)] border-[rgba(255,255,255,0.07)] border-solid border-[1px] box-border flex flex-col items-start pt-[17px] px-[15px] pb-[15px] relative isolate leading-[normal] tracking-[normal] z-[0]">

      {/* Barre jaune gauche */}    
<Image
  src="/assets/card-left-bar.svg"
  alt=""
  width={3}
  height={200}
  className="absolute top-[1px] left-[1px] z-[0] select-none"
/>

      {/* Bouton fermer */}
      <button className="cursor-pointer absolute top-[7px] right-[9.5px] py-0.5 px-1 bg-transparent">
        <b className="text-[12.8px] leading-[12.8px] font-[Cousine] text-[rgba(255,255,255,0.2)]">
          ✕
        </b>
      </button>

      {/* Icône + textes SVG */}
      <div className="self-stretch flex items-center py-0 pl-2 pr-0.5 gap-2.5 z-[2]">
        <Image
          width={34}
          height={34}
          alt="App Icon"
          src="/assets/app-icon.svg"
          className="rounded"
        />

        <div className="flex flex-col items-start">

          {/* SVG Application */}
          <Image
            src="/assets/application.svg"
            alt="Application"
            width={120}
            height={20}
            className="select-none"
          />

          {/* SVG Windows */}
          <Image
            src="/assets/windows.svg"
            alt="Windows"
            width={120}
            height={20}
            className="select-none opacity-40"
          />

        </div>
      </div>

      {/* Description */}
      <div className="self-stretch flex flex-col items-start pt-2.5 pb-0 pl-2 pr-0.5 text-[11.1px] text-[rgba(170,170,195,0.5)] font-[Inter]">
        <div className="leading-[18px]">
          Installez SixSence sur votre PC pour une expérience optimale.
        </div>
      </div>

      {/* Bouton Installer */}
      <button className="cursor-pointer absolute bottom-[18px] left-[calc(50%-102px)]">
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
