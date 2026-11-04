import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTwitch } from "react-icons/fa6";
import { LuEye, LuPlay } from "react-icons/lu";
import useLive from "../../hooks/useLive";
import { Avatar } from "../ui/Avatar";
import { Container } from "../ui/Container";

const TWITCH = "#9146ff";
const TWITCH_LIGHT = "#bf94ff";

/** Durée du direct : « 1 h 12 » ou « 25 min ». */
function elapsed(iso) {
  if (!iso) return null;
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/** Nom court du jeu sur les cartes. */
const gameLabel = (game) => (/grand theft auto/i.test(game) ? "GTA" : /call of duty/i.test(game) ? "Call of Duty" : game);

/** Point rouge qui pulse et mot « Live ». */
export function LiveDot({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 bg-[#e5484d] px-2 py-1 font-tech text-[9px] font-bold uppercase tracking-[0.18em] text-white ${className}`}>
      <span aria-hidden className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      Live
    </span>
  );
}

function Viewers({ count }) {
  return (
    <span className="inline-flex items-center gap-1 bg-black/70 px-2 py-1 font-tech text-[9px] tabular-nums tracking-[0.1em] text-white">
      <LuEye aria-hidden className="h-3 w-3" />
      {count}
    </span>
  );
}

/** Lecteur Twitch : miniature d'abord, le lecteur ne se charge qu'au clic. */
function StreamPlayer({ stream, big = false }) {
  const [playing, setPlaying] = useState(false);
  const [host, setHost] = useState(null);
  useEffect(() => setHost(window.location.hostname), []);
  const name = stream.player.username;

  if (playing && host) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          title={`Direct de ${name} sur Twitch`}
          src={`https://player.twitch.tv/?channel=${encodeURIComponent(stream.channel)}&parent=${host}&autoplay=true&muted=true`}
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Regarder le direct de ${name}`} className="group/play relative block aspect-video w-full overflow-hidden bg-black">
      {stream.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stream.thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover/play:scale-105" />
      ) : null}
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <span className="absolute left-2 top-2 flex items-center gap-1.5">
        <LiveDot />
        <Viewers count={stream.viewers} />
      </span>
      <span aria-hidden className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center text-white opacity-90 transition group-hover/play:scale-110 group-hover/play:opacity-100 ${big ? "h-16 w-16" : "h-10 w-10"}`} style={{ background: TWITCH }}>
        <LuPlay className={big ? "h-7 w-7" : "h-5 w-5"} />
      </span>
    </button>
  );
}

function StreamInfo({ stream, big = false }) {
  return (
    <div className="flex items-start gap-3 p-3 sm:p-4">
      <Link href={`/cod/profile/${stream.player.id}`} className="shrink-0">
        <Avatar src={stream.player.avatarUrl} name={stream.player.username} size={big ? 44 : 36} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/cod/profile/${stream.player.id}`} className={`block truncate font-display font-black uppercase leading-none transition-colors hover:text-[#bf94ff] ${big ? "text-2xl" : "text-lg"}`}>
          {stream.player.username}
        </Link>
        {stream.title ? <p className="mt-1 truncate text-xs text-white/60">{stream.title}</p> : null}
        <p className="mt-1 font-tech text-[9px] uppercase tracking-[0.18em] text-white/40">
          {gameLabel(stream.game)}
          {stream.startedAt ? ` · depuis ${elapsed(stream.startedAt)}` : ""}
        </p>
      </div>
      <a href={`https://www.twitch.tv/${stream.channel}`} target="_blank" rel="noreferrer" aria-label={`Ouvrir la chaîne de ${stream.player.username} sur Twitch`} className="grid h-8 w-8 shrink-0 place-items-center text-white/40 transition-colors hover:text-[#bf94ff]">
        <FaTwitch aria-hidden className="h-4 w-4" />
      </a>
    </div>
  );
}

/**
 * Joueurs en direct sur Twitch sur COD ou GTA (`streams` de GET /live) : le plus regardé en grand, les autres à côté.
 * Rien n'est affiché quand personne n'est en direct. `bare` : sans marges de section (dans une page déjà en Container).
 */
export function TwitchLive({ bare = false, initial = null }) {
  const live = useLive(initial);
  const streams = live?.streams ?? [];
  if (streams.length === 0) return null;
  const [first, ...others] = streams;
  const shown = others.slice(0, 6);
  const hidden = others.length - shown.length;

  const body = (
    <div id="twitch" className="scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em]" style={{ color: TWITCH_LIGHT }}>
            <FaTwitch aria-hidden className="h-3.5 w-3.5" />
            En direct sur Twitch
          </p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            {streams.length > 1 ? `${streams.length} joueurs en direct` : "Un joueur en direct"}
          </h2>
        </div>
      </div>
      <div className={`mt-6 grid gap-4 ${shown.length ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
        <article className="overflow-hidden border border-white/10 bg-white/[0.02]" style={{ boxShadow: `0 0 50px -20px ${TWITCH}` }}>
          <StreamPlayer key={first.channel} stream={first} big />
          <StreamInfo stream={first} big />
        </article>
        {shown.length ? (
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {shown.map((stream) => (
              <article key={stream.channel} className="overflow-hidden border border-white/10 bg-white/[0.02]">
                <StreamPlayer stream={stream} />
                <StreamInfo stream={stream} />
              </article>
            ))}
            {hidden > 0 ? <p className="text-xs text-white/40 sm:col-span-2">Et {hidden} autre{hidden > 1 ? "s" : ""} en direct.</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
  return bare ? body : <section className="pb-20 sm:pb-28"><Container>{body}</Container></section>;
}
