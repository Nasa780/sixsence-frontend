import Image from "next/image";
import type { FC } from "react";

const AppaccueilMobile: FC = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-sm text-[#f0ede8] font-[Barlow]">

      {/* WRAPPER GLOBAL */}
      <div className="w-full max-w-[360px] flex flex-col gap-6">

        {/* CLIENT DESKTOP */}
        <div className="bg-gradient-to-br from-[#111110] to-[#0e0d0b] 
                        border border-[rgba(232,160,32,0.18)] 
                        rounded-lg flex flex-col items-start py-6 px-4">

          {/* ICON */}
          <div className="border border-[rgba(232,160,32,0.22)] 
                          bg-[rgba(232,160,32,0.08)] 
                          w-10 h-10 flex items-center justify-center 
                          rounded-md mb-4">
            <Image src="/assets/Iconapp2.svg" alt="icon" width={20} height={20} />
          </div>

          {/* TITLE */}
          <div className="text-[10px] tracking-[3px] uppercase text-[#e8a020] font-['JetBrains_Mono']">
            Client Desktop
          </div>

          {/* MAIN TITLE */}
          <h3 className="text-xl tracking-[2px] leading-7 uppercase font-black 
                         text-transparent bg-clip-text 
                         [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]">
            Application Windows
          </h3>

          {/* TEXT */}
          <p className="mt-2 text-[#6b6860] text-sm leading-[20px] font-[Inter]">
            Téléchargez le client pour jouer
          </p>

          {/* BUTTON */}
          <button className="mt-4 py-3 px-5 bg-[transparent] 
                             [background:linear-gradient(135deg,#f5b332,#e8a020)] 
                             flex items-center gap-2 rounded-md">
            <Image src="/Icon.svg" alt="download" width={14} height={14} />
            <b className="text-sm tracking-[1.5px] leading-5 uppercase font-[Barlow] text-[#09090b]">
              Télécharger
            </b>
          </button>

          {/* FOOTER */}
          <div className="mt-3 text-[10px] tracking-[2px] uppercase text-[rgba(107,104,96,0.5)] font-['JetBrains_Mono']">
            Windows · Gratuit · Version 1.0.0
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="bg-gradient-to-br from-[#111110] to-[#0e0d0b] 
                        border border-[rgba(232,160,32,0.18)] 
                        rounded-lg flex flex-col items-start py-6 px-4">

          {/* ICON */}
          <div className="border border-[rgba(232,160,32,0.22)] 
                          bg-[rgba(232,160,32,0.08)] 
                          w-10 h-10 flex items-center justify-center 
                          rounded-md mb-4">
            <Image src="/assets/Iconleaderboard.svg" alt="leaderboard" width={20} height={20} />
          </div>

          {/* TITLE */}
          <b className="tracking-[2px] leading-5 uppercase pb-2">
            Leaderboard
          </b>

          {/* TEXT */}
          <p className="text-[#6b6860] text-sm leading-[20px] font-[Inter]">
            Suivez votre classement en temps réel et comparez vos performances
            avec les meilleurs joueurs de la plateforme.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AppaccueilMobile;
