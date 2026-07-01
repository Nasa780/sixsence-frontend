import type { NextPage } from "next";
import Image from "next/image";

const Container: NextPage = () => {
  return (
    <div className="w-[220px] rounded-[5px] bg-[rgba(9,9,16,0.88)] border border-[rgba(255,255,255,0.07)] shadow-[0px_12px_48px_rgba(0,0,0,0.55)] relative px-[12px] pt-[10px] pb-[10px]">

      {/* Barre jaune */}
      <Image
        src="/assets/card-left-bar.svg"
        alt=""
        width={3}
        height={180}
        className="absolute top-[1px] left-[1px] select-none"
      />

      {/* Bouton fermer */}
      <button className="absolute top-[6px] right-[8px] bg-transparent px-1 py-0.5">
        <b className="text-[12px] text-[rgba(255,255,255,0.2)] font-[Cousine]">✕</b>
      </button>

      {/* Icône + textes */}
      <div className="flex items-center gap-2 pl-1 pr-0 pt-1">
        <Image
          src="/assets/app-icon.svg"
          alt="App Icon"
          width={32}
          height={32}
          className="rounded"
        />

        <div className="flex flex-col leading-none">
          <b className="uppercase tracking-[2.4px] text-[13px]">Application</b>
          <span className="uppercase tracking-[2.4px] text-[rgba(255,255,255,0.4)] text-[13px] font-semibold">
            Windows
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-[11px] text-[rgba(170,170,195,0.5)] font-[Inter] pl-1 pt-2 leading-[16px]">
        Installez SixSence sur votre PC pour une expérience optimale.
      </div>

      {/* Bouton Installer */}
      <button className="absolute bottom-[12px] left-1/2 -translate-x-1/2">
        <Image
          src="/assets/Buttonapp.svg"
          alt="Installer l'application"
          width={180}
          height={40}
          className="select-none"
        />
      </button>

    </div>
  );
};

export default Container;
