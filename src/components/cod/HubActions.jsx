import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuCheck, LuCrosshair, LuShield, LuSwords, LuTrophy, LuUser, LuUsers } from "react-icons/lu";
import { api } from "../../lib/api";
import { signInWithDiscord } from "../../lib/auth";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { supabase } from "../../lib/supabase";
import { Button, ButtonLink } from "../ui/Button";

const day = (iso) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${date.toLocaleDateString("fr-FR", { weekday: "short" })} ${time}`;
};

/**
 * Dernier état connu par joueur (mémoire de la page + navigateur) : les boutons s'affichent tout de suite à chaque
 * visite, puis se mettent à jour en arrière-plan ; première visite : « Jouer en Classé » et « Mon profil ».
 */
const STORAGE_KEY = "sixsence:hub-actions";
const memory = new Map();
const DEFAULT_STATE = { queue: null, play: null, cup: null, team: null, lastMode: "classe" };

function remembered(userId) {
  if (memory.has(userId)) return memory.get(userId);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.userId === userId) return saved.state;
  } catch {
    // Stockage indisponible : état par défaut.
  }
  return null;
}

function remember(userId, state) {
  memory.set(userId, state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, state }));
  } catch {
    // Stockage indisponible : gardé en mémoire seulement.
  }
}

/**
 * Boutons de l'en-tête de la page MW4 : l'action la plus utile du moment, dans cet ordre : match en cours (Classé ou
 * Division), recherche lancée, check-in de la Coupe Horus ouvert pour son équipe, inscription à la prochaine Coupe
 * Horus, sinon « Jouer » dans le dernier mode joué. À côté : Mon équipe (si le joueur en a une) ou Mon profil.
 * Visiteur : connexion Discord. Bouton principal à la couleur du mode concerné.
 */
export function HubActions({ user, activeMatchId = null }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    setState(remembered(user.id) ?? DEFAULT_STATE);
    Promise.all([
      api("/cod/queue").catch(() => null),
      MATCH_TEAM_ENABLED ? api("/teams/me/play").catch(() => null) : null,
      MATCH_TEAM_ENABLED ? api("/teams/tournament?kind=horus").catch(() => null) : null,
      MATCH_TEAM_ENABLED ? api(`/teams/players/${user.id}/matches`).catch(() => null) : null,
      supabase.rpc("cod_matches_for", { p_user: user.id, p_limit: 1 }).then(({ data }) => data ?? []),
      MATCH_TEAM_ENABLED ? api("/teams/me").catch(() => null) : null,
    ]).then(([queue, play, horus, teamMatches, codMatches, me]) => {
      if (!alive) return;
      const lastCod = codMatches[0] ? new Date(codMatches[0].completed_at ?? codMatches[0].created_at).getTime() : 0;
      const lastTeam = teamMatches?.matches?.[0] ? new Date(teamMatches.matches[0].date).getTime() : 0;
      const next = { queue, play, cup: horus?.tournament ?? null, team: me?.team ?? null, lastMode: lastTeam > lastCod ? "division" : "classe" };
      remember(user.id, next);
      setState(next);
    });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  if (!user) {
    return (
      <Button size="lg" onClick={() => signInWithDiscord("/cod")}>
        <FaDiscord aria-hidden className="h-5 w-5" />
        Se connecter avec Discord
      </Button>
    );
  }
  const { queue, play, cup, team, lastMode } = state ?? remembered(user.id) ?? DEFAULT_STATE;
  const viewer = cup?.viewer;
  let main;
  if (activeMatchId) main = { href: `/cod/match/${activeMatchId}`, label: "Retour au match", icon: LuSwords, univers: "classe" };
  else if (play?.activeMatchId) main = { href: `/cod/equipes/match/${play.activeMatchId}`, label: "Retour au match", icon: LuSwords, univers: "division" };
  else if (queue?.inQueue) main = { href: "/cod/ranked", label: `Ma recherche${queue.format ? ` · ${queue.format}` : ""}`, short: "Ma recherche", icon: LuCrosshair, univers: "classe" };
  else if (play?.queued) main = { href: "/cod/division", label: "Recherche en cours", icon: LuShield, univers: "division" };
  else if (viewer?.canCheckIn && !viewer.checkedIn) main = { href: "/cod/tournoi", label: "Faire le check-in", icon: LuCheck, univers: "tournoi" };
  else if (viewer?.canRegister && cup?.startsAt) main = { href: "/cod/tournoi", label: `S'inscrire à la Coupe Horus · ${day(cup.startsAt)}`, short: "S'inscrire à la coupe", icon: LuTrophy, univers: "tournoi" };
  else if (MATCH_TEAM_ENABLED && lastMode === "division" && team) main = { href: "/cod/division", label: "Jouer en Division", icon: LuShield, univers: "division" };
  else main = { href: "/cod/ranked", label: "Jouer en Classé", icon: LuCrosshair, univers: "classe" };

  const Icon = main.icon;
  return (
    <>
      <span data-univers={main.univers} className="contents">
        <ButtonLink href={main.href} size="lg">
          <Icon aria-hidden className="h-5 w-5" />
          {main.short ? (
            <>
              <span className="sm:hidden">{main.short}</span>
              <span className="hidden sm:inline">{main.label}</span>
            </>
          ) : (
            main.label
          )}
          <LuArrowRight aria-hidden className="h-5 w-5" />
        </ButtonLink>
      </span>
      {team ? (
        <ButtonLink href="/cod/equipe" size="lg" variant="outline">
          <LuUsers aria-hidden className="h-5 w-5" />
          Mon équipe
        </ButtonLink>
      ) : (
        <ButtonLink href="/cod/profile" size="lg" variant="outline">
          <LuUser aria-hidden className="h-5 w-5" />
          Mon profil
        </ButtonLink>
      )}
    </>
  );
}
