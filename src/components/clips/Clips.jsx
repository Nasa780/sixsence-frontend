import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuFlag, LuFlame, LuLink2, LuLoaderCircle, LuPlay, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { API_URL } from "../../lib/config";
import { signInWithDiscord } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { isModerator } from "../../lib/roles";
import { ago } from "../cod/HubHighlights";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { ReasonDialog } from "../ui/ReasonDialog";

/**
 * Clips des joueurs (GET /clips du backend) : carte (aperçu, lecteur intégré au clic, auteur, match rattaché, vote
 * « 🔥 », signaler, retirer), formulaire d'ajout et grille. Utilisés par la page /clips, le profil et la Renommée.
 */

export const MODE_STYLE = {
  classe: { label: "Classé", color: "#34d399" },
  division: { label: "Division", color: "#22d3ee" },
  tournoi: { label: "Tournoi", color: "#e5484d" },
};
const PROVIDERS = { youtube: "YouTube", twitch: "Twitch", medal: "Medal", tiktok: "TikTok" };
const REPORT_REASONS = { contenu: "Contenu choquant ou haineux", triche: "Triche ou glitch", spam: "Spam ou publicité", autre: "Autre" };

/** Lecteur intégré d'un clip, chargé au clic. */
function embedUrl(clip) {
  if (clip.provider === "youtube") return `https://www.youtube-nocookie.com/embed/${clip.videoId}?autoplay=1&rel=0`;
  if (clip.provider === "twitch") return `https://clips.twitch.tv/embed?clip=${clip.videoId}&parent=${window.location.hostname}&autoplay=true`;
  if (clip.provider === "medal") return `https://medal.tv/clip/${clip.videoId}?autoplay=1&cta=0`;
  return `https://www.tiktok.com/embed/v2/${clip.videoId}`;
}

/** Miniature de la carte : YouTube directement, Medal par /api/clip-miniature (adresse signée qui expire), Twitch par le serveur ; TikTok n'en fournit pas. */
function thumbnail(clip) {
  if (clip.provider === "youtube") return `https://i.ytimg.com/vi/${clip.videoId}/hqdefault.jpg`;
  if (clip.provider === "medal") return `/api/clip-miniature?id=${encodeURIComponent(clip.videoId)}`;
  if (clip.provider === "twitch") return `${API_URL}/clips/twitch-miniature/${encodeURIComponent(clip.videoId)}`;
  return null;
}

