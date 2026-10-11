import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowLeft, LuCalendarCheck, LuCalendarDays, LuClock, LuLoaderCircle, LuMapPin, LuTicket, LuUsers, LuX } from "react-icons/lu";
import { formatDateTime, formatTime, getEventState } from "../../../components/gta/eventStatus";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { Chip, EmptyState, Loading, Notice } from "../../../components/ui/Feedback";
import { TacticalCard } from "../../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { signInWithDiscord } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Détail d'un événement : informations, inscription (connexion Discord requise), liste des inscrits. */
export default function EventPage() {
  const { query, isReady } = useRouter();
  const { userId, loading: sessionLoading } = useSession();
  const id = typeof query.id === "string" ? query.id : "";

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!UUID.test(id)) {
      setNotFound(true);
      return;
    }
    try {
      const data = await api(`/gta/events/${id}`);
      setEvent(data.event);
    } catch {
      setNotFound(true);
      return;
    }
    // Inscrits (lecture publique), avec pseudo et avatar.
    const { data: rows } = await supabase.from("gta_registrations").select("user_id, created_at").eq("event_id", id).order("created_at");
    const ids = (rows || []).map((row) => row.user_id);
    if (ids.length === 0) {
      setParticipants([]);
      return;
    }
    const { data: users } = await supabase.from("users").select("id, username, avatar_url").in("id", ids);
    const byId = new Map((users || []).map((user) => [user.id, user]));
    setParticipants(ids.map((userIdItem) => ({ user_id: userIdItem, ...(byId.get(userIdItem) || { username: "Joueur" }) })));
  }, [id]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const registered = participants.some((participant) => participant.user_id === userId);

  async function toggle() {
    setPending(true);
    setError(null);
    try {
      await api(`/gta/events/${id}/register`, { method: registered ? "DELETE" : "POST" });
      await load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  if (notFound) {
    return (
      <Container className="pt-32 pb-12">
        <EmptyState title="Événement introuvable">
          <Link href="/gta6/events" className="text-gold underline underline-offset-4">
            Retour au planning
          </Link>
        </EmptyState>
      </Container>
    );
  }
  if (!event) {
    return (
      <Container className="pt-32">
        <Loading />
      </Container>
    );
  }

  const state = getEventState(event);
  const fill = event.max_slots ? Math.min(100, Math.round((event.registered_count / event.max_slots) * 100)) : null;
  const spinner = <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" />;

  return (
    <>
      <Head>
        <title>{event.title} — SixSence</title>
      </Head>
      <PageHeader eyebrow={`GTA 6 · ${event.category}`} title={event.title} description={`Le ${formatDateTime(event.starts_at)} (heure de Paris).`} />

      <Container className="py-12">
        <Link href="/gta6/events" className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-gold">
          <LuArrowLeft aria-hidden className="h-4 w-4" />
          Retour au planning
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_24rem]">
          {/* --- Colonne principale --------------------------------------- */}
          <div className="space-y-12">
            {state.cancelled ? <Notice tone="error">Cet événement a été annulé.</Notice> : null}

            <img
              src={event.cover_url && event.cover_url.startsWith("https://") ? event.cover_url : "/images/grand-theft-auto-vi-3840x2160-22311.jpg"}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="clip-tactical aspect-[21/9] w-full bg-ink-700 object-cover [--cut:28px]"
            />

            <section aria-labelledby="titre-description">
              <Eyebrow>Programme</Eyebrow>
              <h2 id="titre-description" className="mt-3 font-display text-4xl font-black uppercase leading-none">
                À propos
              </h2>
              <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/70">
                {event.description ?? "Les détails de cet événement seront communiqués sur Discord."}
              </p>
            </section>

            <section aria-labelledby="titre-inscrits">
              <Eyebrow>Participants</Eyebrow>
              <h2 id="titre-inscrits" className="mt-3 font-display text-4xl font-black uppercase leading-none">
                {participants.length} inscrit{participants.length > 1 ? "s" : ""}
              </h2>
              <div className="mt-6">
                {participants.length === 0 ? (
                  <EmptyState title="Personne pour l'instant">Sois le premier à réserver ta place.</EmptyState>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {participants.map((participant) => (
                      <li
                        key={participant.user_id}
                        className={`flex items-center gap-3 border-l-2 px-3.5 py-2.5 ${
                          participant.user_id === userId ? "border-gold bg-gold/8" : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        <Avatar src={participant.avatar_url} name={participant.username} size={34} />
                        <Link href={`/cod/profile/${participant.user_id}`} className="truncate font-display text-lg font-bold uppercase leading-none tracking-wide hover:text-gold">
                          {participant.username}
                        </Link>
                        {participant.user_id === userId ? <Chip className="ml-auto shrink-0">Toi</Chip> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* --- Encart d'inscription ------------------------------------- */}
          <aside className="order-first lg:sticky lg:top-24 lg:order-none lg:self-start">
            <TacticalCard highlight={registered} innerClassName="p-6 sm:p-7">
              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <LuCalendarDays aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <dt className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Date</dt>
                    <dd className="mt-1 text-white/85 first-letter:uppercase">{formatDateTime(event.starts_at)}</dd>
                  </div>
                </div>
                {event.ends_at ? (
                  <div className="flex items-start gap-3">
                    <LuClock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <dt className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Fin prévue</dt>
                      <dd className="mt-1 text-white/85">{formatTime(event.ends_at)}</dd>
                    </div>
                  </div>
                ) : null}
                {event.location ? (
                  <div className="flex items-start gap-3">
                    <LuMapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <dt className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Rendez-vous</dt>
                      <dd className="mt-1 text-white/85">{event.location}</dd>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <LuUsers aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="flex-1">
                    <dt className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Places</dt>
                    <dd className="mt-1 text-white/85">
                      {event.max_slots
                        ? `${event.registered_count} sur ${event.max_slots}${state.remaining ? ` · ${state.remaining} restante${state.remaining > 1 ? "s" : ""}` : ""}`
                        : `${event.registered_count} inscrit${event.registered_count > 1 ? "s" : ""} · places illimitées`}
                    </dd>
                    {fill !== null ? (
                      <div aria-hidden className="mt-2.5 h-1 w-full bg-white/10">
                        <div className={state.full ? "h-full bg-loss" : "h-full bg-gold-sheen"} style={{ width: `${fill}%` }} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </dl>

              <div className="mt-7 border-t border-white/10 pt-6">
                {sessionLoading ? null : !userId ? (
                  state.open ? (
                    <Button size="lg" fullWidth onClick={() => signInWithDiscord(`/gta6/events/${id}`)}>
                      <FaDiscord aria-hidden className="h-5 w-5" />
                      Se connecter pour s&apos;inscrire
                    </Button>
                  ) : null
                ) : registered ? (
                  <>
                    <p role="status" className="mb-4 flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-[0.1em] text-win">
                      <LuCalendarCheck aria-hidden className="h-6 w-6" />
                      Tu es inscrit
                    </p>
                    <Button variant="danger" fullWidth onClick={toggle} disabled={pending}>
                      {pending ? spinner : <LuX aria-hidden className="h-5 w-5" />}
                      Me désinscrire
                    </Button>
                  </>
                ) : (
                  <Button size="lg" fullWidth onClick={toggle} disabled={pending || !state.open}>
                    {pending ? spinner : <LuTicket aria-hidden className="h-5 w-5" />}
                    {state.open ? "M'inscrire" : "Inscriptions closes"}
                  </Button>
                )}

                {!registered && !state.open ? (
                  <p className="mt-3 text-center text-xs text-white/45">
                    {state.cancelled
                      ? "Événement annulé."
                      : state.started
                        ? "L'événement a déjà commencé."
                        : "Toutes les places sont prises. Repasse plus tard : une place peut se libérer."}
                  </p>
                ) : null}

                {error ? (
                  <Notice tone="error" className="mt-4">
                    {error}
                  </Notice>
                ) : null}
              </div>
            </TacticalCard>
          </aside>
        </div>
      </Container>
    </>
  );
}
