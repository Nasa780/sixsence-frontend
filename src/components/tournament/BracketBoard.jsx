import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuCrown, LuExpand, LuMinus, LuPlus, LuScan, LuShrink } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { TeamCrest } from "../teams/TeamParts";

/*
 * Tableau d'un tournoi d'un seul tenant (inspiré de Sked, à l'identité SixSence) : tableau des gagnants en haut,
 * des perdants en dessous, grande finale reliée à droite et carte du champion au bout. Liaisons tracées en SVG
 * d'après les règles du serveur (advanceBracket / advanceDouble de tournamentPolicy.ts), parcours du champion en
 * or animé, survol d'une équipe = tout son chemin, numéros de match dans l'ordre de jeu, cases vides annoncées
 * (« Vainqueur #13 », « Perdant #5 »), zoom (boutons, Ctrl + molette), déplacement à la souris, plein écran.
 */

const CARD_W = 236;
const ROW_H = 34;
const CARD_H = ROW_H * 2 + 1;
const GAP_X = 70;
const PITCH = CARD_H + 22;
const COL = CARD_W + GAP_X;
const HEAD = 46; // titre de section + bandeau des tours
const SECTION_GAP = 64;
const PAD = 24;
const CHAMP_W = 210;
const GOLD = "#e7c05a";
// Palette du tableau, plate façon Valorant : fond anthracite, panneaux (rencontres, tours, champion) un cran plus clairs.
const STAGE = "#1c1d21";
const PANEL = "#26282d";
const EDGE = "rgba(255,255,255,0.08)";
const LIVE = "#34d399";
const LATE = "#e879f9";
const DISPUTE = "#fbbf24";

const keyOf = (bracket, round, slot) => `${bracket}${round}-${slot}`;

/** Ordre de jeu (comme Sked) : G1, P1, G2, P2, P3, G3, P4, P5… finale G, finale P, grande finale. */
function stepOf(bracket, round, n) {
  if (bracket === "W") return round === 1 ? 1 : 3 * (round - 1);
  if (bracket === "L") return round === 1 ? 2 : round % 2 === 0 ? 3 * (round / 2) + 1 : 3 * ((round - 1) / 2) + 2;
  return 3 * n + 2;
}

