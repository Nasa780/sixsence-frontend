import Image from "next/image";
import type { FC } from "react";

const AppaccueilMobile: FC = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-14 text-left text-sm text-[#f0ede8] font-[Barlow]">

      {/* WRAPPER DES CARTES */}
      <div className="w-full max-w-[360px] flex flex-col gap-6">

        {/* CARD 1 — LEADERBOARD */}
        <div className="bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-start py-6 px-5">
          
          {/* ICON */}
          <button className="border border-[rgba(232,160,32,0.22)] bg-[rgba(232,160,32,0.08)] w-10 h-10 flex items-center justify-center rounded-md mb-4">
            <Image
              src="/assets/Iconleaderboard.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </button>

          {/* TITLE */}
          <b className="tracking-[2px] leading-5 uppercase pb-2">
            Leaderboard
          </b>

          {/* TEXT */}
          <p className="text-[#6b6860] text-sm leading-[22px] font-[Inter]">
            Suivez votre classement en temps réel et comparez vos performances
            avec les meilleurs joueurs de la plateforme.
          </p>
        </div>

        {/* CARD 2 — RANKED */}
        <div className="bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-start py-6 px-5">
          
          {/* ICON */}
          <button className="border border-[rgba(232,160,32,0.22)] bg-[rgba(232,160,32,0.08)] w-10 h-10 flex items-center justify-center rounded-md mb-4">
            <Image
              src="/assets/Iconranked.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </button>

          {/* TITLE */}
          <b className="tracking-[2px] leading-5 uppercase pb-2">
            Ranked
          </b>

          {/* TEXT */}
          <p className="text-[#6b6860] text-sm leading-[22px] font-[Inter]">
            Participez aux parties classées et grimpez les échelons pour
            atteindre le rang le plus élevé de la saison.
          </p>
        </div>

        {/* CARD 3 — PROFILE */}
        <div className="bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-start py-6 px-5">
          
          {/* ICON */}
          <button className="border border-[rgba(232,160,32,0.22)] bg-[rgba(232,160,32,0.08)] w-10 h-10 flex items-center justify-center rounded-md mb-4">
            <Image
              src="/assets/Iconprofil.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </button>

          {/* TITLE */}
          <b className="tracking-[2px] leading-5 uppercase pb-2">
            Profile
          </b>

          {/* TEXT */}
          <p className="text-[#6b6860] text-sm leading-[22px] font-[Inter]">
            Personnalisez votre profil, affichez vos statistiques et consultez
            l'historique complet de vos matchs.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AppaccueilMobile;
