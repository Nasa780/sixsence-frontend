import type { NextPage } from "next";
import Image from "next/image";

const Appaccueil3: NextPage = () => {
  return (
<div className="w-full relative flex flex-col items-center pt-5 px-6 pb-10 box-border max-w-[1320px] mx-auto">
<section className="w-full h-[202px] relative bg-[#111d2a] border border-[rgba(255,160,64,0.4)] overflow-hidden flex flex-col items-center justify-center">

  {/* Fond rose derrière tout le rectangle */}
  <div className="absolute inset-0 z-[1] pointer-events-none">
    <Image
      src="/assets/fond-rose.png"
      alt="map background"
      fill
      className="object-cover opacity-60"
    />
  </div>

  {/* Image de fond */}
  <div className="absolute inset-0 z-[0] bg-[url('/App@3x.png')] bg-cover bg-no-repeat bg-top" />

  {/* Overlay bleu */}
  <div className="absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(10,26,47,0.85),rgba(10,26,47,0.2)_50%,rgba(10,26,47,0.85))]" />

  {/* Contenu centré */}
  <div className="relative z-[4] flex flex-col items-center gap-2">

    <h1 className="text-[44px] tracking-[7.92px] leading-[44px] uppercase font-bold text-[#f5f5f5]">
      MELTDOWN
    </h1>

    <div className="flex items-center gap-4 text-sm text-[#ffa040] font-['Barlow_Condensed']">
      <div className="h-[31px] bg-[rgba(255,160,64,0.15)] border border-[rgba(255,160,64,0.5)] px-3.5 flex items-center gap-1">
        <Image src="/assets/Icon5v5.svg" width={12} height={12} alt="" />
        <b className="tracking-[1.96px] leading-[21px] uppercase">5 v 5</b>
      </div>

      <div className="h-[30px] bg-[rgba(15,42,74,0.7)] border border-[rgba(200,200,200,0.2)] px-3.5 flex items-center gap-1 text-[#c8c8c8]">
        <Image src="/assets/Iconheure.svg" width={11} height={11} alt="" />
        <div className="tracking-[1.3px] leading-[19.5px] font-semibold">
          23 janv., 23:47
        </div>
      </div>
    </div>

  </div>

</section>

      <main className="self-stretch flex flex-col items-start pt-5 px-0 pb-0 box-border max-w-full">
        <div className="self-stretch flex items-start flex-wrap content-start gap-4 max-w-full">
          <section className="flex-1 bg-[#111d2a] border-[rgba(255,160,64,0.18)] border-solid border-[1px] box-border flex flex-col items-start relative isolate min-w-[220px] max-w-full text-left text-[11px] text-[#ffa040] font-[Rajdhani]">
            <div className="self-stretch h-[33.5px] bg-[rgba(255,160,64,0.07)] border-[rgba(255,160,64,0.2)] border-solid border-b-[1px] box-border flex items-center pt-2 px-3.5 pb-1.5 gap-2 z-[0]">
              <Image
                className="h-[11px] w-[11px] relative"
                loading="lazy"
                width={11}
                height={11}
                sizes="100vw"
                alt=""
                src="/assets/Iconshield.svg"
              />
              <b className="relative tracking-[1.98px] leading-[16.5px] uppercase">
                Équipe 1
              </b>
            </div>
            <div className="self-stretch flex flex-col items-start z-[1]">
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 mq450:flex-wrap">
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    NI
                  </b>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[166px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-start">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      NightFury
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #7823401
                    </div>
                  </div>
                </div>
                <div className="h-[21px] flex items-center gap-[5px] text-[10px] text-[#00d4ff] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                  <div className="h-[21px] bg-[rgba(185,242,255,0.18)] border-[rgba(125,211,252,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-[5px] text-[#7dd3fc]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#7dd3fc]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Diamant
                    </b>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] overflow-x-auto flex items-center py-[9px] px-3.5 gap-2.5">
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border shrink-0 flex items-center justify-center">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    SH
                  </b>
                </div>
                <div className="flex-1 flex flex-col items-start text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-start">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      ShadowX
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #4521983
                    </div>
                  </div>
                </div>
                <div className="h-[21px] flex items-center gap-[5px] text-[9px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(255,160,64,0.1)] border-[rgba(255,160,64,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5">
                    <div className="h-3.5 flex flex-col items-start">
                      <div className="relative tracking-[0.8px] leading-[13.5px] uppercase font-semibold">
                        ⬡
                      </div>
                    </div>
                    <div className="relative text-[10px] tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PS
                    </div>
                  </div>
                  <div className="h-[21px] bg-[rgba(160,216,239,0.15)] border-[rgba(160,216,239,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1 text-[10px] text-[#a0d8ef]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#a0d8ef]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Platine
                    </b>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 mq450:flex-wrap">
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    PR
                  </b>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[185px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-start">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      ProSniper99
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #9034512
                    </div>
                  </div>
                </div>
                <div className="h-[21px] flex items-center gap-[5px] text-[10px] text-[#00d4ff] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                  <div className="h-[21px] bg-[rgba(255,215,0,0.15)] border-[rgba(255,215,0,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1 text-[#ffd700]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#ffd700]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Or
                    </b>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] overflow-x-auto flex items-center py-[9px] px-3.5 gap-2.5">
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border shrink-0 flex items-center justify-center">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    IC
                  </b>
                </div>
                <div className="flex-1 flex flex-col items-start text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-start">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      IceBreaker
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #3345678
                    </div>
                  </div>
                </div>
                <div className="h-[21px] flex items-center gap-[5px] text-[9px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(255,160,64,0.1)] border-[rgba(255,160,64,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5">
                    <div className="h-3.5 flex flex-col items-start">
                      <div className="relative tracking-[0.8px] leading-[13.5px] uppercase font-semibold">
                        ⬡
                      </div>
                    </div>
                    <div className="relative text-[10px] tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PS
                    </div>
                  </div>
                  <div className="h-[21px] bg-[rgba(192,192,192,0.15)] border-[rgba(192,192,192,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1 text-[10px] text-[#c0c0c0]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#c0c0c0]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Argent
                    </b>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 mq450:flex-wrap">
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    VO
                  </b>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[185px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-start">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      VortexKing
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #8812345
                    </div>
                  </div>
                </div>
                <div className="h-[21px] flex items-center gap-[5px] text-[10px] text-[#00d4ff] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                  <div className="h-[21px] bg-[rgba(255,215,0,0.15)] border-[rgba(255,215,0,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1 text-[#ffd700]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#ffd700]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Or
                    </b>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex items-start justify-end py-2.5 px-[13px] z-[2] text-[10px] text-[#3d5166] font-['Barlow_Condensed']">
              <div className="self-stretch flex flex-col items-start">
                <div className="relative tracking-[0.8px] leading-[15px] uppercase">
                  5 joueurs
                </div>
              </div>
            </div>
            <div className="w-4 h-px absolute !!m-[0 important] right-[2px] bottom-[-7.89px] bg-[rgba(255,160,64,0.4)] [transform:_rotate(-45deg)] [transform-origin:0_0] z-[3]" />
          </section>
          <section className="flex-1 bg-[#111d2a] border-[rgba(255,160,64,0.4)] border-solid border-[1px] box-border flex flex-col items-start relative isolate gap-2 min-w-[275px] max-w-[340px] text-left text-[11px] text-[#ffa040] font-[Rajdhani] mq800:max-w-full">
            <div className="self-stretch h-[34px] bg-[rgba(255,160,64,0.07)] border-[rgba(255,160,64,0.2)] border-solid border-b-[1px] box-border flex items-center py-2 px-3.5 z-[0]">
              <b className="relative tracking-[1.98px] leading-[16.5px] uppercase">
                Chat
              </b>
            </div>
            <div className="self-stretch overflow-hidden flex flex-col items-start pt-0 px-0 pb-[57px] z-[1]">
              <div className="self-stretch flex flex-col items-center py-2 px-3.5 text-[10px] text-[#6b7f94] font-[Barlow]">
                <i className="relative leading-[15px]">
                  Le match a démarré — bonne chance à tous !
                </i>
              </div>
              <div className="self-stretch flex flex-col items-start py-[5px] px-3.5 gap-px">
                <div className="self-stretch flex items-center gap-1.5">
                  <div className="h-[17px] flex flex-col items-start">
                    <b className="relative tracking-[0.66px] leading-[16.5px]">
                      NightFury
                    </b>
                  </div>
                  <div className="h-3.5 flex flex-col items-start text-[9px] text-[#3d5166] font-[Barlow]">
                    <div className="relative leading-[13.5px]">23:47</div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start text-xs text-[#c8c8c8] font-[Barlow]">
                  <div className="relative leading-[16.8px] inline-block min-w-[100px]">
                    GL HF everyone 🔥
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start py-[5px] px-3.5 gap-px text-[#7dd3fc]">
                <div className="self-stretch flex items-center gap-1.5">
                  <div className="h-[17px] flex flex-col items-start">
                    <b className="relative tracking-[0.66px] leading-[16.5px]">
                      StormRider
                    </b>
                  </div>
                  <div className="h-3.5 flex flex-col items-start text-[9px] text-[#3d5166] font-[Barlow]">
                    <div className="relative leading-[13.5px]">23:48</div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start text-xs text-[#c8c8c8] font-[Barlow]">
                  <div className="relative leading-[16.8px]">
                    On va écraser l'équipe 1 facilement
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start py-[5px] px-3.5 gap-px">
                <div className="self-stretch flex items-center gap-1.5">
                  <div className="h-[17px] flex flex-col items-start">
                    <b className="relative tracking-[0.66px] leading-[16.5px]">
                      ShadowX
                    </b>
                  </div>
                  <div className="h-3.5 flex flex-col items-start text-[9px] text-[#3d5166] font-[Barlow]">
                    <div className="relative leading-[13.5px]">23:48</div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start text-xs text-[#c8c8c8] font-[Barlow]">
                  <div className="relative leading-[16.8px]">
                    Meltdown on connaît par cœur, on est chez nous
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start py-[5px] px-3.5 gap-px text-[#7dd3fc]">
                <div className="self-stretch flex items-center gap-1.5">
                  <div className="h-[17px] flex flex-col items-start">
                    <b className="relative tracking-[0.66px] leading-[16.5px]">
                      PhantomAce
                    </b>
                  </div>
                  <div className="h-3.5 flex flex-col items-start text-[9px] text-[#3d5166] font-[Barlow]">
                    <div className="relative leading-[13.5px]">23:49</div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start text-xs text-[#c8c8c8] font-[Barlow]">
                  <div className="relative leading-[16.8px] inline-block min-w-[77px]">
                    On verra ça 😤
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start py-[5px] px-3.5 gap-px">
                <div className="self-stretch flex items-center gap-1.5">
                  <div className="h-[17px] flex flex-col items-start">
                    <b className="relative tracking-[0.66px] leading-[16.5px]">
                      IceBreaker
                    </b>
                  </div>
                  <div className="h-3.5 flex flex-col items-start text-[9px] text-[#3d5166] font-[Barlow]">
                    <div className="relative leading-[13.5px]">23:49</div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start text-xs text-[#c8c8c8] font-[Barlow]">
                  <div className="relative leading-[16.8px]">
                    Focus les gars, pas de chat pendant le match
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch bg-[rgba(10,26,47,0.5)] border-[rgba(255,160,64,0.2)] border-solid border-t-[1px] flex items-start py-2.5 px-3 gap-2 z-[2] mq450:flex-wrap">
              <div className="h-[30px] flex-1 bg-[rgba(255,255,255,0.04)] border-[rgba(255,160,64,0.15)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-start justify-center py-[7px] px-2.5 min-w-[177px]">
                <input
                  className="w-[calc(100%_-_20px)] [border:none] [outline:none] font-[Barlow] text-xs bg-[transparent] self-stretch h-3.5 relative text-[rgba(245,245,245,0.5)] text-left inline-block min-w-[150px] p-0"
                  placeholder="Votre message..."
                  type="text"
                />
              </div>
              <Image
                className="cursor-pointer [border:none] p-0 bg-[transparent] h-[26px] w-[26px] relative"
                width={26}
                height={26}
                sizes="100vw"
                alt=""
                src="/assets/Iconbuttom.svg"
              />
            </div>
          </section>
          <section className="flex-1 bg-[#111d2a] border-[rgba(255,160,64,0.18)] border-solid border-[1px] box-border flex flex-col items-start relative isolate min-w-[232px] max-w-full text-left text-[10px] text-[#ffa040] font-[Rajdhani]">
            <div className="self-stretch h-[33.5px] bg-[rgba(255,160,64,0.07)] border-[rgba(255,160,64,0.2)] border-solid border-b-[1px] box-border flex items-center pt-2 px-3.5 pb-1.5 gap-2 z-[0] text-[11px]">
              <Image
                className="h-[11px] w-[11px] relative"
                loading="lazy"
                width={11}
                height={11}
                sizes="100vw"
                alt=""
                src="/assets/Iconshield.svg"
              />
              <b className="relative tracking-[1.98px] leading-[16.5px] uppercase">
                Équipe 2
              </b>
            </div>
            <div className="self-stretch flex flex-col items-start z-[1] text-[#a0d8ef]">
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 mq450:flex-wrap">
                <div className="h-[21px] flex items-center justify-end gap-[5px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(160,216,239,0.15)] border-[rgba(160,216,239,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#a0d8ef]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Platine
                    </b>
                  </div>
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5 text-[#00d4ff]">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[168px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-end">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      StormRider
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-end text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #6634521
                    </div>
                  </div>
                </div>
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center text-[11px] text-[#ffa040]">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    ST
                  </b>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] overflow-x-auto flex items-center py-[9px] px-3.5 gap-2.5 text-[#ffd700]">
                <div className="h-[21px] flex items-center justify-end gap-[5px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(255,215,0,0.15)] border-[rgba(255,215,0,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#ffd700]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Or
                    </b>
                  </div>
                  <div className="h-[21px] bg-[rgba(255,160,64,0.1)] border-[rgba(255,160,64,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5 text-[9px] text-[#ffa040]">
                    <div className="h-3.5 flex flex-col items-start">
                      <div className="relative tracking-[0.8px] leading-[13.5px] uppercase font-semibold">
                        ⬡
                      </div>
                    </div>
                    <div className="relative text-[10px] tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PS
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-end">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      PhantomAce
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-end text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #2298341
                    </div>
                  </div>
                </div>
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border shrink-0 flex items-center justify-center text-[11px] text-[#ffa040]">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    PH
                  </b>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 text-[#7dd3fc] mq450:flex-wrap">
                <div className="h-[21px] flex items-center justify-end gap-[5px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(185,242,255,0.18)] border-[rgba(125,211,252,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-[5px]">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#7dd3fc]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Diamant
                    </b>
                  </div>
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5 text-[#00d4ff]">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[166px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-end">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      TacticalGod
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-end text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #5567890
                    </div>
                  </div>
                </div>
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center text-[11px] text-[#ffa040]">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    TA
                  </b>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] overflow-x-auto flex items-center py-[9px] px-3.5 gap-2.5 text-[#c0c0c0]">
                <div className="h-[21px] flex items-center justify-end gap-[5px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(192,192,192,0.15)] border-[rgba(192,192,192,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#c0c0c0]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Argent
                    </b>
                  </div>
                  <div className="h-[21px] bg-[rgba(255,160,64,0.1)] border-[rgba(255,160,64,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5 text-[9px] text-[#ffa040]">
                    <div className="h-3.5 flex flex-col items-start">
                      <div className="relative tracking-[0.8px] leading-[13.5px] uppercase font-semibold">
                        ⬡
                      </div>
                    </div>
                    <div className="relative text-[10px] tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PS
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-end">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      BlitzKrieg
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-end text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #7723456
                    </div>
                  </div>
                </div>
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border shrink-0 flex items-center justify-center text-[11px] text-[#ffa040]">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    BL
                  </b>
                </div>
              </div>
              <div className="self-stretch bg-[rgba(255,255,255,0.02)] border-[rgba(255,160,64,0.07)] border-solid border-b-[1px] flex items-center py-[9px] px-3.5 gap-2.5 text-[#cd7f32] mq450:flex-wrap">
                <div className="h-[21px] flex items-center justify-end gap-[5px] font-['Barlow_Condensed']">
                  <div className="h-[21px] bg-[rgba(205,127,50,0.15)] border-[rgba(205,127,50,0.27)] border-solid border-[1px] box-border flex items-center py-0.5 px-[9px] gap-1">
                    <div className="h-[5px] w-[5px] relative rounded-[2.5px] bg-[#cd7f32]" />
                    <b className="relative tracking-[1px] leading-[15px] uppercase">
                      Bronze
                    </b>
                  </div>
                  <div className="h-[21px] bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] border-solid border-[1px] box-border flex items-center py-0.5 px-[7px] gap-0.5 text-[#00d4ff]">
                    <Image
                      className="h-[9px] w-[9px] relative"
                      loading="lazy"
                      width={9}
                      height={9}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconpc.svg"
                    />
                    <div className="relative tracking-[0.8px] leading-[15px] uppercase font-semibold">
                      PC
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start min-w-[170px] text-[13px] text-[#f5f5f5]">
                  <div className="self-stretch flex flex-col items-end">
                    <div className="relative tracking-[0.26px] leading-[15.6px] font-semibold">
                      MidnightSlyr
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-end text-[10px] text-[#6b7f94] font-[Barlow]">
                    <div className="relative tracking-[0.4px] leading-[15px]">
                      #9941230
                    </div>
                  </div>
                </div>
                <div className="h-8 w-8 [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border-[rgba(255,160,64,0.25)] border-solid border-[1px] box-border flex items-center justify-center text-[11px] text-[#ffa040]">
                  <b className="relative tracking-[0.44px] leading-[16.5px]">
                    MI
                  </b>
                </div>
              </div>
            </div>
            <div className="self-stretch flex items-start py-2.5 px-[13px] z-[2] text-[#3d5166] font-['Barlow_Condensed']">
              <div className="self-stretch flex flex-col items-start">
                <div className="relative tracking-[0.8px] leading-[15px] uppercase">
                  5 joueurs
                </div>
              </div>
            </div>
            <div className="w-4 h-px absolute !!m-[0 important] right-[2px] bottom-[-7.89px] bg-[rgba(255,160,64,0.4)] [transform:_rotate(-45deg)] [transform-origin:0_0] z-[3]" />
          </section>
        </div>
      </main>
      <section className="self-stretch flex flex-col items-start pt-5 px-0 pb-0 box-border max-w-full text-left text-[11px] text-[#ffa040] font-[Rajdhani]">
        <div className="self-stretch bg-[#111d2a] border-[rgba(255,160,64,0.4)] border-solid border-[1px] box-border flex flex-col items-start relative isolate max-w-full">
          <div className="self-stretch h-[33.5px] bg-[rgba(255,160,64,0.07)] border-[rgba(255,160,64,0.2)] border-solid border-b-[1px] box-border flex items-center pt-2 px-3.5 pb-1.5 gap-2 z-[0]">
            <Image
              className="h-[11px] w-[11px] relative"
              loading="lazy"
              width={11}
              height={11}
              sizes="100vw"
              alt=""
              src="/assets/Iconwin.svg"
            />
            <b className="relative tracking-[1.98px] leading-[16.5px] uppercase">
              Vote du Vainqueur
            </b>
          </div>
          <div className="self-stretch flex items-center flex-wrap content-center py-4 pl-1.5 pr-[18px] box-border gap-4 max-w-full z-[1] text-xs text-[#6b7f94] font-[Barlow]">
            <div className="flex-1 flex flex-col items-end min-w-[190px] max-w-[204px] mq402:max-w-full">
              <div className="relative leading-[18px]">
                Quelle équipe remportera ce match ?
              </div>
            </div>
            <div className="flex-1 flex items-start justify-end gap-3 min-w-[345px] max-w-full mq450:flex-wrap">
              <button className="cursor-pointer border-[rgba(255,160,64,0.3)] border-solid border-[1px] py-2.5 px-7 bg-[rgba(255,160,64,0.08)] h-10 box-border flex items-center gap-[7px] hover:bg-[rgba(204,110,13,0.08)] hover:border-[rgba(204,110,13,0.3)] hover:border-solid hover:hover:border-[1px] hover:box-border">
                <Image
                  className="h-3 w-3 relative"
                  width={12}
                  height={12}
                  sizes="100vw"
                  alt=""
                  src="/assets/Iconwin2.svg"
                />
                <b className="relative text-xs tracking-[1.68px] leading-[18px] uppercase font-[Rajdhani] text-[#ffa040] text-left">
                  Victoire Équipe 1
                </b>
              </button>
              <button className="cursor-pointer border-[rgba(255,160,64,0.3)] border-solid border-[1px] py-2.5 px-7 bg-[rgba(255,160,64,0.08)] h-10 box-border flex items-center gap-[7px] hover:bg-[rgba(204,110,13,0.08)] hover:border-[rgba(204,110,13,0.3)] hover:border-solid hover:hover:border-[1px] hover:box-border">
                <Image
                  className="h-3 w-3 relative"
                  width={12}
                  height={12}
                  sizes="100vw"
                  alt=""
                  src="/assets/Iconwin2.svg"
                />
                <b className="relative text-xs tracking-[1.68px] leading-[18px] uppercase font-[Rajdhani] text-[#ffa040] text-left">
                  Victoire Équipe 2
                </b>
              </button>
            </div>
          </div>
          <div className="w-4 h-px absolute !!m-[0 important] right-[2px] bottom-[-7.89px] bg-[#ffa040] [transform:_rotate(-45deg)] [transform-origin:0_0] z-[2]" />
        </div>
      </section>
    </div>
  );
};

export default Appaccueil3;
