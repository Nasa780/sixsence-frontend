import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { levelFor, nextRank, PLATFORMS, rankFor } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import ActivisionForm from "./ActivisionForm";
import { Avatar, Loading, formatDate } from "./ui";

/**
 * Profil COD d'un joueur, au design de la page Profil d'origine (cartes
 * sombres à liseré doré). Public : tout le monde peut consulter un profil ;
 * seul son propriétaire peut modifier son identifiant Activision.
 */

const card =
  "w-full shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65),_0px_0px_0px_1px_rgba(215,_165,_30,_0.06)_inset] rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border border-solid border-[rgba(215,170,40,0.11)] flex flex-col py-5 px-6 max-sm:px-4";

function CardTitle({ icon, children, count }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] font-[Rajdhani]">
      {icon && <Image className="h-[18px] w-[18px]" width={18} height={18} alt="" src={icon} />}
      <b className="tracking-[1.1px] leading-[16.5px] uppercase">{children}</b>
      {count !== undefined && <span className="text-[#4b5563] font-medium">[{count}]</span>}
    </div>
  );
}

/** Trophées : de vrais objectifs, calculés à partir des statistiques du joueur. */
function trophiesFor(profile) {
  const played = profile.wins + profile.losses;
  return [
    { emoji: "🗡️", name: "Premier Sang", color: "#f87171", hint: "Gagner un match classé", ok: profile.wins >= 1 },
    { emoji: "🏆", name: "Domination", color: "#facc15", hint: "Gagner 10 matchs", ok: profile.wins >= 10 },
    { emoji: "🛡️", name: "Indestructible", color: "#4ade80", hint: "5 victoires d'affilée", ok: profile.best_streak >= 5 },
    { emoji: "🎯", name: "Sniper Elite", color: "#4fc3f7", hint: "Atteindre le rang Diamant", ok: profile.peak_points >= 2000 },
    { emoji: "🧠", name: "Stratège", color: "#c084fc", hint: "Jouer 50 matchs", ok: played >= 50 },
    { emoji: "⚜️", name: "Légendaire", color: "#fb923c", hint: "Atteindre le rang Champion", ok: profile.peak_points >= 3500 },
  ];
}

/** Badges attribués à la main par l'équipe (colonne badges de cod_profiles). */
const BADGES = {
  founder: { emoji: "👑", name: "Fondateur", color: "#facc15" },
  beta: { emoji: "⚡", name: "Bêta-testeur", color: "#c084fc" },
  partner: { emoji: "🤝", name: "Partenaire", color: "#4fc3f7" },
  staff: { emoji: "🛡️", name: "Staff", color: "#4ade80" },
  mvp: { emoji: "🔥", name: "MVP", color: "#fb923c" },
};

function Medal({ emoji, name, color, locked, hint }) {
  const tint = locked ? "#374151" : color;
  return (
    <div
      title={hint}
      className="h-[78px] flex-1 min-w-[96px] rounded-[10px] [background:linear-gradient(160deg,_#08090d,_#060709)] border border-solid overflow-hidden flex flex-col items-center justify-center gap-2 relative"
      style={{ borderColor: `${tint}44`, boxShadow: locked ? "none" : `0 0 14px ${tint}4d` }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${tint}99 50%, transparent)` }}
      />
      <div className="text-2xl leading-6" style={{ filter: locked ? "grayscale(1) opacity(0.4)" : "none" }}>
        {locked ? "🔒" : emoji}
      </div>
      <b className="text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-center px-1" style={{ color: tint }}>
        {name}
      </b>
    </div>
  );
}

/** Courbe des points après chaque match terminé (SVG, sans dépendance). */
function ProgressChart({ points, matches, userId }) {
  const series = useMemo(() => {
    const done = matches.filter((match) => match.status === "completed").reverse(); // du plus ancien au plus récent
    const deltas = done.map((match) => match.points_changes?.[userId] ?? 0);
    // On repart du total actuel pour reconstituer les valeurs passées.
    let value = points - deltas.reduce((sum, delta) => sum + delta, 0);
    const values = [Math.max(0, value)];
    const labels = [""];
    done.forEach((match, index) => {
      value += deltas[index];
      values.push(Math.max(0, value));
      labels.push(formatDate(match.completed_at || match.created_at, false));
    });
    return { values, labels };
  }, [points, matches, userId]);

  if (series.values.length < 2) {
    return <div className="py-10 text-center text-xs text-[#4b5563] font-[Inter]">La courbe apparaîtra après ton premier match terminé.</div>;
  }

  const width = 1000;
  const height = 160;
  const min = Math.min(...series.values);
  const max = Math.max(...series.values);
  const span = Math.max(1, max - min);
  const xy = series.values.map((value, index) => [
    (index / (series.values.length - 1)) * width,
    height - 12 - ((value - min) / span) * (height - 24),
  ]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${line} ${width},${height}`} fill="url(#progress-fill)" />
        <polyline points={line} fill="none" stroke="#4fc3f7" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[10px] text-[#4b5563] font-[Inter]">
        <span>{min} pts</span>
        <span>{series.labels[series.labels.length - 1]}</span>
        <span>{max} pts</span>
      </div>
    </div>
  );
}

