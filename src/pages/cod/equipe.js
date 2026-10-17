import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuCheck, LuCrown, LuExternalLink, LuImagePlus, LuLoaderCircle, LuPlus, LuSearch, LuUserPlus, LuX } from "react-icons/lu";
import { PlayPanel } from "../../components/teams/PlayPanel";
import { MemberRow, RosterHeading, SlantTab, TeamCrest, fieldClass, labelClass } from "../../components/teams/TeamParts";
import { Avatar } from "../../components/ui/Avatar";
import { Button, ButtonLink } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Container } from "../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../components/ui/Feedback";
import { LoginPrompt } from "../../components/ui/LoginPrompt";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { SOCIALS, TEAM_COLORS, TEAM_LIMITS, uploadTeamImage } from "../../lib/teams";

const hoursLeft = (end) => Math.max(1, Math.ceil((end - Date.now()) / 3600_000));

/** « Mon équipe » : invitations et candidatures, ou gestion de son équipe (effectif, recrutement, apparence). */
export default function MyTeamPage() {
  const router = useRouter();
  const { userId, loading } = useSession();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setState(await api("/teams/me"));
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, []);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  return (
    <>
      <Head>
        <title>Mon équipe — SixSence</title>
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow="Match team"
        title={
          <>
            Mon <span className="text-gold-gradient">équipe</span>
          </>
        }
        description={state?.team ? `[${state.team.tag}] ${state.team.name}` : "Rejoins une équipe ou crée la tienne pour jouer en BO3 4v4."}
        actions={
          state?.team ? (
            <ButtonLink href={`/cod/equipes/${state.team.id}`} variant="outline">
              <LuExternalLink aria-hidden className="h-4 w-4" />
              Voir la fiche publique
            </ButtonLink>
          ) : null
        }
      />
      <Container className="py-12">
        {!loading && !userId ? (
          <LoginPrompt title="Connecte-toi pour gérer ton équipe" text="Les équipes sont réservées aux joueurs connectés avec Discord." next="/cod/equipe" />
        ) : error ? (
          <Notice tone="error">{error}</Notice>
        ) : !state ? (
          <Loading />
        ) : state.team ? (
          <ManageTeam state={state} userId={userId} reload={load} created={router.query.nouvelle === "1"} onLeft={() => router.push("/cod/equipes")} />
        ) : (
          <NoTeam state={state} reload={load} />
        )}
      </Container>
    </>
  );
}

// --- Sans équipe ----------------------------------------------------------------------