/** Positions, liaisons et origines des cases vides, d'après la forme du tableau. */
function layout(tournament) {
  const double = tournament.bracket === "double";
  const wb = tournament.rounds ?? [];
  const lb = double ? tournament.losers ?? [] : [];
  const n = wb.length;
  const nodes = new Map();
  const edges = [];
  const add = (bracket, round, entry, x, y, extra = {}) => nodes.set(keyOf(bracket, round, entry.slot), { key: keyOf(bracket, round, entry.slot), bracket, round, entry, x, y, ...extra });

  // Tableau des gagnants.
  const wbTop = PAD + HEAD;
  wb.forEach((r, i) => {
    r.entries.forEach((entry) => {
      let y;
      if (i === 0) y = wbTop + entry.slot * PITCH;
      else {
        const a = nodes.get(keyOf("W", r.round - 1, entry.slot * 2));
        const b = nodes.get(keyOf("W", r.round - 1, entry.slot * 2 + 1));
        y = a && b ? (a.y + b.y) / 2 : a?.y ?? b?.y ?? wbTop;
        if (a) edges.push({ from: a.key, to: keyOf("W", r.round, entry.slot) });
        if (b) edges.push({ from: b.key, to: keyOf("W", r.round, entry.slot) });
      }
      add("W", r.round, entry, PAD + i * COL, y, { roundName: r.name, bestOf: r.bestOf, feeds: i === 0 ? null : [["W", r.round - 1, entry.slot * 2, "winner"], ["W", r.round - 1, entry.slot * 2 + 1, "winner"]] });
    });
  });
  const wbBottom = wbTop + Math.max(1, wb[0]?.entries.length ?? 1) * PITCH;

  // Petite finale (élimination simple) : sous la finale.
  const final = nodes.get(keyOf("W", n, 0));
  if (!double && tournament.thirdPlace && final) {
    add("T", n, tournament.thirdPlace.entry, final.x, Math.max(final.y + PITCH * 1.6, wbTop + PITCH), {
      roundName: tournament.thirdPlace.name ?? "Petite finale",
      bestOf: tournament.thirdPlace.bestOf,
      feeds: [["W", n - 1, 0, "loser"], ["W", n - 1, 1, "loser"]],
    });
  }

  // Tableau des perdants.
  const lbTop = wbBottom + SECTION_GAP + HEAD;
  lb.forEach((r, i) => {
    const k = i + 1;
    r.entries.forEach((entry) => {
      let y;
      let feeds;
      if (k === 1) {
        y = lbTop + entry.slot * PITCH;
        feeds = [["W", 1, entry.slot * 2, "loser"], ["W", 1, entry.slot * 2 + 1, "loser"]];
      } else if (k % 2 === 0) {
        const a = nodes.get(keyOf("L", k - 1, entry.slot));
        y = a?.y ?? lbTop;
        if (a) edges.push({ from: a.key, to: keyOf("L", k, entry.slot) });
        feeds = [["L", k - 1, entry.slot, "winner"], ["W", k / 2 + 1, entry.slot, "loser"]];
      } else {
        const a = nodes.get(keyOf("L", k - 1, entry.slot * 2));
        const b = nodes.get(keyOf("L", k - 1, entry.slot * 2 + 1));
        y = a && b ? (a.y + b.y) / 2 : a?.y ?? b?.y ?? lbTop;
        if (a) edges.push({ from: a.key, to: keyOf("L", k, entry.slot) });
        if (b) edges.push({ from: b.key, to: keyOf("L", k, entry.slot) });
        feeds = [["L", k - 1, entry.slot * 2, "winner"], ["L", k - 1, entry.slot * 2 + 1, "winner"]];
      }
      add("L", k, entry, PAD + i * COL, y, { roundName: r.name, bestOf: r.bestOf, feeds });
    });
  });
  const lbBottom = lb.length ? lbTop + Math.max(1, lb[0]?.entries.length ?? 1) * PITCH : wbBottom;

  // Grande finale, au niveau de la finale des gagnants, après la dernière colonne.
  const cols = Math.max(n, lb.length);
  let last = final ? final.key : null;
  if (double && tournament.grandFinal && final) {
    const lbFinal = nodes.get(keyOf("L", lb.length, 0));
    add("G", 0, tournament.grandFinal.entry, PAD + cols * COL, final.y, {
      roundName: tournament.grandFinal.name ?? "Grande finale",
      bestOf: tournament.grandFinal.bestOf,
      feeds: [["W", n, 0, "winner"], ["L", lb.length, 0, "winner"]],
    });
    edges.push({ from: final.key, to: keyOf("G", 0, 0) });
    if (lbFinal) edges.push({ from: lbFinal.key, to: keyOf("G", 0, 0) });
    last = keyOf("G", 0, 0);
  }
  const lastNode = last ? nodes.get(last) : null;
  const champion = lastNode ? { x: lastNode.x + COL - 20, y: lastNode.y + CARD_H / 2 } : null;
  const width = (champion ? champion.x + CHAMP_W : PAD + cols * COL) + PAD;
  const thirdNode = nodes.get(keyOf("T", n, 0));
  const height = Math.max(lbBottom, wbBottom, thirdNode ? thirdNode.y + CARD_H + 40 : 0) + PAD;

  // Numéros de match dans l'ordre de jeu (cases réellement jouables).
  const ordered = [...nodes.values()]
    .filter((node) => node.entry.status !== "empty")
    .sort((a, b) => stepOf(a.bracket === "T" ? "W" : a.bracket, a.round, n) - stepOf(b.bracket === "T" ? "W" : b.bracket, b.round, n) || (a.bracket === "T") - (b.bracket === "T") || a.entry.slot - b.entry.slot);
  ordered.forEach((node, index) => (node.number = index + 1));

  return { nodes, edges, width, height, wbTop, lbTop: lb.length ? lbTop : null, n, lb, wb, double, last, champion, cols };
}

/**
 * Rencontres du tableau dans l'ordre de jeu, avec leur numéro (le même que sur le tableau), le nom du tour, le BO
 * et l'origine des cases vides : { key, bracket (W, L, G, T), round, number, roundName, bestOf, entry, waiting }.
 */
export function bracketMatches(tournament) {
  if (!tournament?.rounds?.length) return [];
  const { nodes } = layout(tournament);
  return [...nodes.values()]
    .filter((node) => node.number)
    .sort((a, b) => a.number - b.number)
    .map((node) => ({ ...node, waiting: [placeholder(node, nodes, 0), placeholder(node, nodes, 1)] }));
}

