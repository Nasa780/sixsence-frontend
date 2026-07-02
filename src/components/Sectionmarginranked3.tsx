import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";

const Sectionmarginranked3: NextPage = () => {
  // État réel basé sur ton backend Discord
  const [isConnected, setIsConnected] = useState(false);

  // ⭐ COMPTEURS DYNAMIQUES — À METTRE ICI
  const [queueStatus, setQueueStatus] = useState({
    playersInQueue: 0,
    matchesInProgress: 0,
    playersOnline: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://sixsence-backend.onrender.com/queue/status")
        .then((res) => res.json())
        .then((data) => setQueueStatus(data));
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  // ⭐ FIN COMPTEURS DYNAMIQUES
  
  // Vérification du token Discord + appel /me
  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      })
      .catch(() => setIsConnected(false));
  }, []);

  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xl text-[#e8eaf0] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-16 box-border max-w-[1200px] lg:max-w-full">

        {/* ============================
            SI PAS CONNECTÉ → MODULE ORIGINAL
           ============================ */}
        {!isConnected && (
          <div className="self-stretch bg-[rgba(201,162,39,0.22)] flex flex-col items-start p-px box-border max-w-full">
            <div className="self-stretch h-[119px] bg-[rgba(201,162,39,0.06)] flex items-start py-8 pl-10 pr-[39px] box-border gap-6 max-w-full lg:h-auto lg:flex-wrap">

              {/* Icône */}
              <div className="flex flex-col items-start pt-[4.5px] px-0 pb-0">
                <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center">
                  <Image
                    className="h-5 w-full relative"
                    width={20}
                    height={20}
                    sizes="100vw"
                    alt=""
                    src="/assets/Iconbouclier.svg"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="w-[830.6px] flex flex-col items-start max-w-full">
                <div className="self-stretch flex flex-col items-start">
                  <h3 className="m-0 relative text-[length:inherit] tracking-[0.4px] leading-[30px] font-bold font-[inherit] mq450:text-base mq450:leading-6">
                    Connecte-toi pour jouer
                  </h3>
                </div>
                <div className="w-[830.6px] h-[25px] flex flex-col items-start pt-1 px-0 pb-0 box-border text-sm text-[#6b7d94] font-[Inter]">
                  <div className="relative leading-[21px]">
                    Tu dois être connecté pour accéder au mode classé.
                  </div>
                </div>
              </div>

              {/* Bouton */}
              <div className="flex flex-col items-start pt-[7px] px-0 pb-0">
<button
  onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
  className="cursor-pointer [border:none] py-2.5 px-6 bg-[transparent] [background:linear-gradient(90deg,_#c9a227,_#a07a10)] flex flex-col items-center justify-center"
>
  <b className="relative text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-[#080c14] text-center">
    Se connecter
  </b>
</button>
              </div>

            </div>
          </div>
        )}

{isConnected && (
  <div className="self-stretch flex flex-col items-start pt-5 px-0 pb-0 box-border max-w-full text-[28px] text-[#e8eaf0]">

    {/* FOND BLEU + GRADIENT */}
    <div className="self-stretch bg-[rgba(26,107,220,0.25)] flex flex-col items-start p-px box-border max-w-full">
      <div className="self-stretch [background:linear-gradient(135deg,_#0d1520,_#0a1628)] flex flex-col items-start py-10 px-11 box-border relative isolate max-w-full">

        {/* LIGNE PRINCIPALE */}
        <div className="self-stretch h-[153px] flex items-start flex-wrap content-start gap-[359.5px] max-w-full shrink-0">

          {/* BLOC GAUCHE */}
          <div className="flex flex-col items-start max-w-full">

            {/* LOGO + TITRE */}
            <div className="flex items-center gap-[13.5px]">
              <button className="cursor-pointer border-[rgba(26,107,220,0.3)] border-solid border-[1px] p-0 bg-[rgba(26,107,220,0.15)] h-11 w-11 box-border flex items-center justify-center">
                <Image
                  className="h-[22px] w-full relative"
                  width={22}
                  height={22}
                  sizes="100vw"
                  alt=""
                  src="/assets/IconRD.svg"
                />
              </button>

              <div className="flex flex-col items-start">
                <h1 className="m-0 tracking-[0.28px] leading-[30.8px] font-bold">
                  Rechercher un match
                </h1>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col items-start pt-3 text-sm text-[#6b7d94] font-[Inter]">
              <div className="w-[420px] leading-[22.4px]">
                Tu es prêt à jouer en mode classé. Lance une recherche pour trouver un match compétitif.
              </div>
            </div>

            {/* COMPTEURS DYNAMIQUES */}
            <div className="flex flex-col items-start pt-4 text-sm font-[Inter] text-[#a0b0c8] gap-2">

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#3a8cff]" />
                <span>{queueStatus.playersInQueue} joueur(s) dans la file</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#e8a020]" />
                <span>{queueStatus.matchesInProgress} match(s) en cours</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
                <span>{queueStatus.playersOnline} joueur(s) en ligne</span>
              </div>

            </div>
          </div>

          {/* BOUTONS */}
          <div className="flex flex-col items-start gap-2.5 min-w-[220px]">

            {/* REJOINDRE */}
            <button className="cursor-pointer [border:none] py-[11px] px-[18px] bg-[transparent] self-stretch [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] flex items-center justify-between gap-5">
              <div className="text-sm tracking-[0.14px] leading-[21px] font-medium font-[Inter] text-white">
                Rejoindre / Chercher un match
              </div>
              <Image
                className="h-3.5 w-3.5"
                width={14}
                height={14}
                sizes="100vw"
                alt=""
                src="/assets/Iconfleche3.svg"
              />
            </button>

            {/* QUITTER */}
            <button className="cursor-pointer border-[rgba(220,38,38,0.25)] border-solid border-[1px] py-[11px] px-[18px] bg-[rgba(220,38,38,0.06)] flex items-center justify-between gap-5 hover:bg-[rgba(248,113,113,0.06)] hover:border-[rgba(248,113,113,0.25)]">
              <div className="text-sm tracking-[0.14px] leading-[21px] font-medium font-[Inter] text-[#fecaca]">
                Quitter la file d’attente
              </div>
              <Image
                className="h-3.5 w-3.5"
                width={14}
                height={14}
                sizes="100vw"
                alt=""
                src="/assets/Iconfleche3.svg"
              />
            </button>

          </div>
        </div>

        {/* EFFET RADIAL */}
        <div className="w-[280px] h-[280px] absolute top-0 left-[870px] [background:radial-gradient(141.42%_141.42%_at_100%_0%,_rgba(26,_107,_220,_0.1),_rgba(0,_0,_0,_0)_60%)] z-[1]" />

        {/* BARRE VERTICALE */}
        <div className="w-[3px] h-[233px] absolute top-0 left-0 [background:linear-gradient(180deg,_#1a6bdc,_rgba(0,_0,_0,_0))] z-[2]" />

      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
};

export default Sectionmarginranked3;
