import Image from "next/image";
import useUser from "../hooks/useUser";

const HeaderMobile = () => {
  const user = useUser();

  // Normalisation des données
  const avatar =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : "/assets/default-avatar.png";

  const username = user?.username || "Utilisateur";

  return (
    <div className="w-full flex items-center justify-between px-4 py-4">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/assets/logosix.svg"
          alt="Six Sence Logo"
          width={32}
          height={32}
        />
        <span className="text-white uppercase tracking-[3px] text-[12px] font-[Rajdhani]">
          Six Sence
        </span>
      </div>

      {/* SI CONNECTÉ → AVATAR + PSEUDO */}
      {user ? (
        <div className="flex items-center gap-3 bg-[#1a1b22] px-3 py-2 rounded-md border border-[#333]">
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />

          <span className="text-white text-[12px] font-[Inter] font-semibold">
            {username}
          </span>
        </div>
      ) : (
        /* SINON → BOUTON DISCORD */
        <button
          onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
          className="flex items-center gap-2 bg-[#5865f2] px-3 py-2 rounded"
        >
          <Image
            src="/assets/Icondiscord.svg"
            alt="Discord"
            width={16}
            height={16}
          />
          <span className="text-white text-[12px] font-[Inter]">Discord</span>
        </button>
      )}

    </div>
  );
};

export default HeaderMobile;