export function ClipCard({ clip, onRemoved = null, highlight = false }) {
  const user = useUser();
  const [playing, setPlaying] = useState(false);
  const [votes, setVotes] = useState(clip.votes);
  const [voted, setVoted] = useState(clip.voted);
  const [pending, setPending] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState(null);
  const [noThumb, setNoThumb] = useState(false);
  const mode = clip.mode ? MODE_STYLE[clip.mode] : null;
  const own = user?.id === clip.author.id;
  const canRemove = own || isModerator(user?.role);
  const vertical = clip.provider === "tiktok";

  async function vote() {
    if (!user) return signInWithDiscord();
    setPending(true);
    setError(null);
    try {
      const result = await api(`/clips/${clip.id}/vote`, { method: "POST", body: {} });
      setVotes(result.votes);
      setVoted(result.voted);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!window.confirm(own ? "Retirer ce clip de ton profil ?" : "Retirer ce clip (modération) ?")) return;
    setError(null);
    try {
      await api(`/clips/${clip.id}`, { method: "DELETE" });
      onRemoved?.(clip.id);
    } catch (caught) {
      setError(caught.message);
    }
  }

  return (
    <article
      id={`clip-${clip.id}`}
      className={cn("group flex h-full scroll-mt-28 flex-col overflow-hidden border bg-white/[0.03] transition-colors", highlight ? "border-gold/60" : "border-white/10 hover:border-white/20")}
    >
      <div className={cn("relative bg-black", vertical && playing ? "aspect-[9/16] max-h-[560px]" : "aspect-video")}>
        {playing ? (
          <iframe
            src={embedUrl(clip)}
            title={clip.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 block w-full" aria-label={`Lire « ${clip.title} »`}>
            {thumbnail(clip) && !noThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail(clip)} alt="" loading="lazy" onError={() => setNoThumb(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(231,192,90,0.18),transparent_60%),linear-gradient(135deg,#17140d,#060606)]" />
            )}
            <span className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
            <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold/90 text-ink shadow-[0_0_30px_rgba(231,192,90,0.5)] transition-transform group-hover:scale-110">
              <LuPlay className="ml-0.5 h-6 w-6" />
            </span>
            <span className="absolute left-3 top-3 bg-black/70 px-2 py-0.5 font-tech text-[9px] uppercase tracking-[0.2em] text-white/80">{PROVIDERS[clip.provider]}</span>
            {mode ? (
              <span className="absolute right-3 top-3 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-ink" style={{ background: mode.color }}>
                {mode.label}
              </span>
            ) : null}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 font-display text-lg font-bold uppercase leading-tight tracking-wide">{clip.title}</p>
        {clip.context ? (
          clip.matchHref ? (
            <Link href={clip.matchHref} className="inline-flex items-center gap-1.5 self-start text-xs text-white/50 hover:text-gold">
              <LuLink2 aria-hidden className="h-3.5 w-3.5" />
              {clip.context}
            </Link>
          ) : (
            <p className="text-xs text-white/50">{clip.context}</p>
          )
        ) : null}
        <div className="mt-auto flex items-center gap-2.5">
          <Link href={`/cod/profile/${clip.author.id}`} className="flex min-w-0 flex-1 items-center gap-2 hover:text-gold">
            <Avatar src={clip.author.avatarUrl} name={clip.author.username} size={26} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{clip.author.username}</span>
              <span className="block text-[11px] text-white/40">{ago(clip.createdAt)}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={vote}
            disabled={pending || own}
            title={own ? "Ton clip" : voted ? "Retirer ton vote" : "Voter pour ce clip"}
            className={cn(
              "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-tech text-xs font-bold tabular-nums transition-colors disabled:cursor-default",
              voted ? "border-[#ff7a2f] bg-[#ff7a2f]/15 text-[#ffb27a]" : "border-white/15 text-white/70 hover:border-[#ff7a2f] hover:text-[#ffb27a]",
            )}
          >
            <LuFlame aria-hidden className="h-4 w-4" />
            {votes}
          </button>
          {user && !own ? (
            <button type="button" onClick={() => setReporting(true)} title="Signaler" aria-label="Signaler ce clip" className="p-1.5 text-white/35 hover:text-white/80">
              <LuFlag className="h-4 w-4" />
            </button>
          ) : null}
          {canRemove ? (
            <button type="button" onClick={remove} title="Retirer" aria-label="Retirer ce clip" className="p-1.5 text-white/35 hover:text-loss">
              <LuTrash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {error ? <p className="text-xs text-loss">{error}</p> : null}
      </div>

      <ReasonDialog
        open={reporting}
        onClose={() => setReporting(false)}
        title="Signaler ce clip"
        intro="L'équipe SixSence est prévenue et retire le clip s'il ne respecte pas le règlement."
        reasons={REPORT_REASONS}
        submitLabel="Signaler"
        onSubmit={async ({ reason, details }) => {
          await api(`/clips/${clip.id}/report`, { method: "POST", body: { reason: `${REPORT_REASONS[reason] ?? reason}${details ? ` : ${details}` : ""}` } });
          setReporting(false);
        }}
      />
    </article>
  );
}

/** Grille de clips (une carte mise en avant au besoin). */
export function ClipGrid({ clips, onRemoved, focus = null, className = "" }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      <AnimatePresence initial={false}>
        {clips.map((clip, index) => (
          <motion.li key={clip.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: Math.min(index, 8) * 0.04 }}>
            <ClipCard clip={clip} onRemoved={onRemoved} highlight={clip.id === focus} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** Ajout d'un clip : lien, titre, match rattaché facultatif (ses matchs récents). */
export function ClipForm({ onAdded, onCancel = null }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/clips/matches").then((data) => setMatches(data.matches ?? []), () => setMatches([]));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const picked = matches.find((m) => `${m.kind}:${m.id}` === match);
      const clip = await api("/clips", { method: "POST", body: { url, title, match: picked ? { kind: picked.kind, id: picked.id } : null } });
      setUrl("");
      setTitle("");
      setMatch("");
      onAdded?.(clip);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  const field = "mt-2 h-11 w-full border border-white/12 bg-ink px-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none";
  const label = "font-tech text-[10px] uppercase tracking-[0.24em] text-white/50";
  return (
    <form onSubmit={submit} className="space-y-4 border border-gold/30 bg-gold/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-xl font-black uppercase leading-none">Ajouter un clip</p>
        {onCancel ? (
          <button type="button" onClick={onCancel} aria-label="Fermer" className="text-white/40 hover:text-white">
            <LuX className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <div>
        <label htmlFor="clip-url" className={label}>
          Lien du clip
        </label>
        <input id="clip-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube, Twitch (clip), Medal ou TikTok" className={field} required />
      </div>
      <div>
        <label htmlFor="clip-title" className={label}>
          Titre
        </label>
        <input id="clip-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ace au couteau sur Lotus" className={field} required />
      </div>
      {matches.length ? (
        <div>
          <label htmlFor="clip-match" className={label}>
            Match (facultatif)
          </label>
          <select id="clip-match" value={match} onChange={(e) => setMatch(e.target.value)} className={field}>
            <option value="">Aucun match</option>
            {matches.map((m) => (
              <option key={`${m.kind}:${m.id}`} value={`${m.kind}:${m.id}`}>
                {m.label} · {new Date(m.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={pending}>
        {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuPlus aria-hidden className="h-5 w-5" />}
        Publier le clip
      </Button>
    </form>
  );
}

/** Section « Clips » d'un profil : les clips du joueur ; sur son propre profil, ajout d'un clip. Rien si vide (autre joueur). */
export function ProfileClips({ playerId, own = false }) {
  const [clips, setClips] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    api(`/clips?user=${playerId}`).then(
      (data) => alive && setClips(data.clips),
      () => alive && setClips([]),
    );
    return () => {
      alive = false;
    };
  }, [playerId]);

  if (clips === null || (!own && clips.length === 0)) return null;
  return (
    <section id="clips" aria-labelledby="titre-clips" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Vitrine</p>
          <h2 id="titre-clips" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Clips
          </h2>
        </div>
        {own ? (
          <Button size="sm" variant="outline" onClick={() => setAdding((value) => !value)}>
            <LuPlus aria-hidden className="h-4 w-4" />
            Ajouter un clip
          </Button>
        ) : null}
      </div>
      {adding ? (
        <div className="mt-6">
          <ClipForm
            onCancel={() => setAdding(false)}
            onAdded={(clip) => {
              setAdding(false);
              setClips((current) => [clip, ...current]);
            }}
          />
        </div>
      ) : null}
      {clips.length ? (
        <ClipGrid className="mt-6" clips={clips} onRemoved={(id) => setClips((current) => current.filter((clip) => clip.id !== id))} />
      ) : (
        <p className="mt-6 text-sm text-white/50">Ajoute tes meilleures actions (YouTube, Twitch, Medal ou TikTok) : elles s&apos;affichent ici et sur la page Clips.</p>
      )}
    </section>
  );
}
