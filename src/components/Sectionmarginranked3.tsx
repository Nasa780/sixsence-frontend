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


        {/* ============================
            SI CONNECTÉ → MODULE ORIGINAL
           ============================ */}

{isConnected && (
  <div className="self-stretch flex flex-col items-start pt-5 px-0 pb-0 box-border max-w-full text-[28px] text-[#e8eaf0]">

    {/* FOND BLEU + GRADIENT */}
    <div className="self-stretch bg-[rgba(26,107,220,0.25)] flex flex-col items-start p-px box-border max-w-full">
      <div className="self-stretch [background:linear-gradient(135deg,_#0d1520,_#0a1628)] flex flex-col items-start py-10 px-11 box-border relative isolate max-w-full">

        {/* HEADER */}
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
          <h1 className="m-0 tracking-[0.28px] leading-[30.8px] font-bold">
            Rechercher un match
          </h1>
        </div>

        {/* DESCRIPTION */}
        <div className="pt-3 text-sm text-[#6b7d94] font-[Inter]">
          Tu es prêt à jouer en mode classé. Lance une recherche pour trouver un match compétitif.
        </div>

        {/* STATUT DE LA FILE */}
        <div className="flex flex-col items-start pt-5 text-sm font-[Inter] text-[#a0b0c8] gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3a8cff]" />
            <span>{queueStatus.playersInQueue} joueur(s) en recherche</span>
          </div>
        </div>

        {/* MODE DE JEU SÉLECTIONNÉ */}
        <div className="mt-6 flex flex-col items-start text-sm font-[Inter] text-[#a0b0c8]">
          <b className="uppercase text-[#6b7d94]">Mode de jeu sélectionné</b>
          <div className="mt-2 bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] py-3 px-4 flex flex-col gap-1">
            <span className="text-[#e8eaf0] font-semibold">Recherche & Destruction</span>
            <span className="text-[#6b7d94]">Mode compétitif classé – 5v5</span>
            <span className="text-[#22c55e] font-semibold">Actif</span>
          </div>
        </div>

        {/* OBJETS UTILISABLES */}
        <div className="mt-6 flex flex-col items-start text-sm font-[Inter] text-[#a0b0c8]">
          <b className="uppercase text-[#6b7d94]">Objets utilisables</b>
          <div className="mt-2 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] py-3 px-4 flex flex-col gap-1">
            <span className="text-[#22c55e] font-semibold">Points doublés</span>
            <span className="text-[#6b7d94]">3 matchs restants – Actif</span>
            <span className="text-[#22c55e]">+2 XP</span>
          </div>
        </div>

        {/* RÉCOMPENSES */}
        <div className="mt-6 flex flex-col items-start text-sm font-[Inter] text-[#a0b0c8]">
          <b className="uppercase text-[#6b7d94]">Récompenses en cas de victoire (par mode)</b>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] py-3 px-4 flex flex-col gap-1">
              <span className="text-[#e8eaf0] font-semibold">Duel</span>
              <span>+10 pts • 💎 +150 • 💰 100–200</span>
            </div>
            <div className="bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] py-3 px-4 flex flex-col gap-1">
              <span className="text-[#e8eaf0] font-semibold">Mêlée</span>
              <span>+10 pts • 💎 +150 • 💰 100–200</span>
            </div>
            <div className="bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] py-3 px-4 flex flex-col gap-1">
              <span className="text-[#e8eaf0] font-semibold">S&D</span>
              <span>+30 pts • 💎 +500 • 💰 650–700</span>
            </div>
          </div>
        </div>

        {/* AVERTISSEMENT */}
        <div className="mt-6 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.25)] py-3 px-4 text-sm text-[#facc15] font-[Inter]">
          ⚠️ En lançant un match classé, vous vous engagez à le jouer. Ne pas jouer un match après l’avoir lancé peut entraîner des sanctions si cela se reproduit plusieurs fois.
        </div>

        {/* BOUTONS */}
        <div className="mt-6 flex flex-col items-start gap-3">
          <button className="cursor-pointer py-2.5 px-6 bg-[transparent] [background:linear-gradient(90deg,#1a6bdc,#1559b8)] flex items-center justify-center gap-2">
            <b className="text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-white text-center">
              Rejoindre / Chercher un match
            </b>
          </button>

          <button className="cursor-pointer py-2.5 px-6 bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.35)] flex items-center justify-center gap-2 hover:bg-[rgba(248,113,113,0.08)] hover:border-[rgba(248,113,113,0.35)]">
            <b className="text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-[#fecaca] text-center">
              Quitter la file d’attente
            </b>
          </button>
        </div>

        {/* MATCHS EN COURS (DÉPLACÉ) */}
        <div className="mt-6 flex items-center gap-2 text-sm font-[Inter] text-[#a0b0c8]">
          <div className="h-2 w-2 rounded-full bg-[#e8a020]" />
          <span>{queueStatus.matchesInProgress} match(s) en cours</span>
        </div>

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
