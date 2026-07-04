import Image from "next/image";
import useUser from "../hooks/useUser";

const ApprankedMobile = () => {
  const user = useUser();

  // Normalisation des données
  const avatar =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : "/assets/default-avatar.png";

  const username = user?.username || "Utilisateur";

  return (
    <div className="w-full bg-[rgba(8,12,20,0.92)] border-b border-[rgba(26,107,220,0.18)] px-4 py-4 flex items-center justify-between text-white font-[Rajdhani]">

      {/* LOGO */}
      <div className="flex flex-col">
        <h3 className="tracking-[3px] uppercase font-bold text-base">
          SIXSENCE
        </h3>
        <span className="text-[9px] text-[#ffa040] tracking-[2px] uppercase">
          Competitive Platform
        </span>
      </div>

      {/* NAVIGATION */}
      <div className="flex items-center gap-4 text-sm font-[Inter]">
        <span
          className="text-[#94a3b8] cursor-pointer"
          onClick={() => window.location.href = "/accueil"}
        >
          Accueil
        </span>

        <span className="text-[#1a6bdc] border-b-2 border-[#1a6bdc] pb-0.5">
          Ranked
        </span>

        <span
          className="text-[#94a3b8] cursor-pointer"
          onClick={() => window.location.href = "/profil"}
        >
          Profil
        </span>
      </div>

      {/* SI CONNECTÉ → AVATAR + PSEUDO */}
      {user ? (
        <div className="flex items-center gap-2 bg-[#1a1b22] px-3 py-2 rounded-md border border-[#333]">
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white text-sm font-semibold">
            {username}
          </span>
        </div>
      ) : (
        /* SINON → BOUTON DISCORD */
        <button
          onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
          className="flex items-center gap-2 bg-[#5865f2] px-3 py-2 rounded hover:bg-[#7080ff]"
        >
          <Image
            src="/assets/Icondiscord2.svg"
            alt="Discord"
            width={16}
            height={16}
          />
          <span className="text-white text-sm font-semibold font-[Inter]">
            Discord
          </span>
        </button>
      )}

    </div>
  );
};

export default ApprankedMobile;