function MatchRow({ match, userId }) {
  const inA = match.team_a.includes(userId);
  const won = match.winner ? (match.winner === "A") === inA : null;
  const change = match.points_changes?.[userId];
  const label =
    match.status === "completed"
      ? won
        ? { text: "Victoire", bg: "#14532d", color: "#4ade80" }
        : { text: "Défaite", bg: "#450a0a", color: "#f87171" }
      : match.status === "cancelled"
        ? { text: "Annulé", bg: "#1f2937", color: "#94a3b8" }
        : { text: "En cours", bg: "#1e3a5f", color: "#4fc3f7" };

  return (
    <div className="w-full min-h-14 rounded-lg [background:linear-gradient(160deg,_#08090d,_#060709)] border border-solid border-[rgba(215,170,40,0.08)] flex items-center flex-wrap py-3 px-4 gap-2.5 text-xs text-[#6b7280] font-[Inter]">
      <b className="rounded py-[3px] px-2.5 text-[11px]" style={{ background: label.bg, color: label.color }}>
        {label.text}
      </b>
      <span className="rounded bg-[#431407] py-[3px] px-2.5 text-[11px] text-[#fb923c] font-semibold">{match.mode}</span>
      <span className="flex items-center gap-1">
        <Image className="h-3.5 w-3.5" width={14} height={14} alt="" src="/assets/ControllerIcon.svg" />
        {match.team_size}v{match.team_size}
      </span>
      <span className="flex-1 min-w-[100px] text-[13px] text-[#e2e8f0] font-semibold">{match.map}</span>
      {typeof change === "number" && (
        <b className="font-[Rajdhani] text-sm" style={{ color: change >= 0 ? "#4ade80" : "#f87171" }}>
          {change >= 0 ? `+${change}` : change} pts
        </b>
      )}
      <span className="flex items-center gap-[5px]">
        <Image className="h-[13px] w-[13px]" width={13} height={13} alt="" src="/assets/Iconplay2.svg" />
        {formatDate(match.created_at)}
      </span>
      <Link
        href={`/cod/match/${match.id}`}
        className="no-underline rounded-md bg-[#581c87] border border-solid border-[#7e22ce] py-[5px] px-3 text-[#c084fc] font-semibold"
      >
        Voir détails
      </Link>
    </div>
  );
}