/** Coude arrondi entre la sortie d'une rencontre et l'entrée de la suivante. */
function elbow(x1, y1, x2, y2) {
  if (Math.abs(y1 - y2) < 1) return `M ${x1} ${y1} H ${x2}`;
  const xm = x1 + Math.min(34, (x2 - x1) / 2);
  const r = Math.min(10, Math.abs(y2 - y1) / 2);
  const dir = y2 > y1 ? 1 : -1;
  return `M ${x1} ${y1} H ${xm - r} Q ${xm} ${y1} ${xm} ${y1 + dir * r} V ${y2 - dir * r} Q ${xm} ${y2} ${xm + r} ${y2} H ${x2}`;
}

/** Nom du tour sans « Gagnants · » ni « Perdants · » (le titre de la section le dit déjà). */
const shortName = (name) => name.replace(/^(Gagnants|Perdants) · /, "").replace(/^./, (c) => c.toUpperCase());

const teamsOf = (entry) => [entry.teamA?.id, entry.teamB?.id].filter(Boolean);

export function BracketBoard({ tournament, myTeamId = null }) {
  const reduce = useReducedMotion();
  const map = useMemo(() => layout(tournament), [tournament]);
  const { nodes, edges, width, height } = map;
  const [hover, setHover] = useState(null);
  const [scale, setScale] = useState(1);
  const [full, setFull] = useState(false);
  const viewport = useRef(null);
  const frame = useRef(null);
  const drag = useRef(null);

  // Champion : vainqueur de la dernière rencontre jouée.
  const lastEntry = map.last ? nodes.get(map.last)?.entry : null;
  const championTeam = lastEntry?.status === "done" && lastEntry.winner ? [lastEntry.teamA, lastEntry.teamB].find((team) => team?.id === lastEntry.winner) : null;

  // Une liaison est « parcourue » par une équipe si elle a gagné la rencontre de départ et joue celle d'arrivée.
  const travelled = useCallback(
    (edge, teamId) => {
      if (!teamId) return false;
      const from = nodes.get(edge.from)?.entry;
      const to = nodes.get(edge.to)?.entry;
      return Boolean(from?.winner === teamId && to && teamsOf(to).includes(teamId));
    },
    [nodes],
  );
  const focus = hover ?? null;
  const involved = (entry, teamId) => Boolean(teamId && teamsOf(entry).includes(teamId));

  // Zoom de départ : voir plus bas (téléphone ou ordinateur).
  const fit = useCallback(() => {
    const box = viewport.current;
    if (!box) return;
    setScale(Math.max(0.35, Math.min(1, (box.clientWidth - 8) / width)));
  }, [width]);
  useEffect(() => {
    const box = viewport.current;
    if (!box) return;
    // Téléphone : 72 % (lisible), on fait glisser pour se déplacer ; ordinateur : ajusté entre 50 % et 100 %.
    setScale(box.clientWidth < 640 ? 0.72 : Math.max(0.5, Math.min(1, (box.clientWidth - 8) / width)));
  }, [width]);
  useEffect(() => {
    const box = viewport.current;
    if (!box) return undefined;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setScale((s) => Math.max(0.35, Math.min(1.6, s * (event.deltaY > 0 ? 0.9 : 1.1))));
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Déplacement à la souris (cliquer-glisser), sans gêner les clics sur les rencontres.
  const onPointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, left: viewport.current.scrollLeft, top: viewport.current.scrollTop, moved: false };
  };
  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x, dy = event.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    viewport.current.scrollLeft = d.left - dx;
    viewport.current.scrollTop = d.top - dy;
  };
  const onPointerUp = () => setTimeout(() => (drag.current = null), 0);
  const onClickCapture = (event) => {
    if (drag.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else frame.current?.requestFullscreen?.();
  };

  const colDelay = (node) => (reduce ? 0 : 0.05 + (node.x / COL) * 0.07);
  const sectionLabel = (y, text, color) => (
    <p className="absolute font-display text-lg font-black uppercase tracking-wide" style={{ left: PAD, top: y - HEAD, color }}>
      {text}
    </p>
  );
  const roundPills = (rounds, bracket, top) =>
    rounds.map((r, i) => (
      <div
        key={`${bracket}${r.round}`}
        className="clip-slant absolute flex items-center justify-between px-3 py-1 [--slant:8px]"
        style={{ left: PAD + i * COL, top: top - 22, width: CARD_W, background: PANEL }}
      >
        <span className="truncate font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">{shortName(r.name)}</span>
        <span className="font-tech text-[9px] font-bold tracking-[0.2em] text-gold">BO{r.bestOf}</span>
      </div>
    ));

  return (
    <div ref={frame} className={cn("relative border border-white/10 bg-ink/80", full && "flex h-full flex-col bg-ink")}>
      {/* Légende et commandes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 font-tech text-[10px] uppercase tracking-[0.18em] text-white/55">
          <li className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: LIVE }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: LIVE }} />
            </span>
            En cours
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: LATE }} />
            Retard
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: DISPUTE }} />
            Litige · arbitrage
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded" style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />
            Parcours du champion
          </li>
          {myTeamId ? (
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-gold" />
              Ton équipe
            </li>
          ) : null}
        </ul>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Dézoomer" onClick={() => setScale((s) => Math.max(0.35, s - 0.1))} className="grid h-8 w-8 place-items-center border border-white/10 text-white/70 hover:bg-white/10">
            <LuMinus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-tech text-[11px] text-white/60">{Math.round(scale * 100)} %</span>
          <button type="button" aria-label="Zoomer" onClick={() => setScale((s) => Math.min(1.6, s + 0.1))} className="grid h-8 w-8 place-items-center border border-white/10 text-white/70 hover:bg-white/10">
            <LuPlus className="h-4 w-4" />
          </button>
          <button type="button" onClick={fit} className="ml-1 flex h-8 items-center gap-1.5 border border-white/10 px-3 font-tech text-[10px] uppercase tracking-[0.18em] text-white/70 hover:bg-white/10">
            <LuScan className="h-3.5 w-3.5" />
            Ajuster
          </button>
          <button type="button" aria-label={full ? "Quitter le plein écran" : "Plein écran"} onClick={toggleFull} className="grid h-8 w-8 place-items-center border border-white/10 text-white/70 hover:bg-white/10">
            {full ? <LuShrink className="h-4 w-4" /> : <LuExpand className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        ref={viewport}
        style={{ background: STAGE }}
        className={cn("relative cursor-grab overflow-auto active:cursor-grabbing", full ? "flex-1" : "max-h-[78vh]")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <div style={{ width: width * scale, height: height * scale }}>
          <div className="relative origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
            {sectionLabel(map.wbTop, map.double ? "Tableau des gagnants" : "Tableau", undefined)}
            {roundPills(map.wb, "W", map.wbTop)}
            {map.lbTop ? (
              <>
                {sectionLabel(map.lbTop, "Tableau des perdants", "rgba(255,255,255,0.8)")}
                {roundPills(map.lb, "L", map.lbTop)}
              </>
            ) : null}
            {map.double && tournament.grandFinal ? (
              <div
                className="clip-slant absolute flex items-center justify-between px-3 py-1 [--slant:8px]"
                style={{ left: nodes.get(keyOf("G", 0, 0)).x, top: map.wbTop - 22, width: CARD_W, background: `${GOLD}22` }}
              >
                <span className="font-tech text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                  Grande finale
                </span>
                <span className="font-tech text-[9px] font-bold tracking-[0.2em]" style={{ color: GOLD }}>
                  BO{tournament.grandFinal.bestOf}
                </span>
              </div>
            ) : null}

            {/* Liaisons */}
            <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden>
              <defs>
                {/* Zone du filtre en coordonnées du tableau : une liaison horizontale (sans hauteur) garde sa lueur. */}
                <filter id="lueur-or" filterUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {edges.map((edge, index) => {
                const a = nodes.get(edge.from);
                const b = nodes.get(edge.to);
                if (!a || !b) return null;
                const d = elbow(a.x + CARD_W, a.y + CARD_H / 2, b.x, b.y + CARD_H / 2);
                const champ = championTeam && travelled(edge, championTeam.id);
                const hovered = focus && travelled(edge, focus);
                const mine = myTeamId && travelled(edge, myTeamId);
                const advanced = a.entry.status === "done" && a.entry.winner && teamsOf(b.entry).includes(a.entry.winner);
                const stroke = hovered ? "var(--color-gold)" : champ ? GOLD : mine ? "var(--color-gold)" : advanced ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)";
                return (
                  <g key={index}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={champ || hovered ? 2.5 : 1.5}
                      filter={champ || hovered ? "url(#lueur-or)" : undefined}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: focus && !hovered ? 0.35 : 1 }}
                      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.35 + (a.x / COL) * 0.08 }}
                    />
                    {champ && !reduce ? (
                      // Flux lumineux qui coule le long du parcours du champion.
                      <path d={d} fill="none" stroke="#fff6d5" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 26" className="bracket-flow" opacity={0.9} />
                    ) : null}
                  </g>
                );
              })}
              {/* Champion : liaison de la dernière rencontre vers la carte du champion */}
              {map.champion && map.last ? (
                <motion.path
                  d={elbow(nodes.get(map.last).x + CARD_W, map.champion.y, map.champion.x, map.champion.y)}
                  fill="none"
                  stroke={championTeam ? GOLD : "rgba(255,255,255,0.12)"}
                  strokeWidth={championTeam ? 2.5 : 1.5}
                  filter={championTeam ? "url(#lueur-or)" : undefined}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.9 }}
                />
              ) : null}
            </svg>

            {/* Rencontres */}
            {[...nodes.values()].map((node) => (
              <motion.div
                key={node.key}
                className="absolute"
                style={{ left: node.x, top: node.y, width: CARD_W }}
                initial={reduce ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: focus && !involved(node.entry, focus) ? 0.55 : 1, x: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, delay: colDelay(node) }}
              >
                {node.bracket === "T" ? (
                  <p className="absolute -top-6 left-0 font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                    {tournament.thirdPlace?.name ?? "Petite finale"} · BO{tournament.thirdPlace?.bestOf}
                  </p>
                ) : null}
                <MatchCard node={node} nodes={nodes} myTeamId={myTeamId} championId={championTeam?.id} focus={focus} onHover={setHover} grand={node.bracket === "G" || (!map.double && node.key === map.last)} />
              </motion.div>
            ))}

            {/* Carte du champion */}
            {map.champion ? (
              <motion.div
                className="absolute"
                style={{ left: map.champion.x, top: map.champion.y - 86, width: CHAMP_W }}
                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 1.1 }}
              >
                <ChampionCard team={championTeam} kind={tournament.kind} />
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-2 text-right font-tech text-[9px] uppercase tracking-[0.18em] text-white/35">
        <span className="md:hidden">Fais glisser pour te déplacer · touche un match pour l'ouvrir</span>
        <span className="hidden md:inline">Ctrl + molette pour zoomer · cliquer-glisser pour se déplacer · survole une équipe pour voir son parcours</span>
      </p>
    </div>
  );
}

