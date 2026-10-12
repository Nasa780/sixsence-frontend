import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "../lib/auth";
import { WS_URL } from "../lib/config";

/**
 * Connexion temps réel à la file d'attente (WebSocket du backend).
 * Active uniquement pour un joueur connecté (`enabled`).
 *
 * Renvoie :
 *   status        "off" | "connecting" | "online" | "reconnecting"
 *   queues        [{ format, label, teamSize, size, needed }] une entrée par file (2v2, 3v3, 4v4, 5v5)
 *   inQueue, format, groupSize, joinedAt   ma place en file (format de la file, taille de mon groupe)
 *   expiresAt, stillThere   arrêt de la recherche sans confirmation ; « Toujours là ? » en attente
 *   activeMatchId, bannedUntil
 *   party         mon groupe { id, leaderId, format, maxSize, inviteCode, members[] } ou null
 *   readyCheck    { matchId, format, map, mode, deadline, accepted, total, readyUsers } pendant la vérification « Prêt ? »
 *   started       identifiant du match quand tous les joueurs ont accepté
 *   aborted       { reason: "requeued" | "missed" | "released", bannedUntil } quand la vérification échoue
 *   notice        dernier message d'information (recherche annulée par un coéquipier…)
 *
 * Protocole décrit dans le backend : src/ws/hub.ts et src/index.ts.
 */
export default function useQueueSocket(enabled) {
  const [state, setState] = useState({
    status: "off",
    queues: [],
    inQueue: false,
    format: null,
    groupSize: 1,
    joinedAt: null,
    expiresAt: null,
    stillThere: false,
    activeMatchId: null,
    bannedUntil: null,
    party: null,
    readyCheck: null,
    started: null,
    aborted: null,
    notice: null,
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
        switch (message.type) {
          case "ready":
            retry = 0;
            setState((prev) => ({
              ...prev,
              status: "online",
              queues: message.queues ?? [],
              inQueue: message.inQueue,
              format: message.format ?? null,
              groupSize: message.groupSize ?? 1,
              joinedAt: message.joinedAt,
              expiresAt: message.expiresAt ?? null,
              stillThere: Boolean(message.stillThere),
              activeMatchId: message.activeMatchId,
              bannedUntil: message.bannedUntil ?? null,
              party: message.party ?? null,
            }));
            break;
          case "queue:update":
            setState((prev) => ({ ...prev, queues: message.queues ?? prev.queues }));
            break;
          case "queue:state":
            setState((prev) => ({
              ...prev,
              inQueue: message.inQueue,
              format: message.format ?? null,
              groupSize: message.groupSize ?? 1,
              joinedAt: message.joinedAt,
              expiresAt: message.expiresAt ?? null,
              stillThere: Boolean(message.stillThere),
            }));
            break;
          case "party:update":
            setState((prev) => ({ ...prev, party: message.party ?? null }));
            break;
          case "notice":
            setState((prev) => ({ ...prev, notice: { message: message.message, at: Date.now() } }));
            break;
          case "match:found":
            setState((prev) => ({
              ...prev,
              inQueue: false,
              activeMatchId: message.matchId,
              aborted: null,
              started: null,
              notice: null,
              readyCheck: {
                matchId: message.matchId,
                format: message.format,
                map: message.map,
                mode: message.mode,
                deadline: message.deadline,
                accepted: 0,
                total: message.total ?? 2,
                readyUsers: [],
              },
            }));
            break;
          case "match:ready":
            setState((prev) =>
              prev.readyCheck?.matchId === message.matchId
                ? { ...prev, readyCheck: { ...prev.readyCheck, accepted: message.accepted, total: message.total, readyUsers: message.readyUsers || [] } }
                : prev,
            );
            break;
          case "match:start":
            setState((prev) => ({ ...prev, readyCheck: null, started: message.matchId, activeMatchId: message.matchId }));
            break;
          case "match:aborted":
            setState((prev) => ({
              ...prev,
              readyCheck: null,
              activeMatchId: null,
              aborted: { reason: message.reason, bannedUntil: message.bannedUntil ?? null },
              bannedUntil: message.bannedUntil ?? prev.bannedUntil,
            }));
            break;
          default:
            break;
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

  /** Mise à jour locale après une action REST (rejoindre / quitter / groupe). */
  const patch = (partial) => setState((prev) => ({ ...prev, ...partial }));

  return { ...state, patch };
}
