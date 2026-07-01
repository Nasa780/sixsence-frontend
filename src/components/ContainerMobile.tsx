import Image from "next/image";

const ContainerMobile = () => {
  return (
    <div className="w-full max-w-[360px] mx-auto bg-[rgba(9,9,16,0.88)] border border-[rgba(255,255,255,0.07)] rounded-[5px] px-4 py-5 relative">

      {/* Barre jaune */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#ffa800] to-[rgba(255,168,0,0.15)] rounded-l-[5px]" />

      {/* Titre */}
      <div className="flex items-center gap-3">
        <Image
          src="/assets/app-icon.svg"
          alt="App Icon"
          width={34}
          height={34}
        />
        <div>
          <p className="uppercase tracking-[2px] text-white text-[14px]">Application</p>
          <p className="uppercase tracking-[2px] text-white/40 text-[12px]">Windows</p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-[13px] text-[rgba(170,170,195,0.7)] font-[Inter] leading-[20px]">
        Installez SixSence sur votre PC pour une expérience optimale.
      </p>

      {/* Bouton */}
      <button className="mt-5 w-full flex justify-center">
        <Image
          src="/assets/Buttonapp.svg"
          alt="Installer l'application"
          width={260}
          height={48}
        />
      </button>
    </div>
  );
};

export default ContainerMobile;
