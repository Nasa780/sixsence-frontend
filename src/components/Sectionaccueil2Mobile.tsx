import type { NextPage } from "next";
import Image from "next/image";

const Sectionaccueil2Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center py-14 px-4 bg-[#0c0c0c] border-y border-[rgba(232,160,32,0.07)]">

      {/* TITRE SECTION */}
      <div className="flex flex-col items-center pb-8">

        {/* Ligne + texte */}
        <div className="flex items-center gap-3 pb-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[rgba(232,160,32,0.5)]" />
          <div className="tracking-[3px] leading-[14px] uppercase text-[#e8a020] font-['JetBrains_Mono']">
            Plateforme Live
          </div>
          <div className="h-px w-12 bg-gradient-to-r from-[rgba(232,160,32,0.5)] to-transparent" />
        </div>

        {/* Titre principal */}
<h3
  className="text-xl tracking-[2px] leading-7 uppercase font-black font-[Barlow]
             text-transparent !bg-clip-text
             [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]
             [-webkit-background-clip:text]
             [-webkit-text-fill-color:transparent]"
>
          Statistiques du site
        </h3>
      </div>

      {/* BLOCS STATISTIQUES */}
      <div className="w-full max-w-[360px] flex flex-col gap-6 text-center text-[#6b6860] font-[Barlow]">

        {/* BLOC 1 */}
        <div className="w-full bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-center py-6 px-4">
          <div className="w-10 h-10 bg-[rgba(232,160,32,0.07)] flex items-center justify-center rounded-md mb-3">
            <Image src="/assets/Iconjoueur.svg" alt="" width={18} height={18} />
          </div>
<h1
  className="text-2xl font-black text-transparent !bg-clip-text
             [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]
             [-webkit-background-clip:text]
             [-webkit-text-fill-color:transparent]"
>
            12,847
          </h1>
          <div className="pt-2 text-xs tracking-[2px] uppercase font-['JetBrains_Mono'] text-[#e8a020]">
            Joueurs actifs
          </div>
        </div>

        {/* BLOC 2 */}
        <div className="w-full bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-center py-6 px-4">
          <div className="w-10 h-10 bg-[rgba(232,160,32,0.07)] flex items-center justify-center rounded-md mb-3">
            <Image src="/assets/Iconmatch.svg" alt="" width={18} height={18} />
          </div>
<h2
  className="text-2xl font-black text-transparent !bg-clip-text
             [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]
             [-webkit-background-clip:text]
             [-webkit-text-fill-color:transparent]"
>
            384,920
          </h2>
          <div className="pt-2 text-xs tracking-[2px] uppercase font-['JetBrains_Mono'] text-[#e8a020]">
            Matchs joués
          </div>
        </div>

        {/* BLOC 3 */}
        <div className="w-full bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-center py-6 px-4">
          <div className="w-10 h-10 bg-[rgba(232,160,32,0.07)] flex items-center justify-center rounded-md mb-3">
            <Image src="/assets/Iconvictoire.svg" alt="" width={18} height={18} />
          </div>
<h2
  className="text-2xl font-black text-transparent !bg-clip-text
             [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]
             [-webkit-background-clip:text]
             [-webkit-text-fill-color:transparent]"
>
            201,506
          </h2>
          <div className="pt-2 text-xs tracking-[2px] uppercase font-['JetBrains_Mono'] text-[#e8a020]">
            Victoires
          </div>
        </div>

        {/* BLOC 4 */}
        <div className="w-full bg-gradient-to-br from-[#111110] to-[#0e0d0b] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-center py-6 px-4">
          <div className="w-10 h-10 bg-[rgba(232,160,32,0.07)] flex items-center justify-center rounded-md mb-3">
            <Image src="/assets/Iconmmr.svg" alt="" width={18} height={18} />
          </div>
<h2
  className="text-2xl font-black text-transparent !bg-clip-text
             [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]
             [-webkit-background-clip:text]
             [-webkit-text-fill-color:transparent]"
>
            1,342
          </h2>
          <div className="pt-2 text-xs tracking-[2px] uppercase font-['JetBrains_Mono'] text-[#e8a020]">
            MMR moyen
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sectionaccueil2Mobile;
