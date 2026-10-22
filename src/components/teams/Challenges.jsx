import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuClock, LuLoaderCircle, LuSwords, LuX, LuZap } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { Portal } from "../ui/Portal";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { TeamCrest, fieldClass, labelClass } from "./TeamParts";

const when = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Choix des joueurs du match parmi l'effectif de mon équipe. */
function RosterPicker({ members, size, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : value.length < size ? [...value, id] : value);
  return (
    <div>
      <p className={labelClass}>
        Joueurs du match ({value.length} / {size})
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {members.map((member) => {
          const selected = value.includes(member.id);
          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggle(member.id)}
                className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left transition", selected ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")}
              >
                <Avatar full src={member.avatarUrl} name={member.username} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{member.username}</span>
                {selected ? <LuCheck aria-hidden className="h-4 w-4 text-gold" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Mon équipe et mes droits (Leader) pour les défis. */
function useMyTeam() {
  const [state, setState] = useState(null);
  useEffect(() => {
    Promise.all([api("/teams/me").catch(() => null), api("/teams/me/challenges").catch(() => null)]).then(([me, challenges]) =>
      setState({ team: me?.team ?? null, canManage: Boolean(challenges?.canManage), rosterSize: challenges?.rosterSize ?? 4 }),
    );
  }, []);
  return state;
}

/**
 * Bouton « Défier » de la fiche d'une autre équipe (Leaders) et fenêtre du défi : amical ou officiel,
 * maintenant ou à une heure fixée, joueurs du match, message.
 */
export function ChallengeButton({ target }) {
  const mine = useMyTeam();
  const [open, setOpen] = useState(false);
  if (!mine?.team || !mine.canManage || mine.team.id === target.id) return null;
  return (
    <>
      <Button size="lg" variant="outline" onClick={() => setOpen(true)}>
        <LuSwords aria-hidden className="h-5 w-5" />
        Défier
      </Button>
      <AnimatePresence>{open ? <ChallengeDialog target={target} mine={mine} onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}

function ChallengeDialog({ target, mine, onClose }) {
  const [friendly, setFriendly] = useState(true);
  const [later, setLater] = useState(false);
  const [at, setAt] = useState("");
  const [roster, setRoster] = useState([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function send() {
    setPending(true);
    setError(null);
    try {
      await api("/teams/challenges", {
        method: "POST",
        body: { teamId: target.id, friendly, roster, scheduledAt: later && at ? new Date(at).toISOString() : null, message },
      });
      setDone(true);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Portal>
      <motion.div
        className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-[8vh] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <motion.div role="dialog" aria-modal="true" aria-label="Défier une équipe" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="w-full max-w-xl">
          <TacticalCard highlight cut={22} innerClassName="space-y-5 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TeamCrest team={target} size={44} />
                <div>
                  <Eyebrow>Défi direct</Eyebrow>
                  <p className="mt-1 font-display text-3xl font-black uppercase leading-none">
                    [{target.tag}] {target.name}
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Fermer" className="text-white/50 hover:text-white">
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <>
                <Notice tone="success">Défi envoyé : les Leaders de [{target.tag}] sont prévenus. Suis la réponse dans Mon équipe, onglet Défis.</Notice>
                <div className="flex gap-2">
                  <Button onClick={onClose}>Fermer</Button>
                  <Link href="/cod/equipe?onglet=defis" className="inline-flex items-center px-3 text-sm text-gold underline underline-offset-4">
                    Mes défis
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    [true, "Amical", "Sans points ni bilan : pour s'entraîner."],
                    [false, "Officiel", "Compte pour les points et le bilan de la Division."],
                  ].map(([value, label, hint]) => (
                    <button key={label} type="button" aria-pressed={friendly === value} onClick={() => setFriendly(value)} className={cn("border p-3 text-left transition", friendly === value ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25")}>
                      <span className="block font-display text-xl font-bold uppercase">{label}</span>
                      <span className="mt-1 block text-xs text-white/50">{hint}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant={!later ? "primary" : "outline"} onClick={() => setLater(false)}>
                      <LuZap aria-hidden className="h-4 w-4" />
                      Maintenant
                    </Button>
                    <Button size="sm" variant={later ? "primary" : "outline"} onClick={() => setLater(true)}>
                      <LuClock aria-hidden className="h-4 w-4" />
                      À une heure
                    </Button>
                  </div>
                  {later ? <input type="datetime-local" aria-label="Date et heure du match" className={cn(fieldClass, "max-w-xs")} value={at} onChange={(event) => setAt(event.target.value)} /> : null}
                </div>
                <RosterPicker members={mine.team.members} size={mine.rosterSize} value={roster} onChange={setRoster} />
                <div>
                  <label htmlFor="defi-message" className={labelClass}>
                    Message (facultatif)
                  </label>
                  <input id="defi-message" className={fieldClass} maxLength={200} placeholder="GG d'avance, on vous attend !" value={message} onChange={(event) => setMessage(event.target.value)} />
                </div>
                {error ? <Notice tone="error">{error}</Notice> : null}
                <Button disabled={pending || roster.length !== mine.rosterSize || (later && !at)} onClick={send}>
                  {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSwords aria-hidden className="h-5 w-5" />}
                  Envoyer le défi
                </Button>
                <p className="text-xs text-white/40">BO3, même feuille de match que la Division. Sans réponse, le défi expire après 24 h (ou à l&apos;heure prévue).</p>
              </>
            )}
          </TacticalCard>
        </motion.div>
      </motion.div>
    </Portal>
  );
}

/** Mon équipe : défis reçus (accepter en choisissant ses joueurs, refuser), envoyés (annuler), récents. */
export function ChallengesPanel() {
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [answering, setAnswering] = useState(null);
  const [roster, setRoster] = useState([]);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [challenges, me] = await Promise.all([api("/teams/me/challenges"), api("/teams/me").catch(() => null)]);
    setData(challenges);
    setMembers(me?.team?.members ?? []);
  }, []);
  useEffect(() => {
    load().catch((caught) => setError(caught.message));
  }, [load]);

  async function run(key, action) {
    setPending(key);
    setError(null);
    try {
      setData(await action());
      setAnswering(null);
      setRoster([]);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  if (!data) return error ? <Notice tone="error">{error}</Notice> : null;
  const row = (challenge, incoming) => {
    const other = incoming ? challenge.from : challenge.to;
    return (
      <li key={challenge.id}>
        <TacticalCard cut={16} innerClassName="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <TeamCrest team={other} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl font-bold uppercase leading-none">
                [{other?.tag}] {other?.name}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {challenge.friendly ? "Amical" : "Officiel"} · BO3 · {challenge.scheduledAt ? when(challenge.scheduledAt) : "dès l'acceptation"}
                {challenge.message ? ` · « ${challenge.message} »` : ""}
              </p>
            </div>
            <Chip tone={challenge.status === "accepted" ? "win" : "gold"}>{challenge.status === "accepted" ? "Accepté" : incoming ? "À toi de répondre" : "En attente"}</Chip>
          </div>
          {data.canManage ? (
            <div className="flex flex-wrap gap-2">
              {incoming && challenge.status === "pending" ? (
                <>
                  <Button size="sm" onClick={() => setAnswering(answering === challenge.id ? null : challenge.id)}>
                    <LuCheck aria-hidden className="h-4 w-4" />
                    Accepter
                  </Button>
                  <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => run(`d-${challenge.id}`, () => api(`/teams/challenges/${challenge.id}/answer`, { method: "POST", body: { accept: false } }))}>
                    Refuser
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => run(`c-${challenge.id}`, () => api(`/teams/challenges/${challenge.id}`, { method: "DELETE" }))}>
                  Annuler le défi
                </Button>
              )}
            </div>
          ) : null}
          {answering === challenge.id ? (
            <div className="space-y-3 border-t border-white/10 pt-3">
              <RosterPicker members={members} size={data.rosterSize} value={roster} onChange={setRoster} />
              <Button disabled={pending !== null || roster.length !== data.rosterSize} onClick={() => run(`a-${challenge.id}`, () => api(`/teams/challenges/${challenge.id}/answer`, { method: "POST", body: { accept: true, roster } }))}>
                {pending === `a-${challenge.id}` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuSwords aria-hidden className="h-4 w-4" />}
                {challenge.scheduledAt ? "Accepter pour l'heure prévue" : "Accepter et lancer le match"}
              </Button>
            </div>
          ) : null}
        </TacticalCard>
      </li>
    );
  };

  return (
    <section aria-labelledby="titre-defis" className="space-y-6">
      <div>
        <Eyebrow>Scrims</Eyebrow>
        <h2 id="titre-defis" className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          Défis
        </h2>
        <p className="mt-2 text-sm text-white/55">Défie une équipe depuis sa fiche (bouton « Défier »). Amical pour s&apos;entraîner, ou officiel pour les points de Division.</p>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className={labelClass}>Reçus</p>
          {data.incoming.length ? <ul className="space-y-3">{data.incoming.map((c) => row(c, true))}</ul> : <p className="text-sm text-white/45">Aucun défi reçu.</p>}
        </div>
        <div>
          <p className={labelClass}>Envoyés</p>
          {data.outgoing.length ? <ul className="space-y-3">{data.outgoing.map((c) => row(c, false))}</ul> : <p className="text-sm text-white/45">Aucun défi envoyé.</p>}
        </div>
      </div>
      {data.recent.length ? (
        <div>
          <p className={labelClass}>Récents</p>
          <ul className="space-y-1.5">
            {data.recent.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 border-l-2 border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  [{c.from?.tag}] vs [{c.to?.tag}] · {c.friendly ? "amical" : "officiel"}
                </span>
                <span className="text-xs text-white/45">{{ declined: "Refusé", cancelled: "Annulé", expired: "Expiré", played: "Joué", accepted: "Lancé" }[c.status] ?? c.status}</span>
                {c.matchId ? (
                  <Link href={`/cod/equipes/match/${c.matchId}`} className="text-xs text-gold underline underline-offset-4">
                    Feuille
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
