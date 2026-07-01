import Image from "next/image";

type ContainerProps = {
  className?: string;
};

const Containeraccueil = ({ className = "" }: ContainerProps) => {
  return (
    <div
      className={`w-full h-[1134.6px] relative flex flex-col items-center justify-center pt-20 px-4 pb-12 box-border leading-[normal] tracking-[normal] text-center text-[10px] text-[#e8a020] font-['JetBrains_Mono'] mq450:h-auto ${className}`}
    >
      {/* Saison */}
      <div className="w-[328px] h-[47px] flex items-center justify-center pb-8 gap-2">
        <div className="h-1.5 w-1.5 bg-[#e8a020]" />
        <div className="tracking-[4.5px] leading-[15px] uppercase">
          Saison 1 · Compétition Ranked
        </div>
        <div className="h-1.5 w-1.5 bg-[#e8a020]" />
      </div>

      {/* LOGO SIX + LOGO SENCE */}
      <div className="w-[728.9px] flex items-center justify-center gap-[34.9px] relative isolate">
<Image
  src="/assets/LogoSixsence.svg"
  alt="Logo Six Sence"
  width={728}
  height={112}
  className="
  drop-shadow-[0_0_6px_rgba(255,200,100,0.18)]
  drop-shadow-[0_0_12px_rgba(255,200,100,0.12)]
"
  priority
/>
      </div>

      {/* Séparateur décoratif */}
      <div className="w-[448px] flex items-center justify-center gap-3 max-w-[448px] mq450:max-w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(232,160,32,0.55)]" />
        <div className="h-[5px] w-[5px] bg-[#e8a020] shadow-[0_0_8px_#e8a020,0_0_16px_rgba(232,160,32,0.4)]" />
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(232,160,32,0.55)] to-transparent" />
      </div>

      {/* SECTION MODE CLASSÉ */}
      <section className="w-[576px] flex flex-col items-start pt-28 max-w-[576px] text-left text-sm text-[#8a8780] font-[Barlow] mq675:pt-[73px] mq675:max-w-full mq450:h-auto">
        <div className="self-stretch shadow-[0_0_40px_rgba(0,0,0,0.7),0_0_24px_rgba(58,140,255,0.07)] bg-gradient-to-br from-[#0e0f14] to-[#0b0c11] border border-[rgba(58,140,255,0.22)] flex flex-col">
          
          {/* Header Mode Classé */}
          <div className="flex items-start pt-5 px-5 pb-3 gap-4 mq450:flex-wrap">
            <button className="h-12 w-12 bg-gradient-to-br from-[#1a6fe0] to-[#3a8cff] shadow-[0_0_16px_rgba(58,140,255,0.45)] flex items-center justify-center">
              <Image
                src="/assets/Icontrophee.svg"
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
              />
            </button>

            <div className="flex flex-col gap-0.5">
              <div className="tracking-[3.08px] leading-5 uppercase font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f5e8a0] to-[#e8a020]">
                MODE CLASSÉ
              </div>
              <div className="text-xs font-[Inter] leading-4">
                Solo 4v4 & 5v5 – Affronte les meilleurs joueurs !
              </div>
            </div>
          </div>

          {/* Ligne */}
          <div className="h-px bg-[rgba(58,140,255,0.1)] mx-5" />

          {/* Aucun match */}
          <div className="py-2.5 px-5 text-xs text-[#4a4845] font-[Inter]">
            Aucun match en cours actuellement
          </div>

          {/* Ligne */}
          <div className="h-px bg-[rgba(58,140,255,0.1)] mx-5" />

          {/* Bouton Jouer */}
          <div className="p-4">
            <button className="w-[542px] h-11 bg-gradient-to-br from-[#3a8cff] to-[#1a6fe0] flex items-center justify-center gap-1.5">
              <b className="text-sm tracking-[2.52px] leading-5 uppercase text-white">
                Jouer
              </b>
              <Image src="/assets/Iconjouer.svg" alt="" width={12} height={12} />
            </button>
          </div>
        </div>

        {/* CLASSEMENTS */}
        <div className="pt-3 text-base text-[#dddad4]">
          <div className="w-[576px] shadow-[0_0_30px_rgba(0,0,0,0.5),0_0_16px_rgba(58,140,255,0.05)] bg-gradient-to-br from-[#0e0f14] to-[#0b0c11] border border-[rgba(58,140,255,0.18)] flex flex-col">
            
            {/* Header Classements */}
            <div className="flex items-center py-4 px-5 gap-[13px] mq450:flex-wrap">
              <button className="h-10 w-10 border border-[rgba(58,140,255,0.28)] bg-[rgba(58,140,255,0.1)] flex items-center justify-center">
                <Image src="/assets/Iconclassement.svg" alt="" width={18} height={18} />
              </button>

              <div className="tracking-[3.52px] leading-6 uppercase font-black">
                CLASSEMENTS
              </div>
            </div>

            {/* Ligne */}
            <div className="h-px bg-[rgba(58,140,255,0.1)] mx-5" />

            {/* Top 10 */}
            <div className="pt-3 px-5 pb-4 text-xs text-[#7a7870]">
              <div className="flex items-center gap-2.5">
                <button className="h-7 w-7 border border-[rgba(58,140,255,0.18)] bg-[rgba(58,140,255,0.07)] flex items-center justify-center opacity-85">
                  <Image src="/assets/Icontop10.svg" alt="" width={13} height={13} />
                </button>

                <b className="tracking-[2.4px] leading-4 uppercase">
                  Top 10 Joueurs
                </b>
              </div>

              {/* Input */}
              <div className="h-11 flex flex-col pt-2.5">
                <div className="bg-[rgba(58,140,255,0.03)] border border-[rgba(58,140,255,0.25)] flex py-2 pl-[11px] pr-[9px]">
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

export default Containeraccueil;