/** Origine d'une case encore vide : « Vainqueur #13 », « Perdant #5 ». */
function placeholder(node, nodes, side) {
  const feed = node.feeds?.[side];
  if (!feed) return "À déterminer";
  const [bracket, round, slot, kind] = feed;
  const from = nodes.get(keyOf(bracket, round, slot));
  if (!from || from.entry.status === "empty") return "—";
  return `${kind === "winner" ? "Vainqueur" : "Perdant"} #${from.number ?? "?"}`;
}

function MatchCard({ node, nodes, myTeamId, championId, focus, onHover, grand }) {
  const { entry } = node;
  const live = entry.status === "playing";
  const blocked = entry.status === "blocked";
  // Litige : contestation, forfait déclaré ou rencontre bloquée (décision de l'équipe) ; retard : hôte sans code.
  const dispute = blocked || entry.dispute;
  const late = !dispute && entry.late;
  const done = entry.status === "done";
  const bye = done && (!entry.teamA || !entry.teamB);
  const hovered = Boolean(focus && [entry.teamA?.id, entry.teamB?.id].includes(focus));
  const row = (team, index) => {
    const won = done && team && entry.winner === team.id;
    const lost = done && team && !won;
    const mine = team && team.id === myTeamId;
    // Équipe survolée : sa ligne ressort (fond et nom de la couleur du mode) dans chacun de ses matchs.
    const picked = team && focus === team.id;
    return (
      <div
        className={cn("relative flex items-center gap-2 pl-3 pr-2.5 transition-colors", index === 0 && "border-b border-white/[0.07]", mine && "bg-gold/[0.12]", picked && "bg-gold/20")}
        style={{ height: ROW_H }}
        onMouseEnter={() => team && onHover(team.id)}
        onMouseLeave={() => onHover(null)}
      >
        {mine || picked ? <span className="absolute inset-y-0 left-0 w-0.5 bg-gold" /> : null}
        {team ? <TeamCrest team={team} size={20} /> : <span className="h-5 w-5 shrink-0 border border-dashed border-white/15" />}
        <span className={cn("min-w-0 flex-1 truncate text-[13px] font-semibold leading-none", team ? (lost ? "text-white/40" : "text-white") : "text-white/30 italic", won && "text-white", picked && "text-gold")}>
          {team ? team.name : placeholder(node, nodes, index)}
        </span>
        {team && team.id === championId && grand ? <LuCrown aria-label="Champion" className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} /> : null}
        <span className={cn("w-5 text-right font-tech text-sm font-bold tabular-nums", won ? "text-gold" : "text-white/40")}>
          {entry.score ? entry.score[index] : bye && team ? "✓" : ""}
        </span>
      </div>
    );
  };
  const border = dispute ? DISPUTE : late ? LATE : live ? LIVE : grand ? `${GOLD}aa` : null;
  const body = (
    <div
      className={cn("clip-tactical relative [--cut:10px]", entry.matchId && "transition-transform duration-200 hover:-translate-y-0.5")}
      style={{
        height: CARD_H,
        boxShadow: hovered
          ? "inset 0 0 0 1.5px var(--color-gold), 0 0 22px color-mix(in srgb, var(--color-gold) 45%, transparent)"
          : border
            ? `inset 0 0 0 1px ${border}, 0 0 18px ${border}33`
            : `inset 0 0 0 1px ${EDGE}`,
        background: PANEL,
      }}
    >
      {live ? <span className="bracket-sheen pointer-events-none absolute inset-0" aria-hidden /> : null}
      {row(entry.teamA, 0)}
      {row(entry.teamB, 1)}
    </div>
  );
  return (
    <div className="relative">
      {node.number ? (
        <span
          className="absolute -left-3 top-1/2 z-10 grid h-6 min-w-6 -translate-y-1/2 place-items-center border px-1 font-tech text-[9px] font-bold text-white/70"
          style={{ borderColor: live ? LIVE : "rgba(255,255,255,0.18)", background: STAGE }}
        >
          {node.number}
        </span>
      ) : null}
      {live || late || dispute || entry.decided ? (
        <span
          className="absolute -top-2 right-2 z-10 flex items-center gap-1 px-1.5 font-tech text-[8px] font-bold uppercase tracking-[0.2em]"
          style={{ background: STAGE, color: dispute || entry.decided ? DISPUTE : late ? LATE : LIVE }}
        >
          {live && !late && !dispute ? <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: LIVE }} /> : null}
          {blocked || entry.decided ? "Décision" : dispute ? "Litige" : late ? "Retard" : "Live"}
        </span>
      ) : null}
      {entry.matchId ? (
        <Link href={`/cod/equipes/match/${entry.matchId}`} className="block" draggable={false}>
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

const TROPHY = { horus: "/images/trophees/horus-or.png", anubis: "/images/trophees/anubis-or.png" };

function ChampionCard({ team, kind }) {
  const image = TROPHY[kind] ?? TROPHY.horus;
  return (
    <div className="clip-tactical relative overflow-hidden p-4 text-center [--cut:14px]" style={{ background: PANEL, boxShadow: `inset 0 0 0 1px ${team ? GOLD : "rgba(255,255,255,0.12)"}, 0 0 40px ${team ? `${GOLD}33` : "transparent"}` }}>
      {team ? <span className="bracket-sheen pointer-events-none absolute inset-0 opacity-60" aria-hidden /> : null}
      <img src={image} alt="" className={cn("mx-auto h-24 w-24 object-contain", !team && "opacity-25 grayscale")} draggable={false} />
      <p className="mt-1 font-tech text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
        Champion
      </p>
      {team ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <TeamCrest team={team} size={22} />
          <span className="truncate font-display text-xl font-black uppercase leading-none">{team.name}</span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-white/40">À conquérir</p>
      )}
    </div>
  );
}
