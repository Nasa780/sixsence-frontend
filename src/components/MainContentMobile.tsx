import Image from "next/image";

const MainContentMobile = () => {
  return (
    <div className="w-full px-4 py-10 flex flex-col items-center text-center">

      {/* Saison */}
      <div className="bg-[rgba(255,168,0,0.07)] border border-[rgba(255,168,0,0.2)] rounded px-3 py-1 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#ffa800] opacity-60 rounded shadow-[0_0_7px_#ffa800]" />
        <span className="uppercase text-[#ffa800] tracking-[2px] text-[12px]">
          Saison 1 — Compétition Ouverte
        </span>
      </div>

      {/* Logo Six Sence */}
      <Image
        src="/assets/Sixsence.svg"
        alt="Six Sence"
        width={360}
        height={120}
        className="mt-6 w-full max-w-[300px]"
      />

      {/* Ligne décorative */}
      <Image
        src="/assets/Iconligne.svg"
        alt=""
        width={300}
        height={14}
        className="mt-3 w-full max-w-[260px]"
      />

      {/* Tagline */}
      <Image
        src="/assets/tagline.svg"
        alt="Tagline"
        width={360}
        height={80}
        className="mt-6 w-full max-w-[300px]"
      />

      {/* Description */}
      <p className="mt-6 text-[15px] text-[rgba(175,175,200,0.7)] font-[Inter] leading-[22px]">
        La plateforme de compétition nouvelle génération.
        <br />
        Matchmaking en temps réel, classement dynamique.
      </p>

      {/* Bouton jaune */}
      <button
        onClick={() => window.location.href = "/accueil"}
        className="w-full flex justify-center mt-6"
      >
        <Image
          src="/assets/buttonyellow.svg"
          alt="Jouez gratuitement"
          width={360}
          height={70}
          className="w-full"
        />
      </button>

      {/* Bouton Discord */}
      <button
        onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
        className="w-full flex justify-center mt-4"
      >
        <Image
          src="/assets/buttonblue.svg"
          alt="Rejoindre Discord"
          width={360}
          height={70}
          className="w-full"
        />
      </button>

      {/* Scroll indicator */}
      <div className="mt-10 flex flex-col items-center opacity-30">
        <div className="w-px h-[30px] bg-gradient-to-b from-transparent to-white/60" />
        <Image
          src="/assets/Iconfleche.svg"
          alt=""
          width={10}
          height={6}
          className="mt-1"
        />
      </div>

    </div>
  );
};

export default MainContentMobile;