export default function ProfileView({ userId, isOwn = false, ownUser = null }) {
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    const [{ data: row }, { data: profile }, { data: matches }] = await Promise.all([
      supabase.from("users").select("id, username, avatar_url, created_at").eq("id", userId).maybeSingle(),
      supabase.from("cod_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.rpc("cod_matches_for", { p_user: userId, p_limit: 20 }),
    ]);
    if (!row || !profile) {
      setNotFound(true);
      return;
    }
    const { count } = await supabase
      .from("cod_leaderboard")
      .select("user_id", { count: "exact", head: true })
      .gt("points", profile.points);
    setData({ row, profile, matches: matches || [], position: profile.wins + profile.losses > 0 ? (count ?? 0) + 1 : null });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) return <div className="py-20 text-center text-[#a0b0c8] font-[Inter]">Joueur introuvable.</div>;
  if (!data) return <Loading label="Chargement du profil…" />;

  const { row, profile, matches, position } = data;
  const rank = rankFor(profile.points);
  const upcoming = nextRank(profile.points);
  const played = profile.wins + profile.losses;
  const ratio = played > 0 ? Math.round((profile.wins / played) * 100) : 0;
  const badges = (profile.badges || []).map((key) => BADGES[key]).filter(Boolean);

  return (
    <div className="w-full flex flex-col gap-4 text-[#94a3b8] font-[Inter]">
      {/* Carte d'identité */}
      <div className={`${card} items-center pt-10 pb-8 gap-2.5 relative`}>
        {isOwn && (
          <button
            onClick={() => setEditing((value) => !value)}
            className="cursor-pointer absolute top-4 right-[18px] h-8 rounded-[7px] bg-[#09090e] border border-solid border-[rgba(215,170,40,0.15)] px-3 text-xs text-[#94a3b8] font-medium hover:text-white"
          >
            {editing ? "Fermer" : "Modifier mon profil"}
          </button>
        )}
        <Avatar src={row.avatar_url} name={row.username} size={100} className="rounded-full" />
        <b className="text-[22px] leading-[33px] text-white font-[Inter] max-sm:text-lg">{row.username}</b>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: rank.color }}>
          <Image className="h-5 w-5" width={20} height={20} alt="" src={rank.icon} />
          {rank.name}
          {position && <span className="text-[#6b7280] font-normal">· #{position} au classement</span>}
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <span>{profile.points} pts</span>
          <span className="text-[#2a2a30]">|</span>
          <span className="text-[13px] text-[#4fc3f7] font-semibold">Niveau {levelFor(profile.xp)}</span>
        </div>
        {upcoming.rank && (
          <div className="w-[240px] max-w-full">
            <div className="h-1.5 rounded-full bg-[#1f2937] overflow-hidden">
              <div className="h-full" style={{ width: `${Math.round(upcoming.progress * 100)}%`, background: upcoming.rank.color }} />
            </div>
            <div className="pt-1 text-center text-[10px] text-[#6b7280]">
              {upcoming.rank.min - profile.points} pts avant {upcoming.rank.name}
            </div>
          </div>
        )}
        <div className="flex items-center justify-center flex-wrap pt-1 gap-2 text-xs text-[#cbd5e1]">
          <span className="rounded-md bg-[#14532d] border border-solid border-[#166534] py-[5px] px-3 text-[#4ade80] font-semibold">
            {profile.xp} XP
          </span>
          {profile.platform && (
            <span className="rounded-md bg-[#09090e] border border-solid border-[rgba(255,255,255,0.07)] py-[5px] px-3">
              {PLATFORMS[profile.platform]}
            </span>
          )}
          <span className="rounded-lg bg-[#09090e] border border-solid border-[rgba(215,170,40,0.08)] py-[5px] px-3.5 text-[13px] font-medium">
            {profile.activision_id || "ID Activision non renseigné"}
          </span>
        </div>
        <div className="pt-0.5 text-xs text-[#6b7280]">
          Membre depuis le {new Date(row.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        {isOwn && editing && ownUser && (
          <div className="w-full max-w-[520px] pt-4">
            <ActivisionForm
              user={ownUser}
              onSaved={() => {
                setEditing(false);
                load();
              }}
            />
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className={card}>
        <CardTitle icon="/assets/Iconstats.svg">Statistiques totales</CardTitle>
        <div className="flex flex-wrap gap-3 pt-4 text-[26px] text-white">
          {[
            { value: played, label: "Matchs joués", icon: "/assets/CrossedSwordsIcon.svg", color: "#ffffff" },
            { value: profile.wins, label: "Victoires totales", icon: "/assets/TrophyStatIcon.svg", color: "#4ade80" },
            { value: profile.losses, label: "Défaites totales", icon: "/assets/HeartBrokenIcon.svg", color: "#f87171" },
            { value: `${ratio}%`, label: "Ratio de victoire", icon: "/assets/TrendUpIcon.svg", color: "#fb923c" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[120px] rounded-lg [background:linear-gradient(160deg,_#09090f,_#070810)] border border-solid border-[rgba(255,255,255,0.05)] flex flex-col items-center py-[18px] px-4 gap-1.5"
              style={{ color: stat.color }}
            >
              <Image className="w-7 h-7" width={28} height={28} alt="" src={stat.icon} />
              <b className="leading-[26px] max-sm:text-[21px]">{stat.value}</b>
              <div className="text-[11px] leading-[16.5px] text-[#6b7280]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trophées */}
      <div className={card}>
        <CardTitle icon="/assets/TrophyStatIcon.svg">Trophées du joueur</CardTitle>
        <div className="flex flex-wrap gap-2.5 pt-4">
          {trophiesFor(profile).map((trophy) => (
            <Medal key={trophy.name} {...trophy} locked={!trophy.ok} />
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className={card}>
        <CardTitle icon="/assets/Iconbadge.svg">Badges du joueur</CardTitle>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-4">
            {badges.map((badge) => (
              <Medal key={badge.name} {...badge} />
            ))}
          </div>
        ) : (
          <div className="pt-4 text-xs text-[#4b5563]">Aucun badge pour l'instant : ils sont attribués par l'équipe SixSence.</div>
        )}
      </div>

      {/* Progression */}
      <div className={`${card} gap-4`}>
        <CardTitle icon="/assets/Iconstats3.svg">Progression classée</CardTitle>
        <ProgressChart points={profile.points} matches={matches} userId={userId} />
      </div>

      {/* Série en cours */}
      {profile.win_streak >= 2 && (
        <div className="w-full shadow-[0px_4px_28px_rgba(0,_0,_0,_0.55)] rounded-xl [background:linear-gradient(135deg,_#130a00,_#1e1000_50%,_#130a00)] border border-solid border-[rgba(180,80,10,0.4)] flex items-center py-5 px-7 gap-3.5 text-lg text-white">
          <Image className="h-7 w-7" width={28} height={28} alt="" src="/assets/Iconfire2.svg" />
          <div>
            <b className="leading-[27px]">{profile.win_streak} victoires consécutives !</b>
            <div className="pt-0.5 text-xs text-[#92400e]">Record : {profile.best_streak}</div>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className={card}>
        <CardTitle icon="/assets/Iconhistorique.svg" count={matches.length}>
          Historique des matchs
        </CardTitle>
        <div className="flex flex-col gap-2 pt-4">
          {matches.length === 0 ? (
            <div className="text-xs text-[#4b5563]">
              Aucun match pour l'instant.{" "}
              {isOwn && (
                <Link href="/cod/ranked" className="text-[#4a90d9]">
                  Lance ta première recherche
                </Link>
              )}
            </div>
          ) : (
            matches.map((match) => <MatchRow key={match.id} match={match} userId={userId} />)
          )}
        </div>
      </div>
    </div>
  );
}
