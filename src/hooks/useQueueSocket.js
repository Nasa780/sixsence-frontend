import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "../lib/auth";
import { WS_URL } from "../lib/config";

/**
 * Connexion temps réel à la file d'attente (WebSocket du backend).
 * Active uniquement pour un joueur connecté (`enabled`).
 *
 * Renvoie :
 *   status        "off" | "connecting" | "online" | "reconnecting"
 *   size, needed  joueurs en file / requis pour lancer un match
 *   inQueue, joinedAt, activeMatchId
 *   matchFound    { matchId, map, mode } dès qu'un match est prêt
 *
 * Protocole décrit dans le backend : src/ws/hub.ts.
 */
export default function useQueueSocket(enabled) {
  const [state, setState] = useState({
    status: "off",
    size: 0,
    needed: 10,
    inQueue: false,
    joinedAt: null,
    activeMatchId: null,
    matchFound: null,
  });
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, status: "off" }));
      return undefined;
    }

    let closed = false;
    let retry = 0;
    let retryTimer = null;
    let pingTimer = null;

    const connect = async () => {
      const token = await getAccessToken();
      if (closed || !token) return;

      setState((prev) => ({ ...prev, status: retry === 0 ? "connecting" : "reconnecting" }));
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: "auth", token }));
        pingTimer = setInterval(() => socket.send(JSON.stringify({ type: "ping" })), 25_000);
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "ready") {
          retry = 0;
          setState((prev) => ({
            ...prev,
            status: "online",
            size: message.size,
            needed: message.needed,
            inQueue: message.inQueue,
            joinedAt: message.joinedAt,
            activeMatchId: message.activeMatchId,
          }));
        } else if (message.type === "queue:update") {
          setState((prev) => ({ ...prev, size: message.size, needed: message.needed }));
        } else if (message.type === "queue:state") {
          setState((prev) => ({ ...prev, inQueue: message.inQueue, joinedAt: message.joinedAt }));
        } else if (message.type === "match:found") {
          setState((prev) => ({
            ...prev,
            inQueue: false,
            activeMatchId: message.matchId,
            matchFound: { matchId: message.matchId, map: message.map, mode: message.mode },
          }));
        }
      };

      socket.onclose = () => {
        clearInterval(pingTimer);
        if (closed) return;
        // Reconnexion progressive : 1 s, 2 s, 4 s… jusqu'à 30 s
        // (le serveur gratuit de Render peut mettre une minute à se réveiller).
        retry += 1;
        setState((prev) => ({ ...prev, status: "reconnecting" }));
        retryTimer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** (retry - 1)));
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      socketRef.current?.close();
    };
  }, [enabled]);

  /** Mise à jour locale après une action REST (rejoindre / quitter). */
  const patch = (partial) => setState((prev) => ({ ...prev, ...partial }));

  return { ...state, patch };
}
