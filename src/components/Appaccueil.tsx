import Image from "next/image";
import type { FC } from "react";

type App2Props = {
  className?: string;
};

const Appaccueil: FC<App2Props> = ({ className = "" }) => {
  return (
<div
  className={`max-w-full flex flex-col items-center pt-0 px-6 pb-20 box-border leading-[normal] tracking-[normal] text-left text-sm text-[#f0ede8] font-[Barlow] ${className}`}
>
      <div className="w-[1024px] flex items-start pt-0 px-0 pb-0 box-border gap-[15.6px] max-w-[1024px] mq450:max-w-full">
        <div className="[background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] flex flex-col items-start py-7 pl-7 pr-5">
          <div className="flex flex-col items-start pt-0 px-0 pb-5">
            <button className="cursor-pointer border-[rgba(232,160,32,0.22)] border-solid border-[1px] p-0 bg-[rgba(232,160,32,0.08)] w-11 h-11 box-border flex items-center justify-center">
              <Image
                className="h-5 w-full relative"
                loading="lazy"
                width={20}
                height={20}
                alt=""
                src="/assets/Iconleaderboard.svg"
              />
            </button>
          </div>
          <div className="flex flex-col items-start pt-0 px-0 pb-2">
            <b className="relative tracking-[2.52px] leading-5 uppercase">
              Leaderboard
            </b>
          </div>
          <div className="w-[273px] relative leading-[22.8px] font-[Inter] text-[#6b6860] inline-block">
            Suivez votre classement en temps réel et comparez vos performances
            avec les meilleurs joueurs de la plateforme.
          </div>
        </div>

        <div className="[background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] flex flex-col items-start py-7 pl-7 pr-5">
          <div className="flex flex-col items-start pt-0 px-0 pb-5">
            <button className="cursor-pointer border-[rgba(232,160,32,0.22)] border-solid border-[1px] p-0 bg-[rgba(232,160,32,0.08)] w-11 h-11 box-border flex items-center justify-center">
              <Image
                className="h-5 w-full relative"
                loading="lazy"
                width={20}
                height={20}
                alt=""
                src="/assets/Iconranked.svg"
              />
            </button>
          </div>
          <div className="flex flex-col items-start pt-0 px-0 pb-2">
            <b className="relative tracking-[2.52px] leading-5 uppercase">
              Ranked
            </b>
          </div>
          <div className="w-[273px] relative leading-[22.8px] font-[Inter] text-[#6b6860] inline-block">
            Participez aux parties classées et grimpez les échelons pour
            atteindre le rang le plus élevé de la saison.
          </div>
        </div>

        <div className="[background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] flex flex-col items-start py-7 pl-7 pr-5">
          <div className="flex flex-col items-start pt-0 px-0 pb-5">
            <button className="cursor-pointer border-[rgba(232,160,32,0.22)] border-solid border-[1px] p-0 bg-[rgba(232,160,32,0.08)] w-11 h-11 box-border flex items-center justify-center">
              <Image
                className="h-5 w-full relative"
                loading="lazy"
                width={20}
                height={20}
                alt=""
                src="/assets/Iconprofil.svg"
              />
            </button>
          </div>
          <div className="flex flex-col items-start pt-0 px-0 pb-2">
            <b className="relative tracking-[2.52px] leading-5 uppercase">
              Profile
            </b>
          </div>
          <div className="w-[273px] relative leading-[22.8px] font-[Inter] text-[#6b6860] inline-block">
            Personnalisez votre profil, affichez vos statistiques et consultez
            l'historique complet de vos matchs.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appaccueil;
