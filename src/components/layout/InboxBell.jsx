import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuBell, LuCheckCheck, LuSettings } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { NavPopover } from "./NavPopover";

const REFRESH_MS = 60_000;

/** « à l'instant », « il y a 5 min », « il y a 3 h », « hier », « il y a 4 j ». */
function ago(date) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "hier" : `il y a ${days} j`;
}

/**
 * Cloche de la barre du haut (connecté) : centre de notifications (GET /push/inbox), pastille des non lues,
 * relu au changement de page et toutes les minutes. onSettings : ouvre les réglages des notifications.
 */
export function InboxBell({ onSettings }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Serveur en veille ou injoignable : on garde la dernière liste, sinon un message plutôt qu'un chargement sans fin.
  const load = useCallback(() => api("/push/inbox").then(setData, () => setData((current) => current ?? { items: [], unread: 0, failed: true })), []);
  useEffect(() => {
    load();
    close();
  }, [router.asPath, load, close]);
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const unread = data?.unread ?? 0;
  const markRead = async (ids) => {
    setData((current) => current && { ...current, items: current.items.map((item) => (!ids || ids.includes(item.id) ? { ...item, read: true } : item)), unread: ids ? Math.max(current.unread - ids.length, 0) : 0 });
    const result = await api("/push/inbox/read", { method: "POST", body: ids ? { ids } : {} }).catch(() => null);
    if (result) setData((current) => current && { ...current, unread: result.unread });
  };
  const openItem = (item) => {
    if (!item.read) void markRead([item.id]);
    close();
    if (!item.url) return;
    // Certaines notifications portent l'adresse complète du site : on garde seulement le chemin.
    try {
      const target = new URL(item.url, window.location.origin);
      const ours = target.origin === window.location.origin || target.hostname.endsWith("sixsence.fr");
      if (ours) router.push(`${target.pathname}${target.search}${target.hash}`);
      else window.location.assign(target.href);
    } catch {
      // Adresse illisible : on reste sur la page.
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) load();
        }}
        aria-expanded={open}
        aria-label={unread ? `Notifications : ${unread} non lue${unread > 1 ? "s" : ""}` : "Notifications"}
        className="relative grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <LuBell aria-hidden className="h-[18px] w-[18px]" />
        {unread ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 font-tech text-[10px] font-bold leading-none text-ink tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      <NavPopover open={open} onClose={close} label="Notifications" className="sm:w-96">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <p className="font-display text-lg font-black uppercase leading-none">Notifications</p>
          <div className="flex items-center gap-1">
            {unread ? (
              <button type="button" onClick={() => markRead(null)} className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/60 transition-colors hover:text-gold">
                <LuCheckCheck aria-hidden className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                close();
                onSettings();
              }}
              aria-label="Réglages des notifications"
              title="Réglages des notifications"
              className="grid h-7 w-7 place-items-center text-white/50 transition-colors hover:text-white"
            >
              <LuSettings aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!data ? (
          <p className="px-4 py-6 text-center text-sm text-white/45">Chargement…</p>
        ) : data.failed ? (
          <p className="px-4 py-8 text-center text-sm text-white/55">Notifications indisponibles pour le moment. Réessaie dans quelques instants.</p>
        ) : data.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/55">
            Aucune notification pour l&apos;instant. Match trouvé, résultats, invitations d&apos;équipe, coupes et nouvelles cartes s&apos;afficheront ici.
          </p>
        ) : (
          <ul className="max-h-[min(28rem,70vh)] divide-y divide-white/[0.06] overflow-y-auto">
            {data.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]", !item.read && "bg-gold/[0.04]")}
                >
                  <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.read ? "bg-transparent" : "bg-gold")} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", item.read ? "text-white/75" : "font-semibold text-white")}>{item.title}</span>
                    <span className="mt-0.5 block text-xs text-white/55">{item.body}</span>
                    <span className="mt-1 block text-[11px] text-white/35">{ago(item.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </NavPopover>
    </div>
  );
}
