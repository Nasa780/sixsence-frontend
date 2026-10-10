import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import useQueueSocket from "./useQueueSocket";
import useSession from "./useSession";
import useUser from "./useUser";

/**
 * Toute la logique de la file classée, partagée par les versions ordinateur
 * et mobile de la page Ranked :
 *   - compteurs publics (joueurs en file, matchs en cours, joueurs en ligne),
 *   - état du joueur via WebSocket (en file, match trouvé),
 *   - actions rejoindre / quitter (connexion Discord obligatoire),
 *   - redirection automatique vers la salle de match quand un match est trouvé.
 */
export default function useRankedQueue() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const user = useUser();
  const socket = useQueueSocket(Boolean(session));

  const [status, setStatus] = useState({ playersInQueue: 0, matchesInProgress: 0, playersOnline: 0, needed: 10 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Compteurs publics, visibles même sans connexion.
  useEffect(() => {
    let active = true;
    const load = () =>
      api("/cod/status")
        .then((data) => active && setStatus(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Match trouvé : direction la salle de match.
  useEffect(() => {
    if (socket.matchFound?.matchId) router.push(`/cod/match/${socket.matchFound.matchId}`);
  }, [socket.matchFound, router]);

  const join = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const state = await api("/cod/queue/join", { method: "POST" });
      socket.patch({ inQueue: state.inQueue, joinedAt: state.joinedAt, size: state.size });
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const state = await api("/cod/queue/leave", { method: "POST" });
      socket.patch({ inQueue: state.inQueue, joinedAt: null, size: state.size });
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const profileComplete = Boolean(user?.profile?.activision_id);

  return {
    sessionLoading,
    isConnected: Boolean(session),
    user,
    profileComplete,
    socket,
    // Quand le joueur est connecté, la taille de file du WebSocket est plus fraîche.
    playersInQueue: socket.status === "online" ? socket.size : status.playersInQueue,
    needed: socket.status === "online" ? socket.needed : status.needed,
    matchesInProgress: status.matchesInProgress,
    playersOnline: status.playersOnline,
    busy,
    message,
    join,
    leave,
  };
}
