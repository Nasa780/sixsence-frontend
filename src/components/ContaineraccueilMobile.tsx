import Link from "next/link";
import Image from "next/image";

const ContaineraccueilMobile = () => {
  return (
    <div className="w-full flex flex-col items-center pt-12 px-4 pb-16 text-center text-[10px] text-[#e8a020] font-['JetBrains_Mono']">

      {/* SAISON */}
      <div className="w-full flex items-center justify-center gap-2 pb-6">
        <div className="h-1.5 w-1.5 bg-[#e8a020]" />
        <div className="tracking-[3px] leading-[14px] uppercase">
          Saison 1 · Compétition Ranked
        </div>
        <div className="h-1.5 w-1.5 bg-[#e8a020]" />
      </div>

      {/* LOGO SIXSENCE */}
      <div className="w-full flex items-center justify-center pb-8">
        <Image
          src="/assets/LogoSixsence.svg"
          alt="Logo Six Sence"
          width={300}
          height={80}
          className="drop-shadow-[0_0_6px_rgba(255,200,100,0.18)] drop-shadow-[0_0_12px_rgba(255,200,100,0.12)]"
          priority
        />
      </div>

      {/* SÉPARATEUR */}
      <div className="w-full max-w-[300px] flex items-center justify-center gap-3 pb-10">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(232,160,32,0.55)]" />
        <div className="h-[5px] w-[5px] bg-[#e8a020] shadow-[0_0_8px_#e8a020,0_0_16px_rgba(232,160,32,0.4)]" />
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(232,160,32,0.55)] to-transparent" />
      </div>

      {/* MODE CLASSÉ */}
      <section className="w-full max-w-[360px] text-left text-sm text-[#8a8780] font-[Barlow]">

        <div className="shadow-[0_0_30px_rgba(0,0,0,0.7)] bg-gradient-to-br from-[#0e0f14] to-[#0b0c11] border border-[rgba(58,140,255,0.22)] rounded-lg flex flex-col">

          {/* HEADER */}
          <div className="flex items-start pt-4 px-4 pb-3 gap-3">
            <button className="h-10 w-10 bg-gradient-to-br from-[#1a6fe0] to-[#3a8cff] shadow-[0_0_12px_rgba(58,140,255,0.45)] flex items-center justify-center rounded-md">
              <Image src="/assets/Icontrophee.svg" alt="" width={20} height={20} />
            </button>

            <div className="flex flex-col">
              <div className="tracking-[2.5px] leading-5 uppercase font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f5e8a0] to-[#e8a020]">
                MODE CLASSÉ
              </div>
              <div className="text-xs font-[Inter] leading-4">
                Solo 4v4 & 5v5 – Affronte les meilleurs joueurs !
              </div>
            </div>
          </div>

          {/* LIGNE */}
          <div className="h-px bg-[rgba(58,140,255,0.1)] mx-4" />

          {/* AUCUN MATCH */}
          <div className="py-2 px-4 text-xs text-[#4a4845] font-[Inter]">
            Aucun match en cours actuellement
          </div>

          {/* LIGNE */}
          <div className="h-px bg-[rgba(58,140,255,0.1)] mx-4" />

          {/* BOUTON JOUER */}
          <div className="p-4">
<Link href="/ranked">
  <button className="w-full h-11 bg-gradient-to-br from-[#3a8cff] to-[#1a6fe0] flex items-center justify-center gap-2 rounded-md cursor-pointer">
    <b className="text-sm tracking-[2px] leading-5 uppercase text-white">
      Jouer
    </b>
    <Image src="/assets/Iconjouer.svg" alt="" width={12} height={12} />
  </button>
</Link>
          </div>
        </div>

        {/* CLASSEMENTS */}
        <div className="pt-6 text-base text-[#dddad4]">
          <div className="shadow-[0_0_25px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#0e0f14] to-[#0b0c11] border border-[rgba(58,140,255,0.18)] rounded-lg flex flex-col">

            {/* HEADER */}
            <div className="flex items-center py-4 px-4 gap-3">
              <button className="h-9 w-9 border border-[rgba(58,140,255,0.28)] bg-[rgba(58,140,255,0.1)] flex items-center justify-center rounded-md">
                <Image src="/assets/Iconclassement.svg" alt="" width={16} height={16} />
              </button>

              <div className="tracking-[3px] leading-6 uppercase font-black">
                CLASSEMENTS
              </div>
            </div>

            {/* LIGNE */}
            <div className="h-px bg-[rgba(58,140,255,0.1)] mx-4" />

            {/* TOP 10 */}
            <div className="pt-3 px-4 pb-4 text-xs text-[#7a7870]">
              <div className="flex items-center gap-2.5">
                <button className="h-7 w-7 border border-[rgba(58,140,255,0.18)] bg-[rgba(58,140,255,0.07)] flex items-center justify-center rounded-md">
                  <Image src="/assets/Icontop10.svg" alt="" width={12} height={12} />
                </button>

                <b className="tracking-[2px] leading-4 uppercase">
                  Top 10 Joueurs
                </b>
              </div>

              {/* INPUT */}
              <div className="h-11 flex flex-col pt-2.5">
                <div className="bg-[rgba(58,140,255,0.03)] border border-[rgba(58,140,255,0.25)] flex py-2 px-3 rounded-md">
                  <input
                    className="w-full border-none outline-none font-[Inter] text-xs bg-transparent leading-4 text-[#4a4845]"
                    placeholder="Aucun joueur classé"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
};

export default ContaineraccueilMobile;
