import type { NextPage } from "next";
import Image from "next/image";

const Profile11: NextPage = () => {
  return (
    <div className="max-w-[1200px] flex flex-col items-start py-5 px-6 box-border gap-4 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Inter]">
      <div className="flex items-center gap-1.5 text-[13px]">
        <Image
          className="h-[15px] w-[15px] relative shrink-0"
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
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] flex flex-col items-center pt-10 px-6 pb-8 relative isolate gap-2.5 text-xs text-[#6b7280] mq450:pt-[26px] mq450:pb-[21px] mq450:box-border">
        <div className="h-8 !!m-[0 important] absolute top-[16px] right-[18.2px] rounded-[7px] bg-[#09090e] border-[rgba(215,170,40,0.08)] border-solid border-[1px] box-border flex items-center py-1.5 pl-3 pr-[11px] gap-1.5 whitespace-nowrap z-[0] shrink-0 text-[#94a3b8]">
          <Image
            className="h-3 w-3 relative"
            width={12}
            height={12}
            sizes="100vw"
            alt=""
            src="/Icon.svg"
          />
          <div className="relative leading-[18px] font-medium inline-block min-w-[110px]">
            Modifier mon profil
          </div>
        </div>
        <Image
          className="w-[100px] h-[100px] relative rounded-[50px] object-cover z-[1] shrink-0"
          width={100}
          height={100}
          sizes="100vw"
          alt=""
          src="/Container@2x.png"
        />
        <b className="relative text-[22px] leading-[33px] text-[#fff] z-[2] shrink-0 mq450:text-lg mq450:leading-[26px]">
          NASA
        </b>
        <div className="w-[81px] h-5 flex items-center gap-1.5 z-[3] shrink-0 text-[13px] text-[#4fc3f7]">
          <Image
            className="h-4 w-4 relative"
            width={16}
            height={16}
            sizes="100vw"
            alt=""
            src="/Icon.svg"
          />
          <div className="h-5 flex flex-col items-start">
            <div className="relative tracking-[0.39px] leading-[19.5px] font-semibold">
              Diamond
            </div>
          </div>
        </div>
        <div className="w-[153px] h-6 flex items-center gap-2.5 z-[4] shrink-0">
          <div className="h-[18px] flex items-center gap-[5px]">
            <Image
              className="h-3.5 w-3.5 relative"
              width={14}
              height={14}
              sizes="100vw"
              alt=""
              src="/DiamondIcon.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">435 pts</div>
            </div>
          </div>
          <div className="h-6 flex flex-col items-start text-base text-[#2a2a30]">
            <div className="relative leading-6">|</div>
          </div>
          <div className="h-5 flex flex-col items-start text-[13px] text-[#4fc3f7]">
            <div className="relative leading-[19.5px] font-semibold">
              Niveau 42
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-1 px-0 pb-0 gap-2 z-[5] shrink-0 text-[#cbd5e1] mq450:flex-wrap">
          <div className="self-stretch rounded-md bg-[#14532d] border-[#166534] border-solid border-[1px] flex items-center py-[5px] px-3 gap-[5px] text-[#4ade80]">
            <Image
              className="h-3 w-3 relative"
              width={12}
              height={12}
              sizes="100vw"
              alt=""
              src="/Icon.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px] font-semibold">
                15461 XP
              </div>
            </div>
          </div>
          <div className="self-stretch flex-1 rounded-md bg-[#09090e] border-[rgba(255,255,255,0.07)] border-solid border-[1px] overflow-x-auto flex items-center py-[5px] px-3 gap-[5px]">
            <Image
              className="h-3 w-3 relative shrink-0"
              width={12}
              height={12}
              sizes="100vw"
              alt=""
              src="/Icon.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">Six Sence</div>
            </div>
            <div className="h-[15px] flex flex-col items-start text-[10px] text-[#6b7280]">
              <div className="relative leading-[15px]">[5K]</div>
            </div>
          </div>
          <div className="self-stretch rounded-md bg-[#09090e] border-[rgba(255,255,255,0.07)] border-solid border-[1px] flex items-center py-[5px] px-3 gap-[5px]">
            <Image
              className="h-3 w-3 relative"
              width={12}
              height={12}
              sizes="100vw"
              alt=""
              src="/Icon1.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">PC</div>
            </div>
          </div>
        </div>
        <div className="w-[177px] h-10 flex flex-col items-start pt-1 px-0 pb-0 box-border z-[6] shrink-0 text-[13px]">
          <div className="w-[177px] h-9 rounded-lg bg-[#09090e] border-[rgba(215,170,40,0.08)] border-solid border-[1px] box-border overflow-x-auto shrink-0 flex items-center py-[7px] px-3.5 gap-2">
            <div className="h-5 flex flex-col items-start">
              <div className="relative leading-[19.5px]">—</div>
            </div>
            <div className="h-5 flex flex-col items-start text-[#cbd5e1]">
              <div className="relative leading-[19.5px] font-medium">
                zNaSa#9589474
              </div>
            </div>
            <Image
              className="h-[13px] w-[13px] relative shrink-0"
              width={13}
              height={13}
              sizes="100vw"
              alt=""
              src="/Button.svg"
            />
          </div>
        </div>
        <div className="w-[214px] h-5 flex flex-col items-start pt-0.5 px-0 pb-0 box-border z-[7] shrink-0">
          <div className="relative leading-[18px]">
            Membre depuis le 30 décembre 2025
          </div>
        </div>
      </div>
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] flex flex-col items-start py-5 px-6">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
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
            <div className="flex-1 shadow-[0px_0px_18px_rgba(192,_132,_252,_0.12)_inset] rounded-lg [background:radial-gradient(111.8%_111.8%_at_50%_0%,_#1e0d3a,_#0f0a1e_55%,_#07080d)] border-[#3b1f6a] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[105px] shrink-0">
              <Image
                className="w-7 h-7 relative shadow-[0px_0px_5px_rgba(192,_132,_252,_0.85)]"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/CrossedSwordsIcon.svg"
              />
              <div className="w-[33px] h-[26px] flex flex-col items-start">
                <b className="relative leading-[26px] mq450:text-[21px] mq450:leading-[21px]">
                  37
                </b>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Matchs Joués
              </div>
            </div>
            <div className="flex-1 rounded-lg [background:linear-gradient(160deg,_#09090f,_#070810)] border-[rgba(255,255,255,0.05)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[119px] shrink-0 text-[#4ade80]">
              <Image
                className="w-7 h-7 relative"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/TrophyStatIcon.svg"
              />
              <div className="w-[33px] h-[26px] flex flex-col items-start">
                <b className="relative leading-[26px] mq450:text-[21px] mq450:leading-[21px]">
                  22
                </b>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Victoires Totales
              </div>
            </div>
            <div className="flex-1 rounded-lg [background:linear-gradient(160deg,_#09090f,_#070810)] border-[rgba(255,255,255,0.05)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[115px] shrink-0 text-[#f87171]">
              <Image
                className="w-7 h-7 relative"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/HeartBrokenIcon.svg"
              />
              <div className="w-[30px] h-[26px] flex flex-col items-start">
                <b className="relative leading-[26px] mq450:text-[21px] mq450:leading-[21px]">
                  15
                </b>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Défaites Totales
              </div>
            </div>
            <div className="flex-1 rounded-lg [background:linear-gradient(160deg,_#09090f,_#070810)] border-[rgba(255,255,255,0.05)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[117px] shrink-0 text-[#fb923c]">
              <Image
                className="w-7 h-7 relative"
                width={28}
                height={28}
                sizes="100vw"
                alt=""
                src="/TrendUpIcon.svg"
              />
              <div className="w-[60px] h-[26px] flex flex-col items-start">
                <b className="relative leading-[26px] inline-block min-w-[60px] mq450:text-[21px] mq450:leading-[21px]">
                  59%
                </b>
              </div>
              <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
                Ratio de Victoire
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] flex flex-col items-start py-5 px-6 font-[Rajdhani]">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
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
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(248,_113,_113,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(248,113,113,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[82px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(248,_113,_113,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🗡️
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#f87171] z-[2] shrink-0">
                Premier Sang
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(248,_113,_113,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(250,_204,_21,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(250,204,21,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 px-2 pb-3 relative isolate gap-2 min-w-[72px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(250,_204,_21,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🏆
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#facc15] z-[2] shrink-0">
                Domination
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(250,_204,_21,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(74,_222,_128,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(74,222,128,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[90px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(74,_222,_128,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🛡️
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4ade80] z-[2] shrink-0">
                Indestructible
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(74,_222,_128,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(79,_195,_247,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(79,195,247,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 px-2 pb-3 relative isolate gap-2 min-w-[74px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(79,_195,_247,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🎯
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4fc3f7] z-[2] shrink-0">
                Sniper Elite
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(79,_195,_247,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(192,_132,_252,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(192,132,252,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[59px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(192,_132,_252,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  🧠
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#c084fc] z-[2] shrink-0">
                Stratège
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(192,_132,_252,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
            <div className="h-[74px] flex-1 shadow-[0px_0px_14px_rgba(251,_146,_60,_0.3)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(251,146,60,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center pt-4 pb-3 pl-2 pr-[7px] relative isolate gap-2 min-w-[69px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(251,_146,_60,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[33px] relative leading-6 inline-block mq450:text-[19px] mq450:leading-[19px]">
                  ⚜️
                </div>
              </div>
              <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#fb923c] z-[2] shrink-0">
                Légendaire
              </b>
              <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2.5px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(251,_146,_60,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] flex flex-col items-start py-5 px-6 font-[Rajdhani]">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
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
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(79,_195,_247,_0.35)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(79,195,247,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 pl-2 pr-[7px] relative isolate gap-2 min-w-[63px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(79,_195,_247,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  🎯
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#4fc3f7] z-[2] shrink-0">
                Précision
              </div>
            </div>
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(251,_146,_60,_0.35)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(251,146,60,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 px-2 relative isolate gap-2 min-w-[54px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(251,_146,_60,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  🔥
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#fb923c] z-[2] shrink-0">
                Furieux
              </div>
            </div>
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(192,_132,_252,_0.35)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(192,132,252,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 px-2 relative isolate gap-2 min-w-[46px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(192,_132,_252,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  ⚡
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#c084fc] z-[2] shrink-0">
                Élite
              </div>
            </div>
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(250,_204,_21,_0.35)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(250,204,21,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 pl-2 pr-[7px] relative isolate gap-2 min-w-[46px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(250,_204,_21,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  👑
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#facc15] z-[2] shrink-0">
                Mvp
              </div>
            </div>
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(74,_222,_128,_0.35)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(74,222,128,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 pl-2 pr-[7px] relative isolate gap-2 min-w-[47px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(74,_222,_128,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  🛡️
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#4ade80] z-[2] shrink-0">
                Survie
              </div>
            </div>
            <div className="h-[75px] flex-1 shadow-[0px_0px_12px_rgba(55,_65,_81,_0.2)] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(55,65,81,0.27)] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-3.5 px-2 relative isolate gap-2 min-w-[47px] shrink-0">
              <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[-0.5px] right-[1.7px] left-[0px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(55,_65,_81,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
              <div className="self-stretch flex flex-col items-center z-[1] shrink-0">
                <div className="w-[31px] relative leading-[22px] inline-block mq450:text-lg mq450:leading-[18px]">
                  🔒
                </div>
              </div>
              <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#374151] z-[2] shrink-0">
                ???
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] box-border flex flex-col items-start justify-center py-5 px-6 gap-4 max-w-full">
        <div className="self-stretch flex items-center gap-2">
          <Image
            className="h-[18px] w-[18px] relative"
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
        <div className="self-stretch flex flex-col items-start relative isolate max-w-full text-center text-[10px] text-[#4b5563]">
          <div className="self-stretch h-40 relative overflow-hidden shrink-0 max-w-full z-[0] mq975:h-auto mq975:min-h-[160px]">
            <Image
              className="absolute top-[3px] left-[37px] w-[1060px] h-[127px] object-cover"
              width={1060}
              height={127}
              sizes="100vw"
              alt=""
              src="/merged-asset-1@2x.png"
            />
            <div className="absolute top-[134.6px] left-[29px] w-[1073.6px] flex items-center gap-[1.1px] max-w-full mq975:flex-wrap">
              <div className="flex-1 relative inline-block max-w-[25px]">
                1 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[265px] max-w-[271px]">
                5 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[32px]">
                8 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[257px] max-w-[262px]">
                10 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[37px]">
                12 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[261px] max-w-[266px]">
                14 jan
              </div>
              <div className="flex-1 relative text-left inline-block min-w-[141px] max-w-[144px]">
                16 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[29px]">
                18 jan
              </div>
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
          <div className="w-[54px] !!m-[0 important] absolute top-[calc(50%_-_55.5px)] left-[calc(50%_+_101.4px)] flex flex-col items-start opacity-[0] z-[1] text-left text-xs text-[#e2e8f0]">
            <div className="self-stretch flex-1 rounded-lg bg-[#0b0c14] border-[rgba(255,255,255,0.07)] border-solid border-[1px] flex flex-col items-start py-2.5 px-[9px] opacity-[0]">
              <div className="w-[33px] flex flex-col items-start opacity-[0]">
                <div className="self-stretch relative leading-[18px]">
                  12 jan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch h-[89px] shadow-[0px_4px_28px_rgba(0,_0,_0,_0.55),_0px_0px_0px_1px_rgba(251,_146,_60,_0.06)_inset] rounded-xl [background:linear-gradient(135deg,_#130a00,_#1e1000_50%,_#130a00)] border-[rgba(180,80,10,0.4)] border-solid border-[1px] box-border flex items-center py-5 px-7 gap-3.5 text-lg text-[#fff]">
        <Image
          className="h-7 w-7 relative"
          width={28}
          height={28}
          sizes="100vw"
          alt=""
          src="/Icon4.svg"
        />
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-start">
            <b className="relative leading-[27px]">5 victoires consécutives!</b>
          </div>
          <div className="self-stretch flex flex-col items-start pt-0.5 px-0 pb-0 text-xs text-[#92400e]">
            <div className="relative leading-[18px]">Record: 5</div>
          </div>
        </div>
      </div>
      <div className="self-stretch shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] flex flex-col items-start py-5 px-6">
        <div className="self-stretch flex items-center gap-2 mq450:flex-wrap">
          <Image
            className="h-[18px] w-[18px] relative"
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
        <div className="self-stretch flex flex-col items-center pt-4 px-0 pb-0 text-xs text-[#6b7280]">
          <div className="w-full h-14 rounded-lg [background:linear-gradient(160deg,_#08090d,_#060709)] border-[rgba(215,170,40,0.08)] border-solid border-[1px] box-border overflow-x-auto shrink-0 flex items-center py-3 px-4 gap-2.5 max-w-full">
            <div className="h-[23px] rounded bg-[#14532d] flex flex-col items-start py-[3px] px-2.5 box-border text-[11px] text-[#4ade80]">
              <b className="relative tracking-[0.33px] leading-[16.5px]">
                Victoire
              </b>
            </div>
            <div className="h-[23px] rounded bg-[#431407] flex flex-col items-start py-[3px] px-2.5 box-border text-[11px] text-[#fb923c]">
              <div className="relative leading-[16.5px] font-semibold">{`Recherche & Destruction`}</div>
            </div>
            <div className="h-[18px] flex items-center gap-1">
              <Image
                className="h-3.5 w-3.5 relative"
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
            <div className="flex-1 flex items-center gap-1">
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
            <div className="h-[30px] rounded-md bg-[#581c87] border-[#7e22ce] border-solid border-[1px] box-border flex items-center py-[5px] px-3 gap-[5px] text-[#c084fc]">
              <Image
                className="h-[11px] w-[11px] relative"
                width={11}
                height={11}
                sizes="100vw"
                alt=""
                src="/Icon5.svg"
              />
              <div className="relative leading-[18px] font-semibold">
                Voir détails
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch h-[60px] shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border-[rgba(215,170,40,0.11)] border-solid border-[1px] box-border flex flex-col items-start py-5 px-6">
        <div className="self-stretch flex items-center gap-2 mq450:flex-wrap">
          <Image
            className="h-[18px] w-[18px] relative"
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
      </div>
    </div>
  );
};

export default Profile11;
