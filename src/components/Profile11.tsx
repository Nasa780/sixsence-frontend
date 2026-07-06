import type { NextPage } from "next";
import Image from "next/image";

const Profile11: NextPage = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col items-start py-5 px-6 box-border gap-4 overflow-y-auto leading-[normal] tracking-[normal] text-left text-[13px] text-[#94a3b8] font-[Inter]">

      <div className="flex items-start gap-1.5">
        <Image
          className="h-[15px] w-[15px] relative shrink-0"
          loading="lazy"
          width={15}
          height={15}
          sizes="100vw"
          alt=""
          src="/Icon.svg"
        />
        <div className="relative leading-[19.5px] font-medium shrink-0">
          Retour
        </div>
      </div>

<header className="self-stretch rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] 
flex flex-col items-center pt-10 px-6 pb-8 relative isolate gap-2.5 
text-left text-xs text-[#6b7280] font-[Inter] mq450:pt-[26px] mq450:pb-[21px] mq450:box-border">

  <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-1.5 pl-3 pr-[11px] 
  bg-[#1c1c22] h-8 absolute top-[16px] right-[18.2px] rounded-[7px] box-border 
  flex items-start gap-1.5 whitespace-nowrap z-[0] shrink-0 hover:bg-[#4f4f54] hover:border-[#5e5e63]">
    <Image
      className="h-3 w-3 relative"
      loading="lazy"
      width={12}
      height={12}
      sizes="100vw"
      alt=""
      src="/Icon.svg"
    />
    <div className="relative text-xs leading-[18px] font-medium text-[#94a3b8] inline-block min-w-[110px]">
      Modifier mon profil
    </div>
  </button>

  <Image
    className="w-[100px] h-[100px] relative rounded-[50px] object-cover z-[1]"
    loading="lazy"
    width={100}
    height={100}
    sizes="100vw"
    alt=""
    src="/Container@2x.png"
  />

  <h3 className="m-0 relative text-[22px] leading-[33px] font-bold text-[#fff] z-[2]">
    NASA
  </h3>

  <div className="w-[81px] h-5 flex items-center justify-center gap-1.5 z-[3] text-[13px] text-[#4fc3f7]">
    <Image
      className="h-4 w-4 relative"
      loading="lazy"
      width={16}
      height={16}
      sizes="100vw"
      alt=""
      src="/Icon.svg"
    />
    <div className="h-5 flex flex-col items-center">
      <div className="relative tracking-[0.39px] leading-[19.5px] font-semibold">
        Diamond
      </div>
    </div>
  </div>

  <div className="w-[153px] h-6 flex items-center justify-center gap-2.5 z-[4]">
    <div className="h-[18px] flex items-center gap-[5px]">
      <Image
        className="h-3.5 w-3.5 relative"
        loading="lazy"
        width={14}
        height={14}
        sizes="100vw"
        alt=""
        src="/DiamondIcon.svg"
      />
      <div className="h-[18px] flex flex-col items-center">
        <div className="relative leading-[18px]">435 pts</div>
      </div>
    </div>

    <div className="h-6 flex flex-col items-center text-base text-[#2a2a30]">
      <h2 className="m-0 leading-6 font-normal">|</h2>
    </div>

    <div className="h-5 flex flex-col items-center text-[13px] text-[#4fc3f7]">
      <div className="relative leading-[19.5px] font-semibold">
        Niveau 42
      </div>
    </div>
  </div>

  <div className="flex items-center justify-center pt-1 px-0 pb-0 gap-2 z-[5] text-[#4ade80]">

    <div className="rounded-md bg-[#14532d] border-[#166534] border-solid border-[1px] 
    flex items-center py-[5px] px-3 gap-[5px]">
      <Image
        className="h-3 w-3 relative"
        loading="lazy"
        width={12}
        height={12}
        sizes="100vw"
        alt=""
        src="/Icon.svg"
      />
      <div className="h-[18px] flex flex-col items-center">
        <div className="relative leading-[18px] font-semibold">
          15461 XP
        </div>
      </div>
    </div>

    <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-[5px] px-3 
    bg-[#1c1c22] flex-1 rounded-md flex items-center gap-[5px]">
      <Image
        className="h-3 w-3 relative"
        width={12}
        height={12}
        sizes="100vw"
        alt=""
        src="/Icon.svg"
      />
      <div className="h-[18px] flex flex-col items-center">
        <div className="relative text-xs leading-[18px] text-[#cbd5e1]">
          Six Sence
        </div>
      </div>
      <div className="h-[15px] flex flex-col items-center">
        <div className="relative text-[10px] leading-[15px] text-[#6b7280]">
          [5K]
        </div>
      </div>
    </button>

    <div className="rounded-md bg-[#1c1c22] border-[#2a2a30] border-solid border-[1px] 
    flex items-center py-[5px] px-3 gap-[5px] text-[#cbd5e1]">
      <Image
        className="h-3 w-3 relative"
        loading="lazy"
        width={12}
        height={12}
        sizes="100vw"
        alt=""
        src="/Icon1.svg"
      />
      <div className="h-[18px] flex flex-col items-center">
        <div className="relative leading-[18px]">PC</div>
      </div>
    </div>

  </div>

<div className="w-[177px] h-10 flex flex-col items-center pt-1 px-0 pb-0 z-[6]">
    <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-[7px] px-3.5 
    bg-[#1c1c22] w-[177px] h-9 rounded-lg flex items-center gap-2">
      <div className="h-5 flex flex-col items-center">
        <div className="relative text-[13px] leading-[19.5px] text-[#6b7280]">
          —
        </div>
      </div>
      <div className="h-5 flex flex-col items-center">
        <div className="relative text-[13px] leading-[19.5px] font-medium text-[#cbd5e1]">
          zNaSa#9589474
        </div>
      </div>
      <Image
        className="h-[13px] w-[13px] relative"
        width={13}
        height={13}
        sizes="100vw"
        alt=""
        src="/Button.svg"
      />
    </button>
  </div>

  <div className="w-[214px] h-5 flex flex-col items-center pt-0.5 px-0 pb-0 z-[7]">
    <div className="relative leading-[18px]">
      Membre depuis le 30 décembre 2025
    </div>
  </div>

</header>

      <section className="self-stretch rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] flex flex-col items-start py-5 px-6 text-left text-[11px] text-[#94a3b8] font-[Inter]">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
            loading="lazy"
            width={18}
            height={18}
            sizes="100vw"
            alt=""
            src="/MedalIcon.svg"
          />
          <div className="h-[17px] flex flex-col items-start">
            <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
              Statistiques Totales
            </b>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start pt-4 px-0 pb-0 text-[26px] text-[#fff]">
          <div className="self-stretch flex items-center justify-center flex-wrap content-center py-0 pl-0 pr-0.5 gap-3">
            <div className="flex-1 shadow-[0px_0px_18px_rgba(192,_132,_252,_0.12)_inset] rounded-lg [background:radial-gradient(111.8%_111.8%_at_50%_0%,_#1e0d3a,_#0f0a1e_55%,_#111114)] border-[#3b1f6a] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[105px] shrink-0">
              <Image
                className="w-7 h-7 relative shadow-[0px_0px_5px_rgba(192,_132,_252,_0.85)]"
                loading="lazy"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/CrossedSwordsIcon.svg"
              />
              <div className="w-[33px] h-[26px] flex flex-col items-start">
                <h1 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                  37
                </h1>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Matchs Joués
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[119px] shrink-0 text-[#4ade80]">
              <Image
                className="w-7 h-7 relative"
                loading="lazy"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/TrophyStatIcon.svg"
              />
              <div className="w-[33px] h-[26px] flex flex-col items-start">
                <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                  22
                </h2>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Victoires Totales
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[115px] shrink-0 text-[#f87171]">
              <Image
                className="w-7 h-7 relative"
                loading="lazy"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/HeartBrokenIcon.svg"
              />
              <div className="w-[30px] h-[26px] flex flex-col items-start">
                <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                  15
                </h2>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Défaites Totales
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[117px] shrink-0 text-[#fb923c]">
              <Image
                className="w-7 h-7 relative"
                loading="lazy"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/TrendUpIcon.svg"
              />
              <div className="w-[60px] h-[26px] flex flex-col items-start">
                <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] inline-block min-w-[60px] mq450:text-[21px] mq450:leading-[21px]">
                  59%
                </h2>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Ratio de Victoire
              </div>
            </div>
          </div>
        </div>
      </section>


<section className="self-stretch rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] flex flex-col items-start py-5 px-6 text-left text-[11px] text-[#94a3b8] font-[Rajdhani]">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
            loading="lazy"
            width={18}
            height={18}
            sizes="100vw"
            alt=""
            src="/TrophyStatIcon.svg"
          />
          <div className="h-[17px] flex flex-col items-start">
            <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
              Trophées du joueur
            </b>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start pt-4 px-0 pb-0 text-2xl text-[#fff] font-[Inter]">
          <div className="self-stretch flex items-start justify-center flex-wrap content-start py-0 pl-0 pr-0.5 gap-2.5">
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(248,_113,_113,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(248,113,113,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[82px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(248,_113,_113,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🗡️
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#f87171] z-[2] shrink-0">
                Premier Sang
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(248,_113,_113,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(250,_204,_21,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(250,204,21,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 px-2 pb-3 relative isolate gap-2 min-w-[72px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(250,_204,_21,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🏆
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#facc15] z-[2] shrink-0">
                Domination
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(250,_204,_21,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(74,_222,_128,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(74,222,128,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[90px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(74,_222,_128,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🛡️
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4ade80] z-[2] shrink-0">
                Indestructible
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(74,_222,_128,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(79,_195,_247,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(79,195,247,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 px-2 pb-3 relative isolate gap-2 min-w-[74px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(79,_195,_247,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🎯
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4fc3f7] z-[2] shrink-0">
                Sniper Elite
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(79,_195,_247,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(192,_132,_252,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(192,132,252,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[59px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(192,_132,_252,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🧠
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#c084fc] z-[2] shrink-0">
                Stratège
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(192,_132,_252,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(251,_146,_60,_0.3)] rounded-[10px] bg-[#111114] border-[rgba(251,146,60,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[69px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(251,_146,_60,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <h3 className="m-0 w-[33px] relative text-[length:inherit] leading-6 font-normal font-[inherit] inline-block mq450:text-[19px] mq450:leading-[19px]">
                  ⚜️
                </h3>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#fb923c] z-[2] shrink-0">
                Légendaire
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(251,_146,_60,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
          </div>
        </div>
      </section>
{/* SECTION — BADGES DU JOUEUR */}
<section
  className="
  self-stretch rounded-xl 
  bg-[#111114]
  border border-[rgba(215,170,40,0.11)]
  shadow-[inset_0_0_18px_rgba(215,165,30,0.06)]
  flex flex-col items-start py-5 px-6 
  text-left text-[11px] text-[#e2e8f0] font-[Rajdhani]
"
>
  <div className="self-stretch flex items-center gap-2">
    <Image
      className="h-[18px] w-[18px] relative"
      loading="lazy"
      width={18}
      height={18}
      sizes="100vw"
      alt=""
      src="/Icon2.svg"
    />
    <div className="h-[17px] flex flex-col items-start">
      <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
        Badges du joueur
      </b>
    </div>
  </div>

  <div className="self-stretch flex flex-col items-start pt-4 px-0 pb-0 text-[22px] text-[#fff] font-[Inter]">
    <div className="self-stretch flex items-start justify-center flex-wrap content-start py-0 pl-0 pr-0.5 gap-2.5">

      {/* BADGE — PRÉCISION */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 pl-2 pr-[7px] 
        relative isolate gap-2 min-w-[63px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(79,195,247,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            🎯
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#4fc3f7] z-[2]">
          Précision
        </div>
      </div>

      {/* BADGE — FURIEUX */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 px-2 
        relative isolate gap-2 min-w-[54px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(251,146,60,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            🔥
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#fb923c] z-[2]">
          Furieux
        </div>
      </div>

      {/* BADGE — ÉLITE */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 px-2 
        relative isolate gap-2 min-w-[46px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(192,132,252,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            ⚡
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#c084fc] z-[2]">
          Élite
        </div>
      </div>

      {/* BADGE — MVP */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 pl-2 pr-[7px] 
        relative isolate gap-2 min-w-[46px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(250,204,21,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            👑
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#facc15] z-[2]">
          Mvp
        </div>
      </div>

      {/* BADGE — SURVIE */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 pl-2 pr-[7px] 
        relative isolate gap-2 min-w-[47px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(74,222,128,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            🛡️
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#4ade80] z-[2]">
          Survie
        </div>
      </div>

      {/* BADGE — ??? */}
      <div
        className="
        h-[75px] flex-1 rounded-[10px]
        bg-[#111114]
        border border-[rgba(215,170,40,0.11)]
        shadow-[inset_0_0_12px_rgba(215,165,30,0.06)]
        box-border overflow-hidden 
        flex flex-col items-center py-3.5 px-2 
        relative isolate gap-2 min-w-[47px] shrink-0
      "
      >
        <div
          className="
          w-[calc(100%-1.7px)] h-0.5 absolute top-[-0.5px] right-[1.7px] left-0
          [background:linear-gradient(90deg,rgba(0,0,0,0),rgba(55,65,81,0.53)_50%,rgba(0,0,0,0))]
          z-[0]
        "
        />
        <div className="self-stretch flex flex-col items-center z-[1]">
          <h3 className="m-0 w-[31px] relative leading-[22px] font-normal mq450:text-lg mq450:leading-[18px]">
            🔒
          </h3>
        </div>
        <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold text-[#374151] z-[2]">
          ???
        </div>
      </div>

    </div>
  </div>
</section>

{/* SECTION — PROGRESSION CLASSÉE */}
<section    
  className="
  self-stretch rounded-xl 
  bg-[#18181c]
  border border-[rgba(215,170,40,0.11)]
  shadow-[inset_0_0_18px_rgba(215,165,30,0.06)]
  box-border flex flex-col items-start justify-center py-5 px-6 gap-4 
  max-w-full text-left text-[11px] text-[#e2e8f0] font-[Inter]
"
>
  <div className="self-stretch flex items-center gap-2">
    <Image
      className="h-[18px] w-[18px] relative"
      loading="lazy"
      width={18}
      height={18}
      sizes="100vw"
      alt=""
      src="/Icon3.svg"
    />
    <div className="h-[17px] flex flex-col items-start">
      <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
        Progression classée
      </b>
    </div>
  </div>

  <div className="self-stretch flex flex-col items-start max-w-full text-center text-[10px] text-[#94a3b8]">
    <div className="w-full h-40 relative overflow-hidden shrink-0 max-w-full mq1025:h-auto mq1025:min-h-[160px]">

      <Image
        className="absolute top-[3px] left-[37px] w-[1060px] h-[127px] object-cover"
        loading="lazy"
        width={1060}
        height={127}
        sizes="100vw"
        alt=""
        src="/merged-asset-1@2x.png"
      />

      <div className="absolute top-[134.6px] left-[29px] w-[1073.6px] flex items-center gap-px max-w-full mq1025:flex-wrap">
        <div className="flex-1 relative inline-block max-w-[25px]">1 jan</div>
        <div className="flex-1 relative inline-block min-w-[269px] max-w-[274px]">5 jan</div>
        <div className="flex-1 relative text-left inline-block max-w-[145px]">8 jan</div>
        <div className="flex-1 relative inline-block max-w-[33px]">10 jan</div>
        <div className="flex-1 relative inline-block min-w-[258px] max-w-[264px]">12 jan</div>
        <div className="flex-1 relative inline-block max-w-[34px]">14 jan</div>
        <div className="flex-1 relative inline-block min-w-[258px] max-w-[263px]">16 jan</div>
        <div className="flex-1 relative inline-block max-w-[27px]">18 jan</div>
      </div>

      <div className="absolute top-[0.6px] left-[13px] w-[19px] flex flex-col items-start gap-[20.2px] text-left">
        <div className="self-stretch flex items-start pt-0 px-0 pb-[25.8px]">
          <div className="flex-1 relative">465</div>
        </div>
        <div className="self-stretch relative">360</div>
        <div className="self-stretch relative">305</div>
        <div className="self-stretch relative text-center">250</div>
      </div>

    </div>
  </div>
</section>

{/* SECTION — STREAK */}
      <div className="self-stretch h-[89px] rounded-xl [background:linear-gradient(135deg,_#1c0f00,_#2d1700_50%,_#1a0e00)] border-[#78350f] border-solid border-[1px] box-border flex items-center py-5 px-7 gap-3.5 text-lg text-[#fff]">
        <Image
          className="h-7 w-7 relative"
          loading="lazy"
          width={28}
          height={28}
          sizes="100vw"
          alt=""
          src="/Icon4.svg"
        />
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-start">
            <h2 className="m-0 relative text-[length:inherit] leading-[27px] font-bold font-[inherit]">
              5 victoires consécutives!
            </h2>
          </div>
          <div className="self-stretch flex flex-col items-start pt-0.5 px-0 pb-0 text-xs text-[#92400e]">
            <div className="relative leading-[18px]">Record: 5</div>
          </div>
        </div>
      </div>
      <section className="self-stretch rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border flex flex-col items-start py-5 px-6 max-w-full text-left text-[11px] text-[#94a3b8] font-[Inter]">
        <div className="self-stretch flex items-center gap-2 mq450:flex-wrap">
          <Image
            className="h-[18px] w-[18px] relative"
            loading="lazy"
            width={18}
            height={18}
            sizes="100vw"
            alt=""
            src="/Icon.svg"
          />
          <div className="h-[17px] flex flex-col items-start">
            <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
              Historique des Matchs
            </b>
          </div>
          <div className="h-[17px] flex flex-col items-start text-[#4b5563]">
            <div className="relative leading-[16.5px] font-medium">[1]</div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-center pt-4 px-0 pb-0 box-border max-w-full text-xs text-[#6b7280]">
          <div className="w-full h-14 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border flex items-center flex-wrap content-center py-3 px-4 gap-2.5 max-w-full">
            <button className="cursor-pointer [border:none] py-[3px] px-2.5 bg-[#14532d] h-[23px] rounded flex flex-col items-start box-border hover:bg-[#3b7a54]">
              <b className="relative text-[11px] tracking-[0.33px] leading-[16.5px] font-[Inter] text-[#4ade80] text-left">
                Victoire
              </b>
            </button>
            <button className="cursor-pointer [border:none] py-[3px] px-2.5 bg-[#431407] h-[23px] rounded flex flex-col items-start box-border hover:bg-[#75473b]">
              <div className="relative text-[11px] leading-[16.5px] font-semibold font-[Inter] text-[#fb923c] text-left">{`Recherche & Destruction`}</div>
            </button>
            <div className="h-[18px] flex items-center gap-1">
              <Image
                className="h-3.5 w-3.5 relative"
                loading="lazy"
                width={14}
                height={14}
                sizes="100vw"
                alt=""
                src="/ControllerIcon.svg"
              />
              <div className="h-[18px] flex flex-col items-start">
                <div className="relative leading-[18px]">5v5</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1 min-w-[86px] max-w-full">
              <div className="h-[18px] flex flex-col items-start">
                <div className="relative leading-[18px]">vs</div>
              </div>
              <div className="h-5 flex flex-col items-start text-[13px] text-[#e2e8f0]">
                <div className="relative leading-[19.5px] font-semibold">
                  SameBlood
                </div>
              </div>
            </div>
            <div className="h-[18px] flex items-center gap-[5px]">
              <Image
                className="h-[13px] w-[13px] relative"
                loading="lazy"
                width={13}
                height={13}
                sizes="100vw"
                alt=""
                src="/Icon.svg"
              />
              <div className="h-[18px] flex flex-col items-start">
                <div className="relative leading-[18px]">12 janv., 22:08</div>
              </div>
            </div>
            <button className="cursor-pointer border-[#7e22ce] border-solid border-[1px] py-[5px] px-3 bg-[#581c87] h-[30px] rounded-md box-border flex items-center gap-[5px] hover:bg-[#8042ad] hover:border-[#a347f5] hover:border-solid hover:hover:border-[1px] hover:box-border">
              <Image
                className="h-[11px] w-[11px] relative"
                width={11}
                height={11}
                sizes="100vw"
                alt=""
                src="/Icon5.svg"
              />
              <div className="relative text-xs leading-[18px] font-semibold font-[Inter] text-[#c084fc] text-left">
                Voir détails
              </div>
            </button>
          </div>
        </div>
      </section>
      <footer className="self-stretch h-[60px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border flex flex-col items-start py-5 px-6 text-left text-[11px] text-[#94a3b8] font-[Inter]">
        <div className="self-stretch flex items-center gap-2 mq450:flex-wrap">
          <Image
            className="h-[18px] w-[18px] relative"
            loading="lazy"
            width={18}
            height={18}
            sizes="100vw"
            alt=""
            src="/Icon.svg"
          />
          <div className="h-[17px] flex flex-col items-start">
            <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
              Historique Mode Classé
            </b>
          </div>
          <div className="h-[17px] flex flex-col items-start text-[#4b5563]">
            <div className="relative leading-[16.5px] font-medium">[20]</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile11;