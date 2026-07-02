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
  <div className="self-stretch bg-[rgba(26,107,220,0.25)] p-px box-border max-w-full">
    <div className="w-full relative bg-gradient-to-br from-[#0d1520] to-[#0a1628] py-10 px-11 flex gap-10">

      {/* Barre verticale gauche */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#1a6bdc] to-transparent" />

      {/* Colonne gauche : tout le contenu */}
      <div className="flex-1 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.3)] flex items-center justify-center rounded">
            {/* Icône placeholder, remplace par ton vrai SVG si besoin */}
            <div className="w-[22px] h-[22px] border-2 border-[#1a6bdc] rounded-sm" />
          </div>
          <h1 className="text-[28px] font-bold text-[#e8eaf0] tracking-[0.28px]">
            Rechercher un match
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-[#6b7d94] font-[Inter]">
          Tu es prêt à jouer en mode classé. Lance une recherche pour trouver un match compétitif.
        </p>

        {/* Statut de la file */}
        <div>
          <h3 className="uppercase text-[#6b7d94] text-xs font-bold tracking-wide">
            Statut de la file
          </h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#a0b0c8] font-[Inter]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3a8cff]" />
              <span>{queueStatus.playersInQueue} joueur(s) en recherche</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#e8a020]" />
              <span>{queueStatus.matchesInProgress} match(s) en cours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span>{queueStatus.playersOnline} joueur(s) en ligne</span>
            </div>
          </div>
        </div>

        {/* Mode de jeu sélectionné */}
        <div>
          <h3 className="uppercase text-[#6b7d94] text-xs font-bold tracking-wide">
            Mode de jeu sélectionné
          </h3>
          <div className="mt-3 bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] p-4 rounded-md">
            <p className="text-[#e8eaf0] font-semibold">Recherche &amp; Destruction</p>
            <p className="text-[#6b7d94] text-sm">Mode compétitif classé - 5v5</p>
            <p className="text-[#22c55e] text-sm font-semibold">Actif</p>
          </div>
        </div>

        {/* Objets utilisables */}
        <div>
          <h3 className="uppercase text-[#6b7d94] text-xs font-bold tracking-wide">
            Objets utilisables
          </h3>
          <div className="mt-3 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] p-4 rounded-md">
            <p className="text-[#22c55e] font-semibold">Points doublés</p>
            <p className="text-[#6b7d94] text-sm">3 matchs restants - Actif</p>
            <p className="text-[#22c55e] text-sm">+2 XP</p>
          </div>
        </div>

        {/* Récompenses en cas de victoire */}
        <div>
          <h3 className="uppercase text-[#6b7d94] text-xs font-bold tracking-wide">
            Récompenses en cas de victoire (par mode)
          </h3>
          <div className="mt-3 bg-[rgba(26,107,220,0.15)] border border-[rgba(26,107,220,0.25)] p-4 rounded-md">
            <p className="text-[#e8eaf0] font-semibold">S&amp;D</p>
            <p className="text-sm text-[#a0b0c8]">Points +30 pts</p>
            <p className="text-sm text-[#a0b0c8]">Expérience +500 XP</p>
            <p className="text-sm text-[#a0b0c8]">
              Bonus actif : XP x2 = +1000 XP ce match
            </p>
          </div>
        </div>

        {/* Mode classé uniquement */}
        <div className="text-sm text-[#6b7d94] font-[Inter]">
          <p className="font-semibold">Mode classé uniquement</p>
          <p>
            Les points et récompenses ne sont attribués qu’en cas de victoire en mode classé.
          </p>
        </div>

        {/* Engagement requis */}
        <div className="bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.25)] p-4 rounded-md text-[#facc15] text-sm font-[Inter]">
          <p className="font-semibold">Engagement requis.</p>
          <p>
            En lançant un match classé, vous vous engagez à le jouer. Ne pas jouer un match
            après l’avoir lancé peut entraîner des sanctions si cela se reproduit plusieurs fois.
          </p>
        </div>
      </div>

      {/* Colonne droite : boutons */}
      <div className="w-[260px] flex flex-col gap-3 items-stretch">
        <button className="py-3 px-6 bg-gradient-to-r from-[#1a6bdc] to-[#1559b8] text-white font-[Inter] text-sm font-semibold rounded-md">
          Rejoindre / Chercher un match
        </button>
        <button className="py-3 px-6 bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.35)] text-[#fecaca] font-[Inter] text-sm font-semibold rounded-md">
          Quitter la file d’attente
        </button>
      </div>
    </div>
  </div>
)}





      </div>
    </div>
  );
};

export default Sectionmarginranked3;
