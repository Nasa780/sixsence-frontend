import type { NextPage } from "next";
import Image from "next/image";
import useUser from "../hooks/useUser";

const Profile1: NextPage = () => {
  const user = useUser();

  // Avatar Discord réel
  const avatar = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : "/assets/default-avatar.png";

  // Pseudo Discord réel
  const username = user?.username || "Utilisateur";

  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xs text-[#fff] font-[Inter]">
      <div className="h-[52px] flex items-center flex-wrap content-center py-0 px-6 box-border gap-8 max-w-[1200px] lg:max-w-full mq750:gap-4 mq1050:h-auto">

        {/* LOGO SIXSENCE */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg [background:linear-gradient(135deg,_#ff4500,_#ff6b35)] flex items-center justify-center">
            <Image
              className="h-6 w-full relative"
              width={22}
              height={24}
              sizes="100vw"
              alt=""
              src="/assets/IconS.svg"
            />
          </div>
          <div className="w-[68.1px] flex flex-col items-start">
            <b className="tracking-[0.96px] leading-3">SIXSENCE</b>
            <div className="text-[8px] text-[#6b7280] tracking-[1.2px] leading-[8px] font-medium">
              HARDCORE
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 flex items-center gap-1 min-w-[335px] text-center text-[13px] text-[#94a3b8] mq450:flex-wrap">
          <div className="rounded-md flex items-center py-1.5 px-3 gap-1">
            <Image className="h-3.5 w-3.5" width={14} height={14} alt="" src="/assets/Iconhome.svg" />
            <div className="leading-[19.5px] font-medium">Accueil</div>
          </div>

          <div className="rounded-md flex items-center py-1.5 px-3 gap-[5px]">
            <Image className="h-3.5 w-3.5" width={14} height={14} alt="" src="/assets/Iconstats.svg" />
            <div className="leading-[19.5px] font-medium">Classements</div>
          </div>

          <div className="rounded-md flex items-center py-1.5 px-3 gap-[5px]">
            <Image className="h-3.5 w-3.5" width={14} height={14} alt="" src="/assets/Icontrophy.svg" />
            <div className="leading-[19.5px] font-medium">Mode classé</div>
          </div>
        </div>

        {/* AVATAR + PSEUDO DISCORD */}
        <div className="flex items-center gap-2 text-[11px]">

          {/* Bouton roue */}
          <button className="cursor-pointer py-1.5 px-3.5 bg-[transparent] rounded-md [background:linear-gradient(135deg,_#8b5cf6,_#7c3aed)] flex items-center justify-center">
            <div className="text-xs leading-[18px] font-semibold text-[#fff] text-center">
              Roue
            </div>
          </button>

          {/* Icônes */}
          <div className="rounded flex items-center p-1">
            <Image className="h-4 w-4" width={16} height={16} alt="" src="/assets/Iconmessage.svg" />
          </div>

          <div className="rounded flex items-center p-1">
            <Image className="h-4 w-4" width={16} height={16} alt="" src="/assets/Iconflechebas.svg" />
          </div>

          {/* AVATAR + PSEUDO RÉEL */}
          <div className="flex items-center gap-1.5">
            <img
              src={avatar}
              alt="avatar discord"
              className="h-7 w-7 rounded-[14px] object-cover"
            />

            <div className="flex flex-col items-start text-xs text-[#e2e8f0]">
              <div className="leading-[18px] font-medium">{username}</div>
            </div>

            <Image className="h-3 w-3" width={12} height={12} alt="" src="/assets/Iconloupe.svg" />
          </div>

          {/* Drapeau */}
          <div className="h-3.5 w-5 rounded-sm [background:linear-gradient(180deg,_#003189_33%,_#fff_33%,_#fff_66%,_#ed2939_66%)]" />
        </div>
      </div>
    </div>
  );
};

export default Profile1;