function NoTeam({ state, reload }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const { missing, cooldownEnds } = state.requirements;

  async function act(key, path, options) {
    setPending(key);
    setError(null);
    try {
      await api(path, options);
      await reload();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-10">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {cooldownEnds && cooldownEnds > Date.now() ? (
        <Notice>Tu as quitté une équipe récemment : tu pourras en rejoindre une autre dans {hoursLeft(cooldownEnds)} h.</Notice>
      ) : null}

      <section aria-labelledby="titre-invitations">
        <RosterHeading title={<span id="titre-invitations">Invitations</span>} count={state.invites.length} max={TEAM_LIMITS.maxMembers} gold />
        {state.invites.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">Aucune invitation pour l&apos;instant. Un Leader peut t&apos;inviter depuis sa page d&apos;équipe.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {state.invites.map((invite) => (
              <li key={invite.id} className="flex flex-wrap items-center gap-3 border-l-2 border-gold bg-gold/8 px-3 py-3 sm:px-4">
                <TeamCrest team={invite.team} size={42} />
                <Link href={`/cod/equipes/${invite.team.id}`} className="min-w-0 flex-1 hover:text-gold">
                  <span className="block truncate font-display text-xl font-bold uppercase leading-none">{invite.team.name}</span>
                  <span className="mt-1 block text-xs text-white/50">
                    [{invite.team.tag}] · {invite.team.points} pts
                  </span>
                </Link>
                <Button size="sm" onClick={() => act(`accept-${invite.id}`, `/teams/invites/${invite.id}/answer`, { method: "POST", body: { accept: true } })} disabled={pending !== null || missing.length > 0}>
                  {pending === `accept-${invite.id}` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
                  Rejoindre
                </Button>
                <Button size="sm" variant="ghost" onClick={() => act(`decline-${invite.id}`, `/teams/invites/${invite.id}/answer`, { method: "POST", body: { accept: false } })} disabled={pending !== null}>
                  Refuser
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {state.requests.length > 0 ? (
        <section aria-labelledby="titre-candidatures">
          <RosterHeading title={<span id="titre-candidatures">Mes candidatures</span>} count={state.requests.length} max={state.requests.length} />
          <ul className="mt-3 space-y-2">
            {state.requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4">
                <TeamCrest team={request.team} size={42} />
                <Link href={`/cod/equipes/${request.team.id}`} className="min-w-0 flex-1 hover:text-gold">
                  <span className="block truncate font-display text-xl font-bold uppercase leading-none">{request.team.name}</span>
                  <span className="mt-1 block text-xs text-white/50">En attente de la réponse d&apos;un Leader</span>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => act(`cancel-${request.id}`, `/teams/invites/${request.id}`, { method: "DELETE" })} disabled={pending !== null}>
                  Annuler
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <TacticalCard highlight innerClassName="flex h-full flex-col p-7">
          <LuPlus aria-hidden className="h-9 w-9 text-gold" />
          <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none">Créer une équipe</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">Tu portes la couronne : tu invites tes coéquipiers et nommes d&apos;autres Leaders.</p>
          {missing.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm text-white/55">
              {missing.map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <LuX aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-loss" />
                  {text}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-auto pt-8">
            {missing.length > 0 ? (
              <Button disabled>Créer mon équipe</Button>
            ) : (
              <ButtonLink href="/cod/equipes/creer">Créer mon équipe</ButtonLink>
            )}
          </div>
        </TacticalCard>
        <TacticalCard innerClassName="flex h-full flex-col p-7">
          <LuSearch aria-hidden className="h-9 w-9 text-gold" />
          <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none">Trouver une équipe</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">Parcours le classement des équipes et envoie ta candidature depuis leur fiche.</p>
          <div className="mt-auto pt-8">
            <ButtonLink href="/cod/equipes" variant="outline">
              Voir les équipes
            </ButtonLink>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
}

// --- Gestion de son équipe ------------------------------------------------------------------

function ManageTeam({ state, userId, reload, created, onLeft }) {
  const { team, me } = state;
  const isLeader = me.crown || me.role === "leader";
  const [tab, setTab] = useState("effectif");
  const [confirm, setConfirm] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(created ? "Équipe créée ! Invite tes coéquipiers et ajoute un logo dans « Apparence »." : null);

  async function run(action) {
    setPending(true);
    setError(null);
    try {
      await action();
      setConfirm(null);
      await reload();
    } catch (caught) {
      setError(caught.message);
      setConfirm(null);
    } finally {
      setPending(false);
    }
  }

  const starters = team.members.filter((member) => member.starter);
  const subs = team.members.filter((member) => !member.starter);
  const others = team.members.filter((member) => member.id !== userId);
  const requests = state.joinRequests ?? [];

  const controls = (member) => {
    if (member.id === userId || !isLeader) return null;
    const canKick = !member.crown && (member.role !== "leader" || me.crown);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Place de ${member.username}`}
          className="border border-white/15 bg-ink-700 px-2.5 py-2 text-xs text-white"
          value={member.starter ? "starter" : "sub"}
          disabled={pending}
          onChange={(event) => run(() => api(`/teams/${team.id}/members/${member.id}`, { method: "PATCH", body: { starter: event.target.value === "starter" } }))}
        >
          <option value="starter">Titulaire</option>
          <option value="sub">Remplaçant</option>
        </select>
        {me.crown && !member.crown ? (
          <select
            aria-label={`Rôle de ${member.username}`}
            className="border border-white/15 bg-ink-700 px-2.5 py-2 text-xs text-white"
            value={member.role}
            disabled={pending}
            onChange={(event) => run(() => api(`/teams/${team.id}/members/${member.id}`, { method: "PATCH", body: { role: event.target.value } }))}
          >
            <option value="player">Joueur</option>
            <option value="leader">Leader</option>
          </select>
        ) : null}
        {canKick ? (
          <Button size="sm" variant="danger" disabled={pending} onClick={() => setConfirm({ kind: "kick", member })}>
            Exclure
          </Button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {notice ? (
        <Notice tone="success">
          {notice}{" "}
          <button type="button" onClick={() => setNotice(null)} className="ml-2 underline">
            OK
          </button>
        </Notice>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <PlayPanel team={team} isLeader={isLeader} />

      <div role="tablist" aria-label="Gestion de l'équipe" className="flex gap-2 overflow-x-auto pb-1">
        <SlantTab active={tab === "effectif"} onClick={() => setTab("effectif")}>
          Effectif
        </SlantTab>
        {isLeader ? (
          <SlantTab active={tab === "recrutement"} onClick={() => setTab("recrutement")}>
            Recrutement{requests.length > 0 ? ` · ${requests.length}` : ""}
          </SlantTab>
        ) : null}
        {isLeader ? (
          <SlantTab active={tab === "apparence"} onClick={() => setTab("apparence")}>
            Apparence
          </SlantTab>
        ) : null}
      </div>

      {tab === "effectif" ? (
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Effectif">
            <RosterHeading title="Titulaires" count={starters.length} max={TEAM_LIMITS.maxStarters} gold />
            <ul className="mt-3 space-y-2">
              {starters.map((member) => (
                <MemberRow key={member.id} member={member} isMe={member.id === userId}>
                  {controls(member)}
                </MemberRow>
              ))}
            </ul>
            <RosterHeading title="Remplaçants" count={subs.length} max={TEAM_LIMITS.maxMembers - TEAM_LIMITS.maxStarters} className="mt-10" />
            {subs.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {subs.map((member) => (
                  <MemberRow key={member.id} member={member} isMe={member.id === userId}>
                    {controls(member)}
                  </MemberRow>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-white/45">Aucun remplaçant.</p>
            )}
          </section>
          <aside className="space-y-6">
            <TacticalCard innerClassName="space-y-3 p-6">
              <Eyebrow>Mon rôle</Eyebrow>
              <p className="flex items-center gap-2 font-display text-2xl font-black uppercase leading-none">
                {me.crown ? <LuCrown aria-label="Couronne" className="h-6 w-6 text-gold" /> : null}
                {isLeader ? "Leader" : me.starter ? "Joueur" : "Remplaçant"}
              </p>
              <p className="text-sm leading-relaxed text-white/55">
                {me.crown
                  ? "Tu portes la couronne : tu nommes les Leaders, renommes l'équipe et peux la dissoudre."
                  : isLeader
                    ? "Tu peux inviter, accepter les candidatures, gérer les titulaires et exclure les joueurs."
                    : "Les Leaders gèrent l'effectif et les invitations."}
              </p>
            </TacticalCard>
            <TacticalCard innerClassName="space-y-3 p-6">
              <Eyebrow>Zone sensible</Eyebrow>
              {me.crown && others.length > 0 ? (
                <Button fullWidth variant="outline" disabled={pending} onClick={() => setConfirm({ kind: "transfer", target: others[0].id })}>
                  <LuCrown aria-hidden className="h-4 w-4" />
                  Transmettre la couronne
                </Button>
              ) : null}
              {!me.crown || others.length === 0 ? (
                <Button fullWidth variant="danger" disabled={pending} onClick={() => setConfirm({ kind: "leave" })}>
                  Quitter l&apos;équipe
                </Button>
              ) : null}
              {me.crown ? (
                <Button fullWidth variant="danger" disabled={pending} onClick={() => setConfirm({ kind: "disband" })}>
                  Dissoudre l&apos;équipe
                </Button>
              ) : null}
              <p className="text-xs text-white/45">Après un départ, il faut attendre {24} h avant de rejoindre une autre équipe.</p>
            </TacticalCard>
          </aside>
        </div>
      ) : null}

      {tab === "recrutement" && isLeader ? <Recruitment team={team} state={state} reload={reload} /> : null}
      {tab === "apparence" && isLeader ? <Appearance team={team} userId={userId} canRename={me.crown} reload={reload} /> : null}

      <ConfirmDialog
        open={confirm?.kind === "kick"}
        onClose={() => setConfirm(null)}
        title={`Exclure ${confirm?.member?.username ?? ""} ?`}
        confirmLabel="Exclure"
        tone="danger"
        pending={pending}
        onConfirm={() => run(() => api(`/teams/${team.id}/members/${confirm.member.id}`, { method: "DELETE" }))}
      >
        Le joueur quitte l&apos;équipe tout de suite. Il pourra être réinvité plus tard.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm?.kind === "leave"}
        onClose={() => setConfirm(null)}
        title="Quitter l'équipe ?"
        confirmLabel="Quitter"
        tone="danger"
        pending={pending}
        onConfirm={() =>
          run(async () => {
            await api("/teams/me/leave", { method: "POST" });
            onLeft();
          })
        }
      >
        {me.crown ? "Tu es le seul membre : l'équipe sera dissoute. " : ""}Tu devras attendre 24 h avant de rejoindre une autre équipe.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm?.kind === "disband"}
        onClose={() => setConfirm(null)}
        title="Dissoudre l'équipe ?"
        confirmLabel="Dissoudre"
        tone="danger"
        pending={pending}
        onConfirm={() =>
          run(async () => {
            await api(`/teams/${team.id}`, { method: "DELETE" });
            onLeft();
          })
        }
      >
        Tous les joueurs sont libérés et l&apos;équipe disparaît du classement. Action définitive.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm?.kind === "transfer"}
        onClose={() => setConfirm(null)}
        title="Transmettre la couronne"
        confirmLabel="Transmettre"
        pending={pending}
        onConfirm={() => run(() => api(`/teams/${team.id}/transfer`, { method: "POST", body: { userId: confirm.target } }))}
      >
        <label htmlFor="crown-target" className={labelClass}>
          Nouveau porteur de la couronne
        </label>
        <select
          id="crown-target"
          className={fieldClass}
          value={confirm?.target ?? ""}
          onChange={(event) => setConfirm((current) => ({ ...current, target: event.target.value }))}
        >
          {others.map((member) => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </select>
        <p className="mt-3">Tu restes Leader de l&apos;équipe, mais seul le nouveau porteur pourra nommer les Leaders, renommer ou dissoudre l&apos;équipe.</p>
      </ConfirmDialog>
    </div>
  );
}

// --- Recrutement ------------------------------------------------------------------------------

function Recruitment({ team, state, reload }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(null);
  const timer = useRef(null);
  const full = team.members.length >= TEAM_LIMITS.maxMembers;

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.trim().length < 2) return setResults([]);
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await api(`/teams/${team.id}/search?q=${encodeURIComponent(query.trim())}`));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query, team.id]);

  async function act(key, path, options, done = null) {
    setPending(key);
    setError(null);
    setSent(null);
    try {
      await api(path, options);
      if (done) setSent(done);
      await reload();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  const invited = new Set((state.sentInvites ?? []).map((invite) => invite.player.id));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section aria-labelledby="titre-inviter" className="space-y-4">
        <RosterHeading title={<span id="titre-inviter">Inviter un joueur</span>} count={team.members.length} max={TEAM_LIMITS.maxMembers} gold />
        {full ? <Notice>L&apos;équipe est complète (8 joueurs).</Notice> : null}
        {error ? <Notice tone="error">{error}</Notice> : null}
        {sent ? <Notice tone="success">{sent}</Notice> : null}
        <div className="relative">
          <LuSearch aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            className={cn(fieldClass, "pl-10")}
            placeholder="Pseudo ou identifiant Activision…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={full}
            aria-label="Rechercher un joueur"
          />
        </div>
        {searching ? <p className="text-xs text-white/45">Recherche…</p> : null}
        {results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((player) => (
              <PlayerLine key={player.id} player={player}>
                <Button
                  size="sm"
                  disabled={pending !== null || invited.has(player.id)}
                  onClick={() => act(`invite-${player.id}`, `/teams/${team.id}/invites`, { method: "POST", body: { userId: player.id } }, `Invitation envoyée à ${player.username}.`)}
                >
                  {pending === `invite-${player.id}` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuUserPlus aria-hidden className="h-4 w-4" />}
                  {invited.has(player.id) ? "Invité" : "Inviter"}
                </Button>
              </PlayerLine>
            ))}
          </ul>
        ) : query.trim().length >= 2 && !searching ? (
          <p className="text-xs text-white/45">Aucun joueur sans équipe ne correspond.</p>
        ) : null}
        <p className="text-xs text-white/45">
          Le joueur doit avoir joué {TEAM_LIMITS.minRankedMatches} matchs classés et ne pas avoir quitté une équipe ces dernières 24 h.
        </p>

        {(state.sentInvites ?? []).length > 0 ? (
          <>
            <RosterHeading title="Invitations envoyées" count={state.sentInvites.length} max={20} className="mt-8" />
            <ul className="space-y-2">
              {state.sentInvites.map((invite) => (
                <PlayerLine key={invite.id} player={invite.player}>
                  <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => act(`cancel-${invite.id}`, `/teams/invites/${invite.id}`, { method: "DELETE" })}>
                    Annuler
                  </Button>
                </PlayerLine>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section aria-labelledby="titre-candidatures" className="space-y-4">
        <RosterHeading title={<span id="titre-candidatures">Candidatures</span>} count={(state.joinRequests ?? []).length} max={20} />
        {(state.joinRequests ?? []).length === 0 ? (
          <EmptyState title="Aucune candidature">Les joueurs candidatent depuis la fiche publique de l&apos;équipe.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {state.joinRequests.map((request) => (
              <PlayerLine key={request.id} player={request.player} extra={`${request.player.rankedMatches ?? 0} matchs classés`}>
                <button
                  type="button"
                  aria-label={`Accepter ${request.player.username}`}
                  disabled={pending !== null || full}
                  onClick={() => act(`accept-${request.id}`, `/teams/invites/${request.id}/answer`, { method: "POST", body: { accept: true } }, `${request.player.username} a rejoint l'équipe.`)}
                  className="clip-corner bg-win/15 p-2.5 text-win transition hover:bg-win/25 disabled:opacity-40"
                >
                  <LuCheck className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Refuser ${request.player.username}`}
                  disabled={pending !== null}
                  onClick={() => act(`decline-${request.id}`, `/teams/invites/${request.id}/answer`, { method: "POST", body: { accept: false } })}
                  className="clip-corner bg-loss/15 p-2.5 text-loss transition hover:bg-loss/25 disabled:opacity-40"
                >
                  <LuX className="h-4 w-4" />
                </button>
              </PlayerLine>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PlayerLine({ player, extra = null, children }) {
  const rank = rankFor(player.points ?? 0);
  return (
    <li className="flex items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-2.5">
      <Avatar src={player.avatarUrl} name={player.username} size={36} ring={rankGradient(rank, 160)} />
      <div className="min-w-0 flex-1">
        <Link href={`/cod/profile/${player.id}`} className="block truncate font-display text-lg font-bold uppercase leading-none hover:!text-gold" style={{ color: rank.text }}>
          {player.username}
        </Link>
        <p className="mt-1 text-xs text-white/45">
          {rank.name}
          {extra ? ` · ${extra}` : ""}
        </p>
      </div>
      {children}
    </li>
  );
}

// --- Apparence ----------------------------------------------------------------------------------

function Appearance({ team, userId, canRename, reload }) {
  const [form, setForm] = useState({
    name: team.name,
    tag: team.tag,
    description: team.description ?? "",
    color: team.color,
    socials: { ...team.socials },
    logoUrl: team.logoUrl,
    bannerUrl: team.bannerUrl,
  });
  const [uploading, setUploading] = useState(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  async function upload(kind, file) {
    if (!file) return;
    setUploading(kind);
    setMessage(null);
    try {
      const url = await uploadTeamImage(file, userId, kind);
      setForm((current) => ({ ...current, [kind === "logo" ? "logoUrl" : "bannerUrl"]: url }));
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setUploading(null);
    }
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const body = { description: form.description, color: form.color, socials: form.socials, logoUrl: form.logoUrl ?? null, bannerUrl: form.bannerUrl ?? null };
    if (canRename) Object.assign(body, { name: form.name, tag: form.tag });
    try {
      await api(`/teams/${team.id}`, { method: "PATCH", body });
      setMessage({ tone: "success", text: "Fiche mise à jour." });
      await reload();
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <TacticalCard highlight innerClassName="space-y-5 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="edit-name" className={labelClass}>
              Nom de l&apos;équipe {canRename ? "" : "(couronne)"}
            </label>
            <input id="edit-name" className={fieldClass} value={form.name} maxLength={24} disabled={!canRename} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <label htmlFor="edit-tag" className={labelClass}>
              Tag
            </label>
            <input
              id="edit-tag"
              className={cn(fieldClass, "font-tech uppercase tracking-[0.2em]")}
              value={form.tag}
              disabled={!canRename}
              onChange={(event) => setForm({ ...form, tag: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) })}
            />
          </div>
        </div>
        <div>
          <label htmlFor="edit-description" className={labelClass}>
            Description
          </label>
          <textarea id="edit-description" className={fieldClass} rows={3} maxLength={300} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField label="Logo (carré)" kind="logo" url={form.logoUrl} uploading={uploading === "logo"} onFile={(file) => upload("logo", file)} onClear={() => setForm({ ...form, logoUrl: null })} />
          <ImageField label="Bannière (16:9)" kind="banner" url={form.bannerUrl} uploading={uploading === "banner"} onFile={(file) => upload("banner", file)} onClear={() => setForm({ ...form, bannerUrl: null })} />
        </div>
        <div>
          <span className={labelClass}>Couleur</span>
          <div className="flex flex-wrap gap-2.5">
            {TEAM_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Couleur ${color}`}
                aria-pressed={form.color === color}
                onClick={() => setForm({ ...form, color })}
                className={cn("clip-corner h-9 w-9 transition", form.color === color ? "outline-2 outline-offset-2 outline-white" : "opacity-70 hover:opacity-100")}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIALS.map((social) => (
            <div key={social.key}>
              <label htmlFor={`social-${social.key}`} className={labelClass}>
                {social.label}
              </label>
              <input
                id={`social-${social.key}`}
                className={fieldClass}
                placeholder="https://…"
                value={form.socials[social.key] ?? ""}
                onChange={(event) => setForm({ ...form, socials: { ...form.socials, [social.key]: event.target.value } })}
              />
            </div>
          ))}
        </div>
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending || uploading !== null}>
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
            Enregistrer
          </Button>
        </div>
      </TacticalCard>
      <aside>
        <TacticalCard innerClassName="overflow-hidden p-0">
          <div className="relative h-36">
            {form.bannerUrl ? (
              <img src={form.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            ) : (
              <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 20%, ${form.color}55, transparent 60%)` }} />
            )}
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-800 to-transparent" />
          </div>
          <div className="relative -mt-10 flex items-center gap-4 px-6 pb-6">
            <TeamCrest team={{ tag: form.tag, color: form.color, logoUrl: form.logoUrl }} size={72} />
            <div className="min-w-0">
              <p className="font-tech text-[11px] uppercase tracking-[0.3em]" style={{ color: form.color }}>
                [{form.tag}]
              </p>
              <p className="truncate font-display text-3xl font-black uppercase leading-none">{form.name}</p>
            </div>
          </div>
        </TacticalCard>
      </aside>
    </form>
  );
}

function ImageField({ label, kind, url, uploading, onFile, onClear }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-3">
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 border border-dashed border-white/15 px-4 py-5 text-sm text-white/55 transition hover:border-gold hover:text-gold">
          {uploading ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
          {url ? "Remplacer" : "Ajouter"} (2 Mo max)
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} data-kind={kind} />
        </label>
        {url ? (
          <button type="button" onClick={onClear} className="text-xs text-white/45 underline hover:text-loss">
            Retirer
          </button>
        ) : null}
      </div>
    </div>
  );
}
