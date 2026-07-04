import Image from "next/image";
import useUser from "../hooks/useUser";

const Navigationaccueil = ({ className = "" }) => {
  const user = useUser();

  const avatar =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : "/assets/default-avatar.png";

  const username = user?.username || "Utilisateur";

  return (
    <div className={`w-[2174px] max-w-full flex items-center justify-between pt-5 px-8 pb-4 ${className}`}>

      {/* LOGO */}
      <div className="flex flex-col items-start">
        <h3 className="m-0 tracking-[4.5px] leading-7 uppercase font-black">
          SIXSENCE
        </h3>
        <div className="text-[9px] text-[#ffb347] font-['JetBrains_Mono'] tracking-[3.15px] uppercase">
          Competitive Platform
        </div>
      </div>

      {/* SI CONNECTÉ */}
      {user ? (
        <div className="flex items-center gap-3 bg-[#1a1b22] px-3 py-2 rounded-md border border-[#333]">
          <img
            src={avatar}
            className="w-8 h-8 rounded-full"
            alt="avatar"
          />
          <div className="text-sm font-semibold text-white">
            {username}
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            window.location.href = "https://sixsence-backend.onrender.com/auth/discord";
          }}
          className="cursor-pointer border-[rgba(88,101,242,0.33)] border-solid border-[1px] py-2 px-4 bg-[rgba(88,101,242,0.15)] rounded-md flex items-center gap-[7px]"
        >
          <Image
            className="h-3 w-3"
            width={12}
            height={12}
            alt=""
            src="/assets/Icondiscord2.svg"
          />
          <div className="text-xs tracking-[0.96px] leading-4 uppercase font-semibold text-[#8b9cf4] text-center">
            Discord
          </div>
        </button>
      )}
    </div>
  );
};

export default Navigationaccueil;
