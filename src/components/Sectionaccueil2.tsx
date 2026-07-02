import type { NextPage } from "next";
import Image from "next/image";

type Sectionaccueil2Props = {
  className?: string;
};

const Sectionaccueil2: NextPage<Sectionaccueil2Props> = ({ className = "" }) => {
  return (
    <div
      className={`w-full relative [background:linear-gradient(180deg,_#09090b,_#0d0c0a_50%,_#09090b)] border-[rgba(232,160,32,0.07)] border-solid border-t-[1px] border-b-[1px] box-border flex flex-col items-start py-20 px-6 leading-[normal] tracking-[normal] ${className}`}
    >
      <section className="self-stretch flex flex-col items-center text-left text-[10px] text-[#e8a020] font-['JetBrains_Mono']">
        <div className="w-[1024px] flex flex-col items-start max-w-[1024px] mq800:max-w-full">

          {/* TITRE SECTION */}
          <div className="self-stretch flex flex-col items-center">
            <div className="w-[305px] h-[27px] flex items-center pt-0 px-0 pb-3 box-border gap-3">
              <div className="h-px w-16 relative [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(232,_160,_32,_0.5))]" />
              <div className="flex flex-col items-start">
                <div className="relative tracking-[4.5px] leading-[15px] uppercase whitespace-nowrap">
                  Plateforme Live
                </div>
              </div>
              <div className="h-px w-16 relative [background:linear-gradient(90deg,_rgba(232,_160,_32,_0.5),_rgba(0,_0,_0,_0))]" />
            </div>

            <h3 className="m-0 relative text-2xl tracking-[2.4px] leading-8 uppercase font-black font-[Barlow] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-[19px] mq450:leading-[26px]">
              Statistiques du site
            </h3>
          </div>

          {/* BLOCS STATISTIQUES */}
          <div className="self-stretch flex flex-col items-start pt-14 px-0 pb-0 text-center text-3xl text-[#6b6860] font-[Barlow]">
            <div className="self-stretch h-[172px] flex items-start justify-center gap-4 mq800:h-auto mq800:flex-wrap">

              {/* BLOC 1 */}
              <div className="w-[244px] [background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] box-border flex flex-col items-center py-8 px-4">
                <div className="flex flex-col items-start pt-0 px-0 pb-4">
                  <div className="w-9 h-9 bg-[rgba(232,160,32,0.07)] flex items-center justify-center">
                    <Image
                      className="h-[18px] w-full relative"
                      width={18}
                      height={18}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconjoueur.svg"
                    />
                  </div>
                </div>
                <div className="w-[85px] h-[34px] flex flex-col items-center pt-0 px-0 pb-1 box-border">
                  <h1 className="m-0 relative text-[length:inherit] leading-[30px] font-black font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-lg mq450:leading-[18px] mq750:text-2xl mq750:leading-6">
                    12,847
                  </h1>
                </div>
                <div className="flex flex-col items-start pt-1 px-0 pb-0 text-xs font-['JetBrains_Mono']">
                  <div className="relative tracking-[2.4px] leading-4 uppercase">
                    Joueurs actifs
                  </div>
                </div>
              </div>

              {/* BLOC 2 */}
              <div className="w-[244px] [background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] box-border flex flex-col items-center py-8 px-4">
                <div className="flex flex-col items-start pt-0 px-0 pb-4">
                  <div className="w-9 h-9 bg-[rgba(232,160,32,0.07)] flex items-center justify-center">
                    <Image
                      className="h-[18px] w-full relative"
                      width={18}
                      height={18}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconmatch.svg"
                    />
                  </div>
                </div>
                <div className="w-28 h-[34px] flex flex-col items-center pt-0 px-0 pb-1 box-border">
                  <h2 className="m-0 relative text-[length:inherit] leading-[30px] font-black font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-lg mq450:leading-[18px] mq750:text-2xl mq750:leading-6">
                    384,920
                  </h2>
                </div>
                <div className="flex flex-col items-start pt-1 px-0 pb-0 text-xs font-['JetBrains_Mono']">
                  <div className="relative tracking-[2.4px] leading-4 uppercase">
                    Matchs joués
                  </div>
                </div>
              </div>

              {/* BLOC 3 */}
              <div className="w-[244px] [background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] box-border flex flex-col items-center py-8 px-4">
                <div className="flex flex-col items-start pt-0 px-0 pb-4">
                  <div className="w-9 h-9 bg-[rgba(232,160,32,0.07)] flex items-center justify-center">
                    <Image
                      className="h-[18px] w-full relative"
                      width={18}
                      height={18}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconvictoire.svg"
                    />
                  </div>
                </div>
                <div className="w-[104px] h-[34px] flex flex-col items-center pt-0 px-0 pb-1 box-border">
                  <h2 className="m-0 relative text-[length:inherit] leading-[30px] font-black font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-lg mq450:leading-[18px] mq750:text-2xl mq750:leading-6">
                    201,506
                  </h2>
                </div>
                <div className="flex flex-col items-start pt-1 px-0 pb-0 text-xs font-['JetBrains_Mono']">
                  <div className="relative tracking-[2.4px] leading-4 uppercase">
                    Victoires
                  </div>
                </div>
              </div>

              {/* BLOC 4 */}
              <div className="w-[244px] [background:linear-gradient(145deg,_#111110,_#0e0d0b)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] box-border flex flex-col items-center py-8 px-4">
                <div className="flex flex-col items-start pt-0 px-0 pb-4">
                  <div className="w-9 h-9 bg-[rgba(232,160,32,0.07)] flex items-center justify-center">
                    <Image
                      className="h-[18px] w-full relative"
                      width={18}
                      height={18}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconmmr.svg"
                    />
                  </div>
                </div>
                <div className="w-[72px] h-[34px] flex flex-col items-center pt-0 px-0 pb-1 box-border">
                  <h2 className="m-0 relative text-[length:inherit] leading-[30px] font-black font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-lg mq450:leading-[18px] mq750:text-2xl mq750:leading-6">
                    1,342
                  </h2>
                </div>
                <div className="flex flex-col items-start pt-1 px-0 pb-0 text-xs font-['JetBrains_Mono']">
                  <div className="relative tracking-[2.4px] leading-4 uppercase">
                    MMR moyen
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sectionaccueil2;

