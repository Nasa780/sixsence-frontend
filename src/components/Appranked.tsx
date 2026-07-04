import type { NextPage } from "next";
import Image from "next/image";
import useUser from "../hooks/useUser";

const Appranked: NextPage = () => {
  const user = useUser();

  // Normalisation des données
  const avatar =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : "/assets/default-avatar.png";

  const username = user?.username || "Utilisateur";

  return (
    <div className="w-full relative bg-[rgba(8,12,20,0.92)] border-[rgba(26,107,220,0.18)] border-solid border-b-[1px] box-border flex flex-col items-start leading-[normal] tracking-[normal] text-left text-xl text-[#fff] font-[Rajdhani]">
      <div className="self-stretch flex flex-col items-center">
        <div className="w-[1200px] h-16 flex items-center justify-between py-0 px-6 box-border gap-5 max-w-[1200px] lg:gap-5 lg:max-w-full">

          {/* LOGO */}
          <div className="h-[30px] w-[121.8px] flex flex-col items-start relative isolate">
            <div className="w-full h-full absolute top-[0px] left-[-4px] flex flex-col items-start gap-px z-[0] shrink-0">
              <div className="flex flex-col items-start">
                <h3 className="m-0 tracking-[3.6px] leading-5 uppercase font-bold mq450:text-base mq450:leading-4">
                  SIXSENCE
                </h3>
              </div>
              <div className="flex flex-col items-start text-[9px] text-[#ffa040]">
                <div className="tracking-[1.98px] leading-[9px] uppercase font-medium whitespace-nowrap">
                  Competitive Platform
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex items-center gap-2 text-sm text-[#94a3b8] font-[Inter]">
            <div className="flex flex-col items-start py-1.5 pl-[15px] pr-3.5">
              <div className="tracking-[0.28px] leading-[21px] font-medium cursor-pointer"
                   onClick={() => window.location.href = "/accueil"}>
                Accueil
              </div>
            </div>

            <div className="border-[#1a6bdc] border-solid border-b-[2px] flex flex-col items-start py-1.5 px-4 text-[#1a6bdc]">
              <div className="tracking-[0.28px] leading-[21px] font-medium">
                Ranked
              </div>
            </div>

            <div className="flex flex-col items-start py-1.5 px-4">
              <div className="tracking-[0.28px] leading-[21px] font-medium cursor-pointer"
                   onClick={() => window.location.href = "/profil"}>
                Profil
              </div>
            </div>
          </div>

          {/* SI CONNECTÉ → AVATAR + PSEUDO */}
          {user ? (
            <div className="flex items-center gap-3 bg-[#1a1b22] px-3 py-2 rounded-md border border-[#333]">
              <img
                src={avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />

              <div className="text-sm font-semibold text-white">
                {username}
              </div>
            </div>
          ) : (
            /* SINON → BOUTON DISCORD */
            <button
              onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
              className="cursor-pointer py-2 px-[18px] bg-[#5865f2] flex items-center gap-[7px] hover:bg-[#7080ff]"
            >
              <Image
                className="h-4 w-4"
                width={16}
                height={16}
                alt=""
                src="/assets/Icondiscord2.svg"
              />
              <div className="text-sm tracking-[0.28px] leading-[21px] font-semibold font-[Inter] text-[#fff]">
                Discord
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default Appranked;
