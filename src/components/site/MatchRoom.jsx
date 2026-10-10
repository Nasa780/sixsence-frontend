import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { Avatar, Loading, Notice, PlatformBadge, RankBadge, formatDate } from "./ui";

/**
 * Salle de match COD : design repris de la page « Match en cours » d'origine
 * (bandeau de la carte, deux équipes, chat, vote du vainqueur).
 *
 * Tout le monde peut regarder ; seuls les joueurs du match peuvent écrire dans
 * le chat et déclarer / confirmer le résultat. La page se met à jour en direct.
 */

const STATUS_LABEL = {
  in_progress: { text: "En direct", color: "#4caf50" },
  awaiting_confirmation: { text: "Résultat à confirmer", color: "#ffa040" },
  disputed: { text: "Contesté", color: "#ef4444" },
  completed: { text: "Terminé", color: "#94a3b8" },
  cancelled: { text: "Annulé", color: "#64748b" },
};

const panel = "bg-[#111d2a] border border-solid border-[rgba(255,160,64,0.18)] flex flex-col";
const panelHead =
  "h-[34px] bg-[rgba(255,160,64,0.07)] border-b border-solid border-[rgba(255,160,64,0.2)] flex items-center px-3.5 gap-2 text-[11px] text-[#ffa040] font-[Rajdhani]";
const voteButton =
  "cursor-pointer border border-solid border-[rgba(255,160,64,0.3)] py-2.5 px-7 max-sm:px-4 bg-[rgba(255,160,64,0.08)] h-10 flex items-center gap-[7px] hover:bg-[rgba(204,110,13,0.15)] disabled:opacity-50 disabled:cursor-not-allowed";

