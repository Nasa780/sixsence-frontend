import type { NextPage } from "next";
import Image from "next/image";

const MainContent: NextPage = () => {
  return (
    <div className="w-full h-[1259.3px] relative flex flex-col items-center justify-center pt-0 px-6 pb-20 box-border leading-[normal] tracking-[normal] text-center text-[10.1px] text-[#ffa800] font-[Rajdhani]">
      <div className="flex flex-col items-start pt-0 px-0 pb-7">
        <div className="rounded-[3px] bg-[rgba(255,168,0,0.07)] border-[rgba(255,168,0,0.2)] border-solid border-[1px] flex items-center py-[5px] px-3.5 gap-[5px]">
          <div className="h-1.5 w-1.5 relative shadow-[0px_0px_7px_#ffa800] rounded-[3px] bg-[#ffa800] opacity-[0.6]" />
          <div className="flex flex-col items-center">
            <b className="relative tracking-[2.42px] leading-[15.1px] uppercase">
              Saison 1 — Compétition Ouverte
            </b>
          </div>
        </div>
      </div>
      <section className="w-[733.5px] flex flex-col items-start pt-0 px-0 pb-1.5 box-border text-center text-[168px] font-[Rajdhani]">
        <div className="self-stretch shadow-[0px_0px_110px_rgba(255,_168,_0,_0.28),_0px_2px_0px_rgba(0,_0,_0,_0.9)] flex flex-col items-center">
          <h1 className="m-0 relative text-[length:inherit] tracking-[3.36px] leading-[147.8px] uppercase font-bold font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(170deg,_#fff,_#fff_40%,_#ffa800_75%,_#cc8600)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-[42px] mq450:leading-[59px] mq750:text-[67px] mq750:leading-[89px]">
            SIX SENCE
          </h1>
        </div>
        <div className="self-stretch flex flex-col items-center pt-2 px-0 pb-0">
          <Image
            className="w-full h-3.5 relative"
            loading="lazy"
            width={420}
            height={14}
            sizes="100vw"
            alt=""
            src="/assets/Iconligne.svg"
          />
        </div>
      </section>
      <div className="flex flex-col items-start pt-4 px-0 pb-5 text-[15.7px] text-[rgba(255,255,255,0.45)]">
        <div className="relative tracking-[8.15px] leading-[23.5px] uppercase font-semibold">
          Matchmaking structuré, mode Ranked, progression réelle.
        </div>
      </div>
      <div className="flex flex-col items-start pt-0 px-0 pb-10 text-[14.1px] text-[rgba(175,175,200,0.6)] font-[Inter]">
        <div className="relative leading-[25.1px]">
          La plateforme de compétition nouvelle génération.
          <br />
          Matchmaking en temps réel, classement dynamique.
        </div>
      </div>
      <div className="w-[501.5px] flex items-start pt-0 px-0 pb-0 box-border gap-4">
        <button className="cursor-pointer [border:none] py-3.5 px-[34px] bg-[#ffa800] shadow-[0px_0px_28px_rgba(255,_168,_0,_0.42),_0px_4px_14px_rgba(0,_0,_0,_0.5)] rounded-sm overflow-hidden flex items-center gap-2 hover:bg-[#cc7500]">
          <Image
            className="h-3.5 w-3.5 relative"
            width={14}
            height={14}
            sizes="100vw"
            alt=""
            src="/assets/Buttonplay.svg"
          />
          <b className="relative text-[13.3px] tracking-[1.99px] leading-[19.9px] uppercase font-[Rajdhani] text-[#fff] text-center">
            Jouez gratuitement
          </b>
        </button>
        <button className="cursor-pointer border-[rgba(0,210,232,0.38)] border-solid border-[1px] py-[13px] px-[34px] bg-[rgba(255,255,255,0)] shadow-[0px_0px_14px_rgba(0,_210,_232,_0.08),_0px_0px_12px_rgba(0,_210,_232,_0.04)_inset] rounded-sm flex items-center gap-2 hover:bg-[rgba(230,230,230,0)] hover:border-[rgba(0,184,207,0.38)] hover:border-solid hover:hover:border-[1px] hover:box-border">
          <Image
            className="h-[15px] w-[15px] relative"
            width={15}
            height={15}
            sizes="100vw"
            alt=""
            src="/assets/Buttondiscord.svg"
          />
          <b className="relative text-[13.3px] tracking-[1.99px] leading-[19.9px] uppercase font-[Rajdhani] text-[#00d2e8] text-center">
            Rejoindre Discord
          </b>
        </button>
      </div>
      <div className="flex flex-col items-start pt-[52px] px-0 pb-0">
        <div className="flex flex-col items-center gap-1 opacity-[0.28]">
          <div className="w-px h-[30px] relative [background:linear-gradient(180deg,_rgba(0,_0,_0,_0),_rgba(255,_255,_255,_0.6))]" />
          <Image
            className="w-2.5 h-1.5 relative"
            loading="lazy"
            width={10}
            height={6}
            sizes="100vw"
            alt=""
            src="/assets/Iconfleche.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
