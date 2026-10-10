import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { eventStatus } from "../../../components/site/EventCard";
import LoginGate from "../../../components/site/LoginGate";
import PageShell from "../../../components/site/PageShell";
import { Loading, Notice, Panel, PrimaryButton, SectionTitle, formatDate } from "../../../components/site/ui";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";

/** Détail d'un événement GTA 6 et inscription (connexion Discord requise pour s'inscrire). */
export default function GtaEventPage() {
  const { query, isReady } = useRouter();
  const { userId, loading: sessionLoading } = useSession();
  const id = typeof query.id === "string" ? query.id : null;

  const [event, setEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api(`/gta/events/${id}`);
      setEvent(data.event);
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  // Le joueur est-il déjà inscrit ? (les inscriptions sont publiques en lecture)
  useEffect(() => {
    if (!id || !userId) {
      setRegistered(false);
      return;
    }
    supabase
      .from("gta_registrations")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setRegistered(Boolean(data)));
  }, [id, userId]);

  const toggle = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await api(`/gta/events/${id}/register`, { method: registered ? "DELETE" : "POST" });
      setRegistered(!registered);
      setNotice({ tone: "success", text: registered ? "Désinscription enregistrée." : "Inscription confirmée, à bientôt en jeu !" });
      await load();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <PageShell active="gta6" title="Événement">
        <div className="py-20 text-center text-[#a0b0c8] font-[Inter]">
          Événement introuvable.{" "}
          <Link href="/gta6/events" className="text-[#4a90d9]">
            Retour au planning
          </Link>
        </div>
      </PageShell>
    );
  }

  const status = event ? eventStatus(event) : null;
  const open = status?.text === "Inscriptions ouvertes";

  return (
    <PageShell active="gta6" title={event?.title || "Événement"} width={1000}>
      {!event && <Loading />}
      {event && (
        <div className="flex flex-col gap-6">
          <Link href="/gta6/events" className="text-sm text-[#94a3b8] font-[Inter] no-underline hover:text-white">
            ← Retour au planning
          </Link>

          <section
            className="relative overflow-hidden border border-solid border-[rgba(255,160,64,0.3)] min-h-[240px] flex items-end bg-cover bg-center"
            style={{ backgroundImage: `url('${event.cover_url || "/images/grand-theft-auto-vi-3840x2160-22311.jpg"}')` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,15,0.2),rgba(6,7,15,0.95))]" />
            <div className="relative p-8 max-sm:p-5">
              <span className="text-[10px] uppercase tracking-[1.5px] font-bold font-[Rajdhani] py-1 px-2 bg-[rgba(6,7,15,0.75)] text-[#ffa040] border border-solid border-[rgba(255,160,64,0.4)]">
                {event.category}
              </span>
              <h1 className="m-0 pt-3 text-[38px] max-sm:text-[26px] leading-[1.1] font-bold font-[Rajdhani] text-white">{event.title}</h1>
              <div className="pt-2 text-sm text-[#c8d4e6] font-[Inter]">
                📅 {formatDate(event.starts_at)}
                {event.ends_at && <> → {formatDate(event.ends_at)}</>}
                {event.location && <> · 📍 {event.location}</>}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-6 items-start">
            <Panel className="flex-1 min-w-[280px]">
              <SectionTitle>Description</SectionTitle>
              <p className="m-0 pt-3 text-sm text-[#a0b0c8] font-[Inter] leading-[22px] whitespace-pre-line">
                {event.description || "Pas de description pour cet événement."}
              </p>
            </Panel>

            <Panel className="w-[320px] max-md:w-full flex flex-col gap-3">
              <SectionTitle>Inscription</SectionTitle>
              <div className="flex items-center justify-between text-sm font-[Inter]">
                <span style={{ color: status.color }}>{status.text}</span>
                <span className="text-[#c5d8f0] font-semibold">
                  {event.registered_count}
                  {event.max_slots ? ` / ${event.max_slots}` : ""} inscrit(s)
                </span>
              </div>
              {event.max_slots && (
                <div className="h-1.5 rounded-full bg-[#1f2937] overflow-hidden">
                  <div
                    className="h-full bg-[#ffa040]"
                    style={{ width: `${Math.min(100, Math.round((event.registered_count / event.max_slots) * 100))}%` }}
                  />
                </div>
              )}

              {!sessionLoading && !userId && (open || registered) && (
                <LoginGate
                  title="Connecte-toi pour t'inscrire"
                  text="L'inscription se fait avec ton compte Discord."
                  next={`/gta6/events/${event.id}`}
                />
              )}
              {userId && (registered || open) && (
                <PrimaryButton onClick={toggle} disabled={busy}>
                  {busy ? "Chargement…" : registered ? "Me désinscrire" : "M'inscrire"}
                </PrimaryButton>
              )}
              {userId && registered && <Notice tone="success">Tu es inscrit à cet événement.</Notice>}
              {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
            </Panel>
          </div>
        </div>
      )}
    </PageShell>
  );
}
