import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuFlame, LuPlus } from "react-icons/lu";
import { ClipCard, ClipForm, ClipGrid, MODE_STYLE } from "../components/clips/Clips";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { EmptyState, Loading, Notice } from "../components/ui/Feedback";
import { PageHeader } from "../components/ui/Typography";
import useUser from "../hooks/useUser";
import { api } from "../lib/api";
import { signInWithDiscord } from "../lib/auth";
import { cn } from "../lib/cn";

/**
 * Clips : les meilleures actions des joueurs (YouTube, Twitch, Medal, TikTok), récents ou les plus votés de la
 * semaine, filtre par mode, clip de la semaine en tête, ajout d'un clip (connexion requise). ?c=<id> met un clip
 * en avant (lien du fil d'activité et des signalements).
 */
export default function ClipsPage() {
  const router = useRouter();
  const user = useUser();
  const [sort, setSort] = useState("recent");
  const [mode, setMode] = useState(null);
  const [clips, setClips] = useState(null);
  const [more, setMore] = useState(false);
  const [week, setWeek] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const focus = typeof router.query.c === "string" ? router.query.c : null;

  const load = useCallback(
    async (before = null) => {
      setError(null);
      const params = new URLSearchParams({ sort, ...(mode ? { mode } : {}), ...(before ? { before } : {}) });
      try {
        const data = await api(`/clips?${params}`);
        setClips((current) => (before ? [...(current ?? []), ...data.clips] : data.clips));
        setMore(data.more);
      } catch (caught) {
        setError(caught.message);
        setClips((current) => current ?? []);
      }
    },
    [sort, mode],
  );

  useEffect(() => {
    setClips(null);
    load();
  }, [load]);

  useEffect(() => {
    api("/clips/week").then((data) => setWeek(data.clip), () => setWeek(null));
  }, []);

  // ?c= : on fait défiler jusqu'au clip une fois la liste affichée.
  useEffect(() => {
    if (focus && clips?.length) document.getElementById(`clip-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus, clips]);

  const removed = (id) => {
    setClips((current) => current.filter((clip) => clip.id !== id));
    if (week?.id === id) setWeek(null);
  };

  return (
    <>
      <Head>
        <title>Clips — SixSence</title>
        <meta name="description" content="Les meilleures actions des joueurs SixSence sur Call of Duty MW4 : clips YouTube, Twitch, Medal et TikTok, votés par la communauté." />
      </Head>
      <PageHeader
        eyebrow="Communauté"
        title={
          <>
            Les <span className="text-gold-gradient">clips</span>
          </>
        }
        description="Les meilleures actions des joueurs SixSence. Poste les tiens, vote pour tes préférés : le plus voté de la semaine passe dans la Renommée."
        actions={
          user ? (
            <Button onClick={() => setAdding((value) => !value)}>
              <LuPlus aria-hidden className="h-5 w-5" />
              Ajouter un clip
            </Button>
          ) : (
            <Button onClick={() => signInWithDiscord()}>
              <FaDiscord aria-hidden className="h-5 w-5" />
              Connexion pour poster
            </Button>
          )
        }
      />
      <Container className="space-y-10 py-12">
        {adding && user ? (
          <ClipForm
            onCancel={() => setAdding(false)}
            onAdded={(clip) => {
              setAdding(false);
              if (sort === "recent" && (!mode || clip.mode === mode)) setClips((current) => [clip, ...(current ?? [])]);
            }}
          />
        ) : null}

        {week ? (
          <section aria-labelledby="titre-clip-semaine" className="grid items-center gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-[#ffb27a]">
                <LuFlame aria-hidden className="h-4 w-4" />
                Clip de la semaine
              </p>
              <h2 id="titre-clip-semaine" className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] sm:text-5xl">
                {week.title}
              </h2>
              <p className="mt-3 text-sm text-white/55">
                Par {week.author.username} · {week.votes} vote{week.votes > 1 ? "s" : ""} 🔥 sur les 7 derniers jours.
              </p>
            </div>
            <ClipCard clip={week} onRemoved={removed} highlight />
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex gap-2">
            {[
              ["recent", "Récents"],
              ["top", "Top de la semaine"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                className={cn("clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors [--slant:8px]", sort === id ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:text-white")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[[null, "Tous", "#e7c05a"], ...Object.entries(MODE_STYLE).map(([id, style]) => [id, style.label, style.color])].map(([id, label, color]) => (
              <button
                key={label}
                type="button"
                onClick={() => setMode(id)}
                style={{ "--mode": color }}
                className={cn("border px-3 py-1.5 font-tech text-[10px] uppercase tracking-[0.18em] transition-colors", mode === id ? "border-[var(--mode)] text-[var(--mode)]" : "border-white/10 text-white/50 hover:text-white")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}
        {clips === null ? <Loading /> : null}
        {clips && clips.length === 0 ? (
          <EmptyState title={sort === "top" ? "Pas encore de clip voté cette semaine" : "Pas encore de clip"}>
            {user ? "Sois le premier : ajoute ton meilleur moment en haut de la page." : "Connecte-toi pour poster ton meilleur moment."}
          </EmptyState>
        ) : null}
        {clips?.length ? <ClipGrid clips={clips} onRemoved={removed} focus={focus} /> : null}
        {more ? (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => load(clips[clips.length - 1]?.createdAt)}>
              Voir plus
            </Button>
          </div>
        ) : null}
      </Container>
    </>
  );
}
