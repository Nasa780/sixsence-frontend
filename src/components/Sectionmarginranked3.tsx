import Image from "next/image";
import Link from "next/link";
import useRankedQueue from "../hooks/useRankedQueue";
import ActivisionForm from "./site/ActivisionForm";
import LoginGate from "./site/LoginGate";
import { Notice } from "./site/ui";
import { WIN_POINTS, WIN_XP } from "../lib/ranks";

/**
 * Section « Rechercher un match » de la page Ranked.
 * Le design est celui d'origine ; les données viennent du backend (file en
 * temps réel) et la connexion Discord n'est demandée que pour entrer dans la file.
 */
function Dot({ color }: { color: string }) {
  return <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />;
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] flex flex-col items-start p-4 gap-3">
      <div className="self-stretch flex items-center gap-2">
        <div className="h-4 w-1 rounded-full [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
        <b className="tracking-[1.04px] leading-[19.5px] uppercase">{title}</b>
      </div>
      {children}
    </div>
  );
}

function elapsed(joinedAt: string | null) {
  if (!joinedAt) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000));
  return `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`;
}

const Sectionmarginranked3 = () => {
  const q = useRankedQueue();
  const { socket } = q;

  return (
    <div className="w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xl text-[#e8eaf0] font-[Rajdhani]">
      <div className="w-full max-w-[1200px] flex flex-col items-start pt-0 px-6 pb-16 box-border max-sm:px-0">
        {/* Visiteur : invitation à se connecter (la page reste visible). */}
        {!q.sessionLoading && !q.isConnected && <LoginGate next="/cod/ranked" />}

        {q.isConnected && (
          <div className="w-full flex flex-col items-start justify-center py-6 pl-8 pr-6 box-border gap-6 text-[28px] text-[#e8f0fa] max-sm:px-0">
            {/* En-tête */}
            <div className="self-stretch flex items-start flex-wrap gap-4">
              <div className="flex-1 flex items-start gap-4 min-w-[260px]">
                <Image className="h-11 w-11 rounded-[10px]" width={44} height={44} alt="" src="/assets/IconRD4.svg" />
                <div className="flex-1 flex flex-col items-start gap-1">
                  <h1 className="m-0 text-[length:inherit] tracking-[0.28px] leading-[30.8px] font-bold max-sm:text-[22px] max-sm:leading-[25px]">
                    Rechercher un match
                  </h1>
                  <div className="text-sm text-[#6b7d94] font-[Inter] leading-[21px]">
                    Tu es prêt à jouer en mode classé. Lance une recherche pour trouver un match compétitif.
                  </div>
                </div>
              </div>
              <div className="border-[rgba(26,107,220,0.2)] border-solid border-[1px] py-1.5 px-3 bg-[rgba(26,107,220,0.1)] h-[34px] rounded-full box-border flex items-center gap-2">
                <Dot color="#22c55e" />
                <div className="text-[13px] leading-[19.5px] font-medium font-[Inter] text-[#a0b0c8]">
                  {q.playersOnline} joueur(s) en ligne
                </div>
              </div>
            </div>

            <main className="self-stretch flex items-start flex-wrap content-start gap-6">
              {/* Colonne gauche */}
              <section className="flex-1 flex flex-col items-start gap-6 min-w-[300px] text-[13px] text-[#5b7fa8]">
                <Box title="Statut de la file">
                  <div className="self-stretch flex flex-col gap-2 text-sm text-[#a0b0c8] font-[Inter]">
                    <div className="flex items-center gap-2.5">
                      <Dot color="#3b82f6" />
                      {q.playersInQueue} / {q.needed} joueur(s) en recherche
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Dot color="#f97316" />
                      {q.matchesInProgress} match(s) en cours
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Dot color="#22c55e" />
                      {q.playersOnline} joueur(s) en ligne
                    </div>
                  </div>
                </Box>

                <Box title="Mode de jeu sélectionné">
                  <div className="w-full rounded-[10px] bg-[rgba(26,107,220,0.08)] border-[rgba(26,107,220,0.2)] border-solid border-[1px] box-border flex items-center py-3 px-4 gap-3 text-[15px] text-[#c5d8f0]">
                    <Image className="h-9 w-9 rounded shrink-0" width={36} height={36} alt="" src="/assets/IconRD6.svg" />
                    <div className="flex flex-col gap-0.5">
                      <b className="tracking-[0.6px] leading-[22.5px]">Recherche & Destruction</b>
                      <div className="text-xs text-[#5b7fa8] font-[Inter]">Mode compétitif classé · 5v5 · carte et équipes tirées au sort</div>
                    </div>
                    <div className="flex-1 flex justify-end">
                      <div className="h-[19px] rounded-full bg-[rgba(26,107,220,0.2)] flex items-center px-2 text-xs text-[#4a90d9] font-[Inter] tracking-[0.6px] font-semibold">
                        ACTIF
                      </div>
                    </div>
                  </div>
                </Box>

                {!q.profileComplete && q.user && (
                  <Box title="Ton identifiant Activision">
                    <p className="m-0 text-sm text-[#a0b0c8] font-[Inter] leading-[21px]">
                      Obligatoire pour entrer dans la file : l'hôte du match s'en sert pour t'inviter dans la partie privée.
                    </p>
                    <div className="self-stretch">
                      <ActivisionForm user={q.user} />
                    </div>
                  </Box>
                )}

                <div className="self-stretch rounded-[10px] bg-[rgba(234,179,8,0.07)] border-[rgba(234,179,8,0.22)] border-solid border-[1px] box-border flex items-start py-3 px-4 gap-3 text-[#eab308] font-[Inter]">
                  <Image className="h-[18px] w-4 shrink-0" width={16} height={18} alt="" src="/assets/Iconwarning.svg" />
                  <div className="leading-[20.2px]">
                    <span className="font-semibold">⚠️ Engagement requis.</span>
                    <span className="text-[#ca8a04]">
                      {" "}
                      En lançant un match classé, vous vous engagez à le jouer. Ne pas jouer un match après l'avoir lancé peut
                      entraîner des sanctions si cela se reproduit plusieurs fois.
                    </span>
                  </div>
                </div>
              </section>

              {/* Colonne droite */}
              <section className="flex-1 flex flex-col items-start gap-4 min-w-[260px] max-w-[340px] max-sm:max-w-full text-[13px] text-[#5b7fa8]">
                {socket.activeMatchId ? (
                  <Link
                    href={`/cod/match/${socket.activeMatchId}`}
                    className="no-underline py-3.5 px-5 self-stretch rounded-[10px] [background:linear-gradient(90deg,_#ffa040,_#e07a10)] flex items-center justify-between"
                  >
                    <b className="text-[17px] tracking-[0.68px] leading-[25.5px] text-[#080c14]">Rejoindre mon match en cours</b>
                    <Image className="h-[18px] w-[18px]" width={18} height={18} alt="" src="/assets/Iconfleche4.svg" />
                  </Link>
                ) : (
                  <button
                    className="cursor-pointer [border:none] py-3.5 px-5 self-stretch rounded-[10px] [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={q.join}
                    disabled={q.busy || socket.inQueue || !q.profileComplete || socket.status !== "online"}
                  >
                    <b className="text-[17px] tracking-[0.68px] leading-[25.5px] text-white text-left">
                      {q.busy
                        ? "Chargement…"
                        : socket.inQueue
                          ? "Recherche en cours…"
                          : socket.status !== "online"
                            ? "Connexion au serveur…"
                            : "Entrer dans la file"}
                    </b>
                    <Image className="h-[18px] w-[18px]" width={18} height={18} alt="" src="/assets/Iconfleche4.svg" />
                  </button>
                )}

                {socket.inQueue && (
                  <div className="text-xs text-[#a0b0c8] font-[Inter]">
                    Tu es dans la file
                    <span className="ml-1 text-[#4a90d9]">· {elapsed(socket.joinedAt)}</span>
                  </div>
                )}
                {socket.status === "reconnecting" && (
                  <Notice>Le serveur se réveille (jusqu'à une minute la première fois)…</Notice>
                )}
                {q.message && <Notice tone={q.message.tone}>{q.message.text}</Notice>}

                <button
                  className="cursor-pointer border-[rgba(220,38,38,0.25)] border-solid border-[1px] py-3 px-5 bg-[rgba(220,38,38,0.06)] self-stretch h-[49px] rounded-[10px] box-border flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={q.leave}
                  disabled={q.busy || !socket.inQueue}
                >
                  <b className="text-[15px] tracking-[0.6px] leading-[22.5px] text-[#fecaca] text-left">
                    {socket.inQueue ? "Quitter la file d'attente" : "Pas dans la file"}
                  </b>
                  <Image className="h-4 w-4" width={16} height={16} alt="" src="/assets/Iconfleche5.svg" />
                </button>

                <div className="self-stretch h-px bg-[rgba(26,107,220,0.12)] my-1" />

                <Box title="Récompenses en cas de victoire">
                  <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.7)] border-[rgba(26,107,220,0.18)] border-solid border-[1px] flex flex-col p-3 text-[#c5d8f0]">
                    <div className="flex items-center gap-2">
                      <Image className="h-7 w-7 rounded" width={28} height={28} alt="" src="/assets/IconRD5.svg" />
                      <b className="tracking-[0.65px] leading-[19.5px]">S&D</b>
                    </div>
                    <div className="flex pt-2 gap-4 text-[11px] text-[#5b7fa8] font-[Inter]">
                      <div className="flex flex-col gap-0.5">
                        <div className="tracking-[0.66px] uppercase">Points</div>
                        <div className="flex items-center gap-1 text-base text-[#f59e0b]">
                          <Image className="h-[11px] w-[11px]" width={11} height={11} alt="" src="/assets/Iconxp.svg" />
                          <b>+{WIN_POINTS} pts</b>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="tracking-[0.66px] uppercase">Expérience</div>
                        <div className="flex items-center gap-1 text-base text-[#818cf8]">
                          <Image className="h-[11px] w-[11px]" width={11} height={11} alt="" src="/assets/Iconstar.svg" />
                          <b>+{WIN_XP} XP</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>

                <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] box-border flex flex-col py-3 px-4 gap-1 text-xs text-[#4a90d9]">
                  <div className="flex items-center gap-2">
                    <Image className="h-[13px] w-[13px]" width={13} height={13} alt="" src="/assets/Iconranked2.svg" />
                    <b className="tracking-[0.96px] leading-[18px] uppercase">Mode classé uniquement</b>
                  </div>
                  <div className="text-[#5b7fa8] font-[Inter] leading-[18px]">
                    Les points et l'expérience ne sont attribués qu'en cas de victoire en mode classé.
                  </div>
                </div>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sectionmarginranked3;
