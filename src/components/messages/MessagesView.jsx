import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { LuArrowLeft, LuBan, LuFlag, LuLoaderCircle, LuMessageSquare, LuSearch, LuSendHorizontal, LuSettings, LuX } from "react-icons/lu";
import { refreshMessagesUnread } from "../../hooks/useMessagesUnread";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { REPORT_REASONS } from "../../lib/moderation";
import { supabase } from "../../lib/supabase";
import { Avatar } from "../ui/Avatar";
import { ReasonDialog } from "../ui/ReasonDialog";

const MAX = 1000;

/** « 14:32 » aujourd'hui, « hier 14:32 », sinon « 12 nov. 14:32 ». */
function when(date) {
  const value = new Date(date);
  const time = value.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (value.toDateString() === today.toDateString()) return time;
  if (value.toDateString() === yesterday.toDateString()) return `hier ${time}`;
  return `${value.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ${time}`;
}

/** Texte d'un message avec ses liens cliquables (ouverts dans un nouvel onglet). */
function Linkified({ text }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return parts.map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer nofollow" className="break-all underline underline-offset-2 hover:opacity-80">
        {part}
      </a>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** Recherche d'un joueur à qui écrire (GET /messages/search). */
function NewConversation() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) return undefined;
    const timer = setTimeout(() => {
      setSearching(true);
      api(`/messages/search?q=${encodeURIComponent(text)}`)
        .then((result) => setPlayers(result.players ?? []), () => setPlayers([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const shown = query.trim().length >= 2 ? players : [];
  return (
    <div className="relative">
      <label htmlFor="recherche-joueur" className="sr-only">
        Écrire à un joueur
      </label>
      <LuSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input
        id="recherche-joueur"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Écrire à un joueur (pseudo)…"
        autoComplete="off"
        className="w-full border border-white/10 bg-ink py-2.5 pl-9 pr-3 text-sm placeholder:text-white/35 focus:border-gold/60 focus:outline-none"
      />
      {query.trim().length >= 2 ? (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto border border-white/10 bg-ink-800 shadow-xl shadow-black/50">
          {searching && shown.length === 0 ? <li className="px-3 py-2.5 text-sm text-white/45">Recherche…</li> : null}
          {!searching && shown.length === 0 ? <li className="px-3 py-2.5 text-sm text-white/45">Aucun joueur trouvé.</li> : null}
          {shown.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push({ pathname: router.pathname, query: { avec: player.id } }, undefined, { shallow: true });
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06]"
              >
                <Avatar full src={player.avatarUrl} name={player.username} size={28} />
                <span className="truncate font-semibold">{player.username}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Liste des conversations, la plus récente d'abord. */
function ConversationList({ items, selected }) {
  const { pathname } = useRouter();
  if (!items) return <p className="px-4 py-6 text-sm text-white/45">Chargement…</p>;
  if (items.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-white/55">Aucune conversation. Cherche un joueur ci-dessus, ou clique sur « Envoyer un message » sur son profil.</p>;
  }
  return (
    <ul className="divide-y divide-white/[0.06]">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={{ pathname, query: { avec: item.with.id } }}
            shallow
            className={cn("flex items-center gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-white/[0.05]", item.with.id === selected ? "border-gold bg-white/[0.05]" : "border-transparent")}
          >
            <Avatar full src={item.with.avatarUrl} name={item.with.username} size={40} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={cn("truncate text-sm", item.unread ? "font-bold text-white" : "font-semibold text-white/85")}>{item.with.username}</span>
                <span className="shrink-0 text-[11px] text-white/35">{when(item.lastMessageAt)}</span>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className={cn("truncate text-xs", item.unread ? "text-white/80" : "text-white/45")}>
                  {item.lastFromMe ? "Toi : " : ""}
                  {item.lastBody}
                </span>
                {item.unread ? (
                  <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-gold px-1 font-tech text-[10px] font-bold text-ink tabular-nums">{item.unread > 9 ? "9+" : item.unread}</span>
                ) : null}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Motifs proposés pour signaler une conversation (mêmes clés que le backend). */
const DM_REPORT_REASONS = {
  toxicity: REPORT_REASONS.toxicity,
  spam: "Spam ou arnaque",
  name: REPORT_REASONS.name,
  other: REPORT_REASONS.other,
};

/** Conversation ouverte : messages, plus anciens à la demande, zone d'écriture, bloquer et signaler. */
function Thread({ me, otherId, thread, onLoadOlder, onSent, onChange }) {
  const { pathname } = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);

  // Bloquer / débloquer : la réponse du serveur donne le nouvel état (canWrite, blockedByMe).
  const toggleBlock = async () => {
    setBusy(true);
    setError(null);
    try {
      const state = await api(`/messages/${otherId}/block`, { method: thread.blockedByMe ? "DELETE" : "POST" });
      onChange(state);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };
  const bottom = useRef(null);
  const count = thread?.messages.length ?? 0;
  const lastId = thread?.messages[count - 1]?.id;

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [lastId, otherId]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await api(`/messages/${otherId}`, { method: "POST", body: { body } });
      setDraft("");
      onSent(result.message);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setSending(false);
    }
  };

  if (!thread) {
    return (
      <div className="grid flex-1 place-items-center p-8">
        <LuLoaderCircle aria-hidden className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }
  const lastMine = [...thread.messages].reverse().find((item) => item.senderId === me);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Link href={pathname} shallow aria-label="Retour aux conversations" className="grid h-8 w-8 place-items-center text-white/60 hover:text-white lg:hidden">
          <LuArrowLeft aria-hidden className="h-5 w-5" />
        </Link>
        <Link href={`/cod/profile/${thread.with.id}`} className="group flex min-w-0 items-center gap-3">
          <Avatar full src={thread.with.avatarUrl} name={thread.with.username} size={36} />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-black uppercase leading-none group-hover:text-gold">{thread.with.username}</span>
            <span className="text-[11px] text-white/45">Voir le profil</span>
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {thread.messages.length > 0 ? (
            <button
              type="button"
              onClick={() => setReporting(true)}
              title="Signaler la conversation"
              className="flex h-8 items-center gap-1.5 px-2 text-xs text-white/50 transition-colors hover:text-loss"
            >
              <LuFlag aria-hidden className="h-4 w-4" />
              <span className="hidden sm:inline">Signaler</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={toggleBlock}
            disabled={busy}
            title={thread.blockedByMe ? "Débloquer ce joueur" : "Bloquer ce joueur"}
            className={cn("flex h-8 items-center gap-1.5 px-2 text-xs transition-colors disabled:opacity-50", thread.blockedByMe ? "text-gold hover:text-gold-light" : "text-white/50 hover:text-loss")}
          >
            <LuBan aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">{thread.blockedByMe ? "Débloquer" : "Bloquer"}</span>
          </button>
        </div>
      </div>
      <ReasonDialog
        open={reporting}
        onClose={() => setReporting(false)}
        title={`Signaler la conversation avec ${thread.with.username}`}
        intro="L'équipe SixSence verra les 50 derniers messages de cette conversation, et seulement ceux-là. Tu peux aussi bloquer ce joueur pour ne plus recevoir ses messages."
        reasons={DM_REPORT_REASONS}
        submitLabel="Envoyer le signalement"
        onSubmit={({ reason, details }) => api(`/messages/${otherId}/report`, { method: "POST", body: { reason, details } })}
      />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.hasMore ? (
          <div className="text-center">
            <button type="button" onClick={onLoadOlder} className="text-xs text-white/50 underline underline-offset-4 hover:text-white">
              Messages plus anciens
            </button>
          </div>
        ) : null}
        {thread.messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/50">Pas encore de message. Écris le premier : {thread.with.username} sera prévenu sur le site, en notification et sur Discord.</p>
        ) : null}
        {thread.messages.map((item) => {
          const mine = item.senderId === me;
          return (
            <div key={item.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2 text-sm leading-relaxed sm:max-w-[70%]",
                  mine ? "clip-corner bg-gold text-ink [--cut:8px]" : "border border-white/10 bg-white/[0.05] text-white/90",
                )}
              >
                <Linkified text={item.body} />
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-white/35">
                {when(item.createdAt)}
                {mine && item.id === lastMine?.id && item.read ? " · Vu" : ""}
              </span>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {thread.blockedByMe ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 text-sm text-white/65">
          <span>Tu as bloqué {thread.with.username} : vous ne pouvez plus vous écrire.</span>
          <button type="button" onClick={toggleBlock} disabled={busy} className="text-gold underline underline-offset-4 hover:text-gold-light disabled:opacity-50">
            Débloquer
          </button>
        </div>
      ) : thread.canWrite === false ? (
        <p className="border-t border-white/10 px-4 py-4 text-sm text-white/55">{thread.with.username} ne reçoit pas de messages pour le moment.</p>
      ) : (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="border-t border-white/10 p-3"
      >
        {error ? <p className="mb-2 text-xs text-loss">{error}</p> : null}
        <div className="flex items-end gap-2">
          <label htmlFor="message-a-envoyer" className="sr-only">
            Ton message
          </label>
          <textarea
            id="message-a-envoyer"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={Math.min(5, Math.max(1, draft.split("\n").length))}
            placeholder={`Écrire à ${thread.with.username}…`}
            className="min-w-0 flex-1 resize-none border border-white/10 bg-ink px-3 py-2.5 text-sm placeholder:text-white/35 focus:border-gold/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Envoyer"
            className="clip-slant grid h-11 w-12 shrink-0 place-items-center bg-gold text-ink transition-colors [--slant:8px] hover:bg-gold-light disabled:opacity-40"
          >
            {sending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSendHorizontal aria-hidden className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1.5 flex justify-between gap-3 text-[11px] text-white/35">
          <span>Entrée pour envoyer, Maj + Entrée pour aller à la ligne.</span>
          {draft.length > MAX - 200 ? (
            <span className="tabular-nums">
              {draft.length} / {MAX}
            </span>
          ) : null}
        </p>
      </form>
      )}
    </>
  );
}

const ALLOW_OPTIONS = [
  ["all", "Tout le monde", "N'importe quel joueur connecté peut t'écrire."],
  ["team", "Mon équipe", "Seulement les joueurs de ton équipe de Division."],
  ["none", "Personne", "Plus personne ne peut t'écrire ; tes conversations restent lisibles."],
];

/** Réglages de la messagerie (GET|POST /messages/settings) : qui peut m'écrire, joueurs bloqués. */
function MessageSettings({ onClose, onUnblocked }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/messages/settings").then(setSettings, (caught) => setError(caught.message));
  }, []);

  const save = async (allow) => {
    setSaving(true);
    setError(null);
    try {
      setSettings(await api("/messages/settings", { method: "POST", body: { allow } }));
    } catch (caught) {
      setError(caught.message);
    } finally {
      setSaving(false);
    }
  };
  const unblock = async (id) => {
    setError(null);
    try {
      await api(`/messages/${id}/block`, { method: "DELETE" });
      setSettings((current) => ({ ...current, blocked: current.blocked.filter((player) => player.id !== id) }));
      onUnblocked(id);
    } catch (caught) {
      setError(caught.message);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-black uppercase leading-none">Réglages</p>
        <button type="button" onClick={onClose} aria-label="Fermer les réglages" className="grid h-8 w-8 place-items-center text-white/50 hover:text-white">
          <LuX aria-hidden className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-xs text-loss">{error}</p> : null}
      {!settings ? (
        <p className="text-sm text-white/45">Chargement…</p>
      ) : (
        <>
          <fieldset disabled={saving}>
            <legend className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">Qui peut m&apos;écrire</legend>
            <div className="space-y-2">
              {ALLOW_OPTIONS.map(([value, label, hint]) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors",
                    settings.allow === value ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25",
                  )}
                >
                  <input type="radio" name="qui-peut-ecrire" value={value} checked={settings.allow === value} onChange={() => save(value)} className="mt-1 accent-[var(--color-gold)]" />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-white/50">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <p className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">Joueurs bloqués</p>
            {settings.blocked.length === 0 ? (
              <p className="text-sm text-white/45">Aucun joueur bloqué. Pour bloquer quelqu&apos;un, ouvre votre conversation et clique sur « Bloquer ».</p>
            ) : (
              <ul className="divide-y divide-white/[0.06] border border-white/10">
                {settings.blocked.map((player) => (
                  <li key={player.id} className="flex items-center gap-3 px-3 py-2">
                    <Avatar full src={player.avatarUrl} name={player.username} size={28} />
                    <span className="min-w-0 flex-1 truncate text-sm">{player.username}</span>
                    <button type="button" onClick={() => unblock(player.id)} className="text-xs text-gold underline underline-offset-4 hover:text-gold-light">
                      Débloquer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Messagerie : conversations à gauche, discussion à droite (une seule à la fois sur téléphone). ?avec=<joueur>. */
export function MessagesView({ me }) {
  const router = useRouter();
  const otherId = typeof router.query.avec === "string" ? router.query.avec : null;
  const [list, setList] = useState(null);
  const [thread, setThread] = useState(null);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadList = useCallback(() => api("/messages").then((result) => setList(result.conversations), (caught) => setError(caught.message)), []);
  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!otherId) return undefined;
    let alive = true;
    setThread(null);
    api(`/messages/${otherId}`)
      .then((result) => {
        if (!alive) return;
        setThread(result);
        refreshMessagesUnread();
        loadList();
      })
      .catch((caught) => alive && setError(caught.message));
    return () => {
      alive = false;
    };
  }, [otherId, loadList]);

  // Temps réel : message reçu (ajouté s'il vient de la conversation ouverte) ; message envoyé lu par l'autre (« Vu »).
  useEffect(() => {
    const channel = supabase
      .channel(`messagerie-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages", filter: `recipient_id=eq.${me}` }, ({ new: row }) => {
        if (row.sender_id === otherId) {
          setThread((current) =>
            current && !current.messages.some((item) => item.id === row.id)
              ? { ...current, messages: [...current.messages, { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at, read: true }] }
              : current,
          );
          api(`/messages/${otherId}/read`, { method: "POST" }).then(refreshMessagesUnread, () => {});
        }
        loadList();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "dm_messages", filter: `sender_id=eq.${me}` }, ({ new: row }) => {
        if (!row.read_at) return;
        setThread((current) => current && { ...current, messages: current.messages.map((item) => (item.id === row.id ? { ...item, read: true } : item)) });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, otherId, loadList]);

  const loadOlder = async () => {
    const first = thread?.messages[0]?.id;
    if (!first) return;
    const result = await api(`/messages/${otherId}?before=${first}`).catch(() => null);
    if (result) setThread((current) => ({ ...current, messages: [...result.messages, ...current.messages], hasMore: result.hasMore }));
  };


  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-loss">{error}</p> : null}
      <div className="clip-tactical grid h-[calc(100dvh-15rem)] min-h-[28rem] grid-cols-1 border border-white/10 bg-ink-800/80 [--cut:20px] lg:grid-cols-[22rem_1fr]">
        <aside className={cn("min-h-0 flex-col border-white/10 lg:flex lg:border-r", otherId ? "hidden" : "flex")}>
          <div className="flex items-center gap-2 border-b border-white/10 p-3">
            <div className="min-w-0 flex-1">
              <NewConversation />
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              aria-expanded={settingsOpen}
              aria-label="Réglages de la messagerie"
              title="Réglages de la messagerie"
              className={cn("grid h-10 w-10 shrink-0 place-items-center border border-white/10 transition-colors hover:text-white", settingsOpen ? "text-gold" : "text-white/55")}
            >
              <LuSettings aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {settingsOpen ? (
              <MessageSettings
                onClose={() => setSettingsOpen(false)}
                onUnblocked={(id) => id === otherId && setThread((current) => current && { ...current, blockedByMe: false, canWrite: true })}
              />
            ) : (
              <ConversationList items={list} selected={otherId} />
            )}
          </div>
        </aside>
        <section className={cn("min-h-0 flex-col", otherId ? "flex" : "hidden lg:flex")}>
          {otherId ? (
            <Thread
              me={me}
              otherId={otherId}
              thread={thread}
              onLoadOlder={loadOlder}
              onSent={(sent) => {
                setThread((current) => (current && !current.messages.some((item) => item.id === sent.id) ? { ...current, messages: [...current.messages, sent] } : current));
                loadList();
              }}
              onChange={(patch) => setThread((current) => current && { ...current, ...patch })}
            />
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <LuMessageSquare aria-hidden className="mx-auto h-10 w-10 text-gold/60" />
                <p className="mt-3 font-display text-xl font-black uppercase">Tes messages</p>
                <p className="mt-1 max-w-sm text-sm text-white/55">Choisis une conversation à gauche, ou cherche un joueur pour lui écrire.</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <p className="text-xs text-white/45">
        Les messages sont supprimés 30 jours après l&apos;envoi. Personne d&apos;autre ne les lit, sauf l&apos;équipe SixSence si tu signales une conversation (ses 50 derniers messages). Ne partage jamais tes identifiants, mots de passe ou codes.
      </p>
    </div>
  );
}