function PlayerRow({ player, align = "left", isHost, change }) {
  const right = align === "right";
  return (
    <div
      className={`bg-[rgba(255,255,255,0.02)] border-b border-solid border-[rgba(255,160,64,0.07)] flex items-center py-[9px] px-3.5 gap-2.5 ${
        right ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar src={player.avatar_url} name={player.username} size={32} />
      <div className={`flex-1 min-w-0 flex flex-col ${right ? "items-end" : "items-start"}`}>
        <Link
          href={`/cod/profile/${player.id}`}
          className="text-[13px] text-[#f5f5f5] font-semibold tracking-[0.26px] leading-[15.6px] font-[Rajdhani] no-underline hover:text-[#ffa040] truncate max-w-full"
        >
          {player.username}
          {isHost && <span className="ml-1.5 text-[9px] text-[#ffa040] uppercase tracking-[1px]">Hôte</span>}
        </Link>
        <div className="text-[10px] text-[#6b7f94] tracking-[0.4px] leading-[15px] font-[Inter] truncate max-w-full">
          {player.activision_id || "ID Activision non renseigné"}
        </div>
      </div>
      <div className={`flex items-center gap-[5px] ${right ? "flex-row-reverse" : ""}`}>
        {typeof change === "number" && (
          <b className="font-[Rajdhani] text-[13px]" style={{ color: change >= 0 ? "#4ade80" : "#f87171" }}>
            {change >= 0 ? `+${change}` : change}
          </b>
        )}
        <PlatformBadge platform={player.platform} />
        <RankBadge points={player.points} />
      </div>
    </div>
  );
}

function TeamPanel({ title, ids, players, align, hostId, changes, highlight }) {
  const list = ids.map((id) => players.find((player) => player.id === id)).filter(Boolean);
  return (
    <section
      className={`${panel} flex-1 min-w-[260px] ${highlight ? "border-[rgba(74,222,128,0.5)]" : ""}`}
    >
      <div className={`${panelHead} ${align === "right" ? "justify-end" : ""}`}>
        <Image className="h-[11px] w-[11px]" width={11} height={11} alt="" src="/assets/Iconshield.svg" />
        <b className="tracking-[1.98px] leading-[16.5px] uppercase">{title}</b>
        {highlight && <span className="text-[#4ade80] tracking-[1px] uppercase">· Vainqueur</span>}
      </div>
      {list.map((player) => (
        <PlayerRow
          key={player.id}
          player={player}
          align={align}
          isHost={player.id === hostId}
          change={changes?.[player.id]}
        />
      ))}
      <div className="py-2.5 px-[13px] text-[10px] text-[#3d5166] font-['Barlow_Condensed'] tracking-[0.8px] uppercase">
        {list.length} joueurs
      </div>
    </section>
  );
}

function Chat({ matchId, messages, canWrite }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const send = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      await api(`/cod/matches/${matchId}/messages`, { method: "POST", body: { body } });
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`${panel} border-[rgba(255,160,64,0.4)] flex-1 min-w-[260px] max-w-[340px] max-md:max-w-full`}>
      <div className={panelHead}>
        <b className="tracking-[1.98px] leading-[16.5px] uppercase">Chat</b>
      </div>
      <div ref={listRef} className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto py-1">
        <div className="text-center py-2 px-3.5 text-[10px] text-[#6b7f94] font-[Inter] italic">
          Le match a démarré — bonne chance à tous !
        </div>
        {messages.map((message) => (
          <div key={message.id} className="py-[5px] px-3.5">
            <div className="flex items-center gap-1.5">
              <b className="text-[11px] text-[#ffa040] tracking-[0.66px] font-[Rajdhani]">{message.username}</b>
              <span className="text-[9px] text-[#3d5166] font-[Inter]">
                {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="text-xs text-[#c8c8c8] font-[Inter] leading-[16.8px] break-words">{message.body}</div>
          </div>
        ))}
      </div>
      {canWrite ? (
        <form
          onSubmit={send}
          className="bg-[rgba(10,26,47,0.5)] border-t border-solid border-[rgba(255,160,64,0.2)] flex items-center py-2.5 px-3 gap-2"
        >
          <input
            className="flex-1 h-[30px] px-2.5 bg-[rgba(255,255,255,0.04)] border border-solid border-[rgba(255,160,64,0.15)] outline-none font-[Inter] text-xs text-[#f5f5f5]"
            placeholder="Votre message..."
            value={text}
            maxLength={300}
            onChange={(event) => setText(event.target.value)}
          />
          <button type="submit" disabled={sending} className="cursor-pointer [border:none] p-0 bg-transparent">
            <Image className="h-[26px] w-[26px]" width={26} height={26} alt="Envoyer" src="/assets/Iconbuttom.svg" />
          </button>
        </form>
      ) : (
        <div className="border-t border-solid border-[rgba(255,160,64,0.2)] py-2.5 px-3 text-[11px] text-[#6b7f94] font-[Inter]">
          Seuls les joueurs du match peuvent écrire.
        </div>
      )}
      {error && <div className="px-3 pb-2 text-[11px] text-[#fecaca] font-[Inter]">{error}</div>}
    </section>
  );
}

export default function MatchRoom({ matchId }) {
  const { userId } = useSession();
  const user = useUser();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api(`/cod/matches/${matchId}`));
    } catch (error) {
      if (error.status === 404 || error.status === 400) setNotFound(true);
      else setNotice({ tone: "error", text: error.message });
    }
  }, [matchId]);

  useEffect(() => {
    load();
    // Mises à jour en direct : statut du match et nouveaux messages.
    const channel = supabase
      .channel(`match-${matchId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cod_matches", filter: `id=eq.${matchId}` }, load)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cod_match_messages", filter: `match_id=eq.${matchId}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, load]);

  const act = async (path, body) => {
    setBusy(true);
    setNotice(null);
    try {
      await api(`/cod/matches/${matchId}/${path}`, { method: "POST", body });
      await load();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div className="py-20 text-center font-[Inter] text-[#a0b0c8]">
        Match introuvable.{" "}
        <Link href="/cod/ranked" className="text-[#4a90d9]">
          Retour au classé
        </Link>
      </div>
    );
  }
  if (!data) return <Loading label="Chargement du match…" />;

  const { match, players, messages } = data;
  const myTeam = match.team_a.includes(userId) ? "A" : match.team_b.includes(userId) ? "B" : null;
  const reporterTeam = match.reported_by ? (match.team_a.includes(match.reported_by) ? "A" : "B") : null;
  const status = STATUS_LABEL[match.status] || STATUS_LABEL.in_progress;
  const teamName = (team) => (team === "A" ? "Équipe 1" : "Équipe 2");
  const isAdmin = user?.role === "admin";
  const finished = match.status === "completed";

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Bandeau de la carte */}
      <section className="w-full h-[202px] max-sm:h-[160px] relative bg-[#111d2a] border border-solid border-[rgba(255,160,64,0.4)] overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('/images/call-of-duty-black-3840x2160-22670.jpg')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,26,47,0.9),rgba(10,26,47,0.3)_50%,rgba(10,26,47,0.9))]" />
        <div className="relative flex flex-col items-center gap-3 px-4 text-center">
          <h1 className="m-0 text-[44px] max-sm:text-[30px] tracking-[7.92px] max-sm:tracking-[4px] leading-[44px] uppercase font-bold text-[#f5f5f5] font-[Rajdhani]">
            {match.map}
          </h1>
          <div className="flex items-center flex-wrap justify-center gap-3 text-sm font-['Barlow_Condensed']">
            <div className="h-[31px] bg-[rgba(255,160,64,0.15)] border border-solid border-[rgba(255,160,64,0.5)] px-3.5 flex items-center gap-1 text-[#ffa040]">
              <Image src="/assets/Icon5v5.svg" width={12} height={12} alt="" />
              <b className="tracking-[1.96px] uppercase">
                {match.team_size} v {match.team_size}
              </b>
            </div>
            <div className="h-[30px] bg-[rgba(15,42,74,0.7)] border border-solid border-[rgba(200,200,200,0.2)] px-3.5 flex items-center text-[#c8c8c8] tracking-[1.3px] font-semibold">
              {match.mode}
            </div>
            <div className="h-[30px] bg-[rgba(15,42,74,0.7)] border border-solid border-[rgba(200,200,200,0.2)] px-3.5 flex items-center gap-1 text-[#c8c8c8]">
              <Image src="/assets/Iconheure.svg" width={11} height={11} alt="" />
              <span className="tracking-[1.3px] font-semibold">{formatDate(match.created_at)}</span>
            </div>
            <div
              className="h-[30px] px-3 flex items-center border border-solid uppercase tracking-[1.32px] font-semibold text-[11px]"
              style={{ color: status.color, borderColor: `${status.color}55`, background: `${status.color}1a` }}
            >
              {status.text}
            </div>
          </div>
        </div>
      </section>

      {myTeam && match.status === "in_progress" && (
        <Notice>
          L'hôte (premier joueur de l'Équipe 1) crée une partie privée {match.mode} sur {match.map} et invite les joueurs
          grâce à leur identifiant Activision.
        </Notice>
      )}

      {/* Équipes + chat */}
      <div className="flex items-start flex-wrap gap-4">
        <TeamPanel
          title="Équipe 1"
          ids={match.team_a}
          players={players}
          align="left"
          hostId={match.team_a[0]}
          changes={finished ? match.points_changes : null}
          highlight={match.winner === "A"}
        />
        <Chat matchId={match.id} messages={messages} canWrite={Boolean(myTeam)} />
        <TeamPanel
          title="Équipe 2"
          ids={match.team_b}
          players={players}
          align="right"
          changes={finished ? match.points_changes : null}
          highlight={match.winner === "B"}
        />
      </div>

      {/* Vote / résultat */}
      <section className={`${panel} border-[rgba(255,160,64,0.4)]`}>
        <div className={panelHead}>
          <Image className="h-[11px] w-[11px]" width={11} height={11} alt="" src="/assets/Iconwin.svg" />
          <b className="tracking-[1.98px] leading-[16.5px] uppercase">
            {finished ? "Résultat" : "Vote du Vainqueur"}
          </b>
        </div>
        <div className="flex items-center flex-wrap py-4 px-4 gap-4 text-xs text-[#6b7f94] font-[Inter]">
          {match.status === "in_progress" && (
            <>
              <div className="flex-1 min-w-[200px]">
                {myTeam
                  ? "Quelle équipe a remporté ce match ? L'équipe adverse devra confirmer."
                  : "Le match est en cours. Les joueurs déclareront le vainqueur à la fin de la partie."}
              </div>
              {myTeam && (
                <div className="flex flex-wrap gap-3">
                  {["A", "B"].map((team) => (
                    <button key={team} className={voteButton} disabled={busy} onClick={() => act("report", { winner: team })}>
                      <Image className="h-3 w-3" width={12} height={12} alt="" src="/assets/Iconwin2.svg" />
                      <b className="text-xs tracking-[1.68px] uppercase font-[Rajdhani] text-[#ffa040]">
                        Victoire {teamName(team)}
                      </b>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {match.status === "awaiting_confirmation" && (
            <>
              <div className="flex-1 min-w-[200px]">
                Résultat déclaré : <b className="text-[#ffa040]">victoire {teamName(match.reported_winner)}</b>.{" "}
                {myTeam && myTeam !== reporterTeam
                  ? "Confirmes-tu ce résultat ?"
                  : "En attente de la confirmation de l'équipe adverse (validé automatiquement après 15 minutes)."}
              </div>
              {myTeam && myTeam !== reporterTeam && (
                <div className="flex flex-wrap gap-3">
                  <button className={voteButton} disabled={busy} onClick={() => act("confirm", { accept: true })}>
                    <b className="text-xs tracking-[1.68px] uppercase font-[Rajdhani] text-[#4ade80]">Confirmer</b>
                  </button>
                  <button className={voteButton} disabled={busy} onClick={() => act("confirm", { accept: false })}>
                    <b className="text-xs tracking-[1.68px] uppercase font-[Rajdhani] text-[#f87171]">Contester</b>
                  </button>
                </div>
              )}
            </>
          )}

          {match.status === "disputed" && (
            <>
              <div className="flex-1 min-w-[200px]">
                Résultat contesté : un administrateur va trancher. Tu peux relancer une recherche en attendant.
              </div>
              {isAdmin && (
                <div className="flex flex-wrap gap-3">
                  {["A", "B"].map((team) => (
                    <button key={team} className={voteButton} disabled={busy} onClick={() => act("resolve", { winner: team })}>
                      <b className="text-xs tracking-[1.68px] uppercase font-[Rajdhani] text-[#ffa040]">
                        Victoire {teamName(team)}
                      </b>
                    </button>
                  ))}
                  <button className={voteButton} disabled={busy} onClick={() => act("resolve", { winner: null })}>
                    <b className="text-xs tracking-[1.68px] uppercase font-[Rajdhani] text-[#94a3b8]">Annuler le match</b>
                  </button>
                </div>
              )}
            </>
          )}

          {finished && (
            <div className="flex-1 text-sm text-[#c8c8c8]">
              Victoire de l'<b className="text-[#4ade80]">{teamName(match.winner)}</b>. Les points de chaque joueur sont affichés
              ci-dessus.
            </div>
          )}

          {match.status === "cancelled" && <div className="flex-1 text-sm">Ce match a été annulé : aucun point n'a été attribué.</div>}
        </div>
        {notice && (
          <div className="px-4 pb-4">
            <Notice tone={notice.tone}>{notice.text}</Notice>
          </div>
        )}
      </section>

      {(finished || match.status === "cancelled" || match.status === "disputed") && myTeam && (
        <Link
          href="/cod/ranked"
          className="self-start no-underline py-3 px-5 rounded-[10px] [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] text-white font-[Rajdhani] font-bold"
        >
          Relancer une recherche
        </Link>
      )}
    </div>
  );
}
