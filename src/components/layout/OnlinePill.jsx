import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuArrowRight, LuRadio, LuTrophy, LuUser } from "react-icons/lu";
import { api } from "../../lib/api";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { CountUp } from "../effects/CountUp";
import { NavPopover } from "./NavPopover";

const REFRESH_MS = 30_000;

/**
 * Activité du site : GET /cod/status (visiteurs, files du Classé) et GET /teams/status (Division), relus toutes les 30 s
 * et à chaque ouverture du panneau (reload), pour des chiffres à jour au moment où on regarde.
 */
function useActivity() {
  const [activity, setActivity] = useState(null);
  const load = useCallback(async () => {
    try {
      const [cod, teams] = await Promise.all([api("/cod/status"), MATCH_TEAM_ENABLED ? api("/teams/status").catch(() => null) : null]);
      setActivity({
        online: cod.siteOnline ?? cod.playersOnline ?? 0,
        // Files classées ouvertes (la file 1v1 de test n'est pas montrée).
        queues: (cod.queues ?? []).filter((queue) => queue.teamSize > 1),
        rankedMatches: cod.matchesInProgress ?? 0,
        teamsSearching: teams?.teamsSearching ?? 0,
        teamMatches: teams?.matchesInProgress ?? 0,
      });
    } catch {
      // Serveur en veille : on garde le dernier chiffre connu.
    }
  }, []);
  useEffect(() => {
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [load]);
  return [activity, load];
}

/** Prochaine coupe ou prochain tournoi prévu (GET /teams/cups), lu à l'ouverture du panneau ; null s'il n'y en a pas. */
function useNextCup(open) {
  const [cup, setCup] = useState(null);
  useEffect(() => {
    if (!open || !MATCH_TEAM_ENABLED) return;
    api("/teams/cups").then((result) => setCup((result.upcoming ?? []).find((item) => item.status === "scheduled") ?? null), () => {});
  }, [open]);
  return cup;
}

/** « samedi · 21 h 00 » dans les 6 jours, sinon « 12 déc. · 21 h 00 » (heure de Paris). */
function cupDate(iso) {
  const date = new Date(iso);
  const near = date.getTime() - Date.now() < 6 * 86_400_000;
  const day = date.toLocaleDateString("fr-FR", near ? { weekday: "long", timeZone: "Europe/Paris" } : { day: "numeric", month: "short", timeZone: "Europe/Paris" });
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).replace(":", " h ");
  return `${day} · ${time}`;
}

/** Bande « prochain rendez-vous » sous les cartes, aux couleurs du Tournoi : nom, date, places prises. */
function NextCup({ cup }) {
  const unit = cup.kind === "anubis" ? "joueurs" : "équipes";
  return (
    <Link href={`/cod/tournoi?id=${cup.id}`} className="group mx-2 mb-2 flex items-center gap-3 border border-[#e5484d]/35 bg-[#e5484d]/[0.08] px-3 py-2 transition-colors hover:bg-[#e5484d]/[0.16]">
      <LuTrophy aria-hidden className="h-5 w-5 shrink-0 text-[#f87171]" style={{ filter: "drop-shadow(0 0 6px #e5484d)" }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-black uppercase tracking-[0.08em] text-white">{cup.name}</span>
        <span className="block text-[11px] text-white/60">
          {cupDate(cup.startsAt)} · {cup.registered}/{cup.capacity} {unit}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#f87171] group-hover:text-white">
        S&apos;inscrire
        <LuArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Points d'une file active : un point par place, allumés pour les joueurs (ou équipes) qui attendent. */
function QueueDots({ label, size, needed, color }) {
  return (
    <span className="flex items-center gap-1.5" title={`${label} : ${size} sur ${needed}`}>
      <span className="min-w-8 shrink-0 font-tech text-[9px] font-bold uppercase tracking-[0.12em] text-white/80">{label}</span>
      <span aria-hidden className="flex flex-wrap gap-[3px]">
        {Array.from({ length: needed }, (_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full transition-all duration-500" style={index < size ? { background: color, boxShadow: `0 0 6px ${color}` } : { background: "rgba(255,255,255,0.15)" }} />
        ))}
      </span>
      <span className="sr-only">
        {size} sur {needed}
      </span>
    </span>
  );
}

/** Files actives d'un mode (points), ou « Personne en file ». */
function ActiveQueues({ mode }) {
  return mode.queues.length > 0 ? (
    <span className="flex flex-col items-start space-y-0.5">
      {mode.queues.map((queue) => (
        <QueueDots key={queue.label} {...queue} color={mode.color} />
      ))}
    </span>
  ) : (
    <span className="block text-center text-[11px] text-white/40">Personne en file</span>
  );
}

/** Chiffre animé dans la couleur du mode. */
function Figure({ value, color, className = "text-2xl" }) {
  return (
    <span className={`block font-display font-black leading-none tabular-nums ${className}`} style={{ color, textShadow: `0 0 14px ${color}55` }}>
      <CountUp value={value} duration={700} />
    </span>
  );
}

/**
 * Cartes (version actuelle) : un mode par carte, même taille, fond sombre uni et filet du mode en haut :
 * nom, chiffres en couleur du mode (en file, en cours), files actives, bouton Jouer.
 */
function ModeCard({ mode }) {
  const c = mode.color;
  return (
    <Link href={mode.href} className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25 hover:bg-white/[0.06]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
      <span className="relative px-3 pt-2.5 text-center font-display text-base font-black uppercase tracking-[0.12em]" style={{ color: c, textShadow: `0 0 14px ${c}88` }}>
        {mode.label}
      </span>
      <span className="relative mt-auto block space-y-2 px-3 pb-2.5">
        <span className="grid grid-cols-2 gap-2">
          {[
            [mode.waiting, "en file"],
            [mode.matches, "en cours"],
          ].map(([value, label]) => (
            <span key={label} className="text-center">
              <Figure value={value} color={c} />
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</span>
            </span>
          ))}
        </span>
        <span className="flex h-[3.4rem] flex-col items-center justify-center overflow-hidden">
          <ActiveQueues mode={mode} />
        </span>
        <span className="flex items-center justify-center gap-1.5 border-t border-white/15 pt-2 text-xs font-semibold text-white/80 group-hover:text-white">
          {mode.cta}
          <LuArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: c }} />
        </span>
      </span>
    </Link>
  );
}

/** Remplissage du mode (0 à 1) : la file la plus proche de lancer un match. */
const fillOf = (mode) => mode.queues.reduce((best, queue) => Math.max(best, queue.size / queue.needed), 0);

/** D1 · Anneaux : un anneau de progression par mode, rempli comme la file la plus avancée, chiffre en file au centre. */
function RingsModule({ modes }) {
  const R = 38;
  const L = 2 * Math.PI * R;
  return (
    <div className="grid grid-cols-2 gap-1 px-2 py-3">
      {modes.map((mode) => (
        <Link key={mode.key} href={mode.href} className="group flex flex-col items-center gap-2 py-1 transition-colors hover:bg-white/[0.04]">
          <span className="relative h-24 w-24">
            <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle
                cx="48"
                cy="48"
                r={R}
                fill="none"
                stroke={mode.color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={L}
                strokeDashoffset={L * (1 - fillOf(mode))}
                style={{ filter: `drop-shadow(0 0 6px ${mode.color})`, transition: "stroke-dashoffset 700ms ease" }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-center">
              <span>
                <Figure value={mode.waiting} color={mode.color} className="text-3xl" />
                <span className="block text-[9px] uppercase tracking-[0.16em] text-white/50">en file</span>
              </span>
            </span>
          </span>
          <span className="font-display text-sm font-black uppercase tracking-[0.14em]" style={{ color: mode.color }}>
            {mode.label}
          </span>
          <span className="text-[11px] text-white/55">
            <span className="font-semibold tabular-nums" style={{ color: mode.color }}>
              {mode.matches}
            </span>{" "}
            {mode.matches > 1 ? "matchs en cours" : "match en cours"}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-white/75 group-hover:text-white">
            Jouer
            <LuArrowRight aria-hidden className="h-3.5 w-3.5" style={{ color: mode.color }} />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** D2 · Onglets : un seul mode affiché à la fois, en grand ; onglets Classé / Division en haut. */
function TabsModule({ modes }) {
  const [current, setCurrent] = useState(modes[0]?.key);
  const mode = modes.find((item) => item.key === current) ?? modes[0];
  return (
    <div>
      <div role="tablist" aria-label="Mode" className="grid grid-cols-2 border-b border-white/10">
        {modes.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === mode.key}
            onClick={() => setCurrent(item.key)}
            className="border-b-2 py-2.5 font-display text-sm font-black uppercase tracking-[0.14em] transition-colors"
            style={item.key === mode.key ? { color: item.color, borderColor: item.color } : { color: "rgba(255,255,255,0.45)", borderColor: "transparent" }}
          >
            {item.label}
            {item.waiting ? <span className="ml-2 font-tech text-[10px]">{item.waiting}</span> : null}
          </button>
        ))}
      </div>
      <div className="px-4 py-4">
        <div className="flex items-end justify-center gap-10">
          {[
            [mode.waiting, "en file"],
            [mode.matches, "en cours"],
          ].map(([value, label]) => (
            <span key={label} className="text-center">
              <Figure value={value} color={mode.color} className="text-5xl" />
              <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-white/50">{label}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 flex min-h-[2.5rem] justify-center">
          <ActiveQueues mode={mode} />
        </div>
        <Link
          href={mode.href}
          className="clip-slant mt-3 flex w-full items-center justify-center gap-2 py-2.5 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:12px]"
          style={{ background: mode.color }}
        >
          {mode.cta}
          <LuArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/** Niveau d'activité de 0 à 4 barres : personne, quelqu'un en file, file bien remplie, match en cours. */
const levelOf = (mode) => (mode.matches > 0 ? 4 : fillOf(mode) >= 0.5 ? 3 : mode.waiting > 0 ? 2 : 0);

/** D3 · Signal : une ligne compacte par mode, barres de signal selon l'activité, chiffres en ligne, bouton à droite. */
function SignalModule({ modes }) {
  return (
    <ul className="divide-y divide-white/[0.06]">
      {modes.map((mode) => {
        const level = levelOf(mode);
        return (
          <li key={mode.key}>
            <Link href={mode.href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]">
              <span aria-hidden className="flex h-6 items-end gap-[3px]">
                {[8, 12, 17, 22].map((height, index) => (
                  <span
                    key={height}
                    className="w-[5px] transition-colors duration-500"
                    style={index < level ? { height, background: mode.color, boxShadow: `0 0 6px ${mode.color}` } : { height, background: "rgba(255,255,255,0.12)" }}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-black uppercase tracking-[0.14em]" style={{ color: mode.color }}>
                  {mode.label}
                </span>
                <span className="flex items-baseline gap-3 text-[11px] text-white/50">
                  <span>
                    <span className="font-display text-lg font-black tabular-nums" style={{ color: mode.color }}>
                      <CountUp value={mode.waiting} duration={700} />
                    </span>{" "}
                    en file
                  </span>
                  <span>
                    <span className="font-display text-lg font-black tabular-nums" style={{ color: mode.color }}>
                      <CountUp value={mode.matches} duration={700} />
                    </span>{" "}
                    en cours
                  </span>
                </span>
              </span>
              <span className="clip-slant shrink-0 px-3 py-1.5 font-display text-xs font-black uppercase tracking-[0.12em] text-ink [--slant:7px]" style={{ background: mode.color }}>
                Jouer
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** E1 · Tableau de score : deux moitiés façon écran de stade, gros chiffres HUD, séparateur central. */
function ScoreboardModule({ modes }) {
  const [left, right] = modes;
  const Side = ({ mode, align }) => (
    <Link href={mode.href} className={`group flex flex-1 flex-col gap-1 px-3 py-3 transition-colors hover:bg-white/[0.04] ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <span className="font-display text-xs font-black uppercase tracking-[0.2em]" style={{ color: mode.color }}>
        {mode.label}
      </span>
      <span className="font-tech text-4xl font-bold leading-none tabular-nums" style={{ color: mode.color, textShadow: `0 0 18px ${mode.color}88` }}>
        {String(mode.waiting).padStart(2, "0")}
      </span>
      <span className="font-tech text-[8px] uppercase tracking-[0.26em] text-white/45">en file</span>
      <span className="mt-1 text-[11px] text-white/55">
        <span className="font-semibold tabular-nums text-white">{mode.matches}</span> en cours
      </span>
      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
        Jouer
        <LuArrowRight aria-hidden className="h-3.5 w-3.5" style={{ color: mode.color }} />
      </span>
    </Link>
  );
  return (
    <div className="m-2 flex items-stretch border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]">
      {left ? <Side mode={left} align="left" /> : null}
      <span className="flex flex-col items-center justify-center gap-1 px-1">
        <span className="h-8 w-px bg-linear-to-b from-transparent via-white/30 to-transparent" />
        <span className="font-tech text-[9px] tracking-[0.2em] text-white/35">LIVE</span>
        <span className="h-8 w-px bg-linear-to-b from-transparent via-white/30 to-transparent" />
      </span>
      {right ? <Side mode={right} align="right" /> : null}
    </div>
  );
}

/** E2 · Répartition : une seule barre qui montre qui fait quoi (en file par mode, en match), légende et deux boutons. */
function SplitModule({ modes }) {
  const parts = modes.map((mode) => ({ key: mode.key, label: `${mode.label} · en file`, value: mode.waiting, color: mode.color }));
  const matches = modes.reduce((sum, mode) => sum + mode.matches, 0);
  parts.push({ key: "match", label: "Matchs en cours", value: matches, color: "#e7c05a" });
  const total = Math.max(parts.reduce((sum, part) => sum + part.value, 0), 1);
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex h-3 overflow-hidden bg-white/[0.08]" role="img" aria-label="Répartition de l'activité">
        {parts.map((part) =>
          part.value ? <span key={part.key} className="h-full transition-[width] duration-700" style={{ width: `${(part.value / total) * 100}%`, background: part.color, boxShadow: `0 0 8px ${part.color}` }} /> : null,
        )}
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {parts.map((part) => (
          <li key={part.key} className="text-center">
            <span className="block font-display text-2xl font-black leading-none tabular-nums" style={{ color: part.color }}>
              <CountUp value={part.value} duration={700} />
            </span>
            <span className="mt-1 block text-[10px] leading-tight text-white/50">{part.label}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => (
          <Link key={mode.key} href={mode.href} className="clip-slant flex items-center justify-center gap-1.5 py-2 font-display text-xs font-black uppercase tracking-[0.12em] text-ink [--slant:9px]" style={{ background: mode.color }}>
            {mode.label}
            <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/** E3 · Files actives : uniquement les files où quelqu'un attend, une ligne chacune ; sinon un message et deux boutons. */
function FormatsModule({ modes }) {
  const rows = modes.flatMap((mode) => mode.queues.map((queue) => ({ ...queue, mode })));
  return (
    <div className="px-3 py-3">
      {rows.length === 0 ? (
        <p className="py-3 text-center text-sm text-white/55">Toutes les files sont vides : lance la première recherche.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={`${row.mode.key}-${row.label}`}>
              <Link href={row.mode.href} className="flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.07]" style={{ borderColor: row.mode.color }}>
                <span className="w-16 shrink-0">
                  <span className="block font-display text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: row.mode.color }}>
                    {row.mode.label}
                  </span>
                  <span className="block font-tech text-xs font-bold uppercase text-white">{row.label}</span>
                </span>
                <span aria-hidden className="flex flex-1 flex-wrap gap-[3px]">
                  {Array.from({ length: row.needed }, (_, index) => (
                    <span key={index} className="h-2 w-2 rounded-full" style={index < row.size ? { background: row.mode.color, boxShadow: `0 0 6px ${row.mode.color}` } : { background: "rgba(255,255,255,0.15)" }} />
                  ))}
                </span>
                <LuArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-white/50" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
        {modes.map((mode) => (
          <Link key={mode.key} href={mode.href} className="text-center text-[11px] text-white/55 hover:text-white">
            <span className="font-display text-base font-black tabular-nums" style={{ color: mode.color }}>
              {mode.matches}
            </span>{" "}
            {mode.matches > 1 ? "matchs" : "match"} en cours · {mode.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** F1 · Radar : un écran radar qui balaie, un point par joueur (ou équipe) en file, dans la couleur de son mode. */
function RadarModule({ modes }) {
  const blips = modes.flatMap((mode, m) =>
    Array.from({ length: Math.min(mode.waiting, 24) }, (_, i) => {
      // Position stable (pas d'aléatoire) : angle et distance dérivés de l'index.
      const angle = (i * 137.5 + m * 61) % 360;
      const radius = 18 + ((i * 23 + m * 11) % 52);
      return { key: `${mode.key}-${i}`, color: mode.color, x: 80 + radius * Math.cos((angle * Math.PI) / 180), y: 80 + radius * Math.sin((angle * Math.PI) / 180) };
    }),
  );
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <svg viewBox="0 0 160 160" className="h-36 w-36 shrink-0" aria-hidden>
        <defs>
          <radialGradient id="radar-fond" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.10)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.02)" />
          </radialGradient>
          <linearGradient id="radar-balayage" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(231,192,90,0)" />
            <stop offset="100%" stopColor="rgba(231,192,90,0.35)" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="url(#radar-fond)" stroke="rgba(255,255,255,0.12)" />
        {[52, 28].map((r) => (
          <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" />
        ))}
        <path d="M80 4V156M4 80H156" stroke="rgba(255,255,255,0.06)" />
        <g className="origin-center animate-[spin_4s_linear_infinite] motion-reduce:animate-none" style={{ transformOrigin: "80px 80px" }}>
          <path d="M80 80 L156 80 A76 76 0 0 0 133.7 26.3 Z" fill="url(#radar-balayage)" />
        </g>
        {blips.map((blip) => (
          <circle key={blip.key} cx={blip.x} cy={blip.y} r="3" fill={blip.color} style={{ filter: `drop-shadow(0 0 4px ${blip.color})` }} />
        ))}
        <circle cx="80" cy="80" r="2.5" fill="#e7c05a" />
      </svg>
      <ul className="min-w-0 flex-1 space-y-3">
        {modes.map((mode) => (
          <li key={mode.key}>
            <Link href={mode.href} className="group block">
              <span className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-[0.14em]" style={{ color: mode.color }}>
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: mode.color, boxShadow: `0 0 6px ${mode.color}` }} />
                {mode.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-white/55">
                <span className="font-display text-lg font-black tabular-nums" style={{ color: mode.color }}>
                  <CountUp value={mode.waiting} duration={700} />
                </span>{" "}
                en file ·{" "}
                <span className="font-semibold tabular-nums text-white">{mode.matches}</span> en cours
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
                Jouer
                <LuArrowRight aria-hidden className="h-3.5 w-3.5" style={{ color: mode.color }} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** F2 · Lobby : pour chaque mode, la file la plus remplie dessinée comme un salon de jeu (une case par place). */
function LobbyModule({ modes }) {
  return (
    <div className="space-y-3 px-4 py-4">
      {modes.map((mode) => {
        const hottest = [...mode.queues].sort((a, b) => b.size / b.needed - a.size / a.needed)[0];
        return (
          <Link key={mode.key} href={mode.href} className="group block">
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-display text-sm font-black uppercase tracking-[0.14em]" style={{ color: mode.color }}>
                {mode.label}
                {hottest ? <span className="ml-2 font-tech text-[10px] text-white/70">{hottest.label}</span> : null}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
                Jouer
                <LuArrowRight aria-hidden className="h-3.5 w-3.5" style={{ color: mode.color }} />
              </span>
            </span>
            {hottest ? (
              <span className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: hottest.needed }, (_, index) => {
                  const taken = index < hottest.size;
                  return (
                    <span
                      key={index}
                      className="grid h-8 w-8 place-items-center border"
                      style={taken ? { borderColor: mode.color, background: `${mode.color}22`, boxShadow: `0 0 8px ${mode.color}55` } : { borderColor: "rgba(255,255,255,0.12)", borderStyle: "dashed" }}
                    >
                      {taken ? <LuUser aria-hidden className="h-3.5 w-3.5" style={{ color: mode.color }} /> : null}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span className="mt-2 block border border-dashed border-white/12 py-2 text-center text-[11px] text-white/40">Salon vide : sois le premier</span>
            )}
            <span className="mt-1.5 block text-[11px] text-white/45">
              <span className="font-semibold tabular-nums" style={{ color: mode.color }}>
                {mode.matches}
              </span>{" "}
              {mode.matches > 1 ? "matchs en cours" : "match en cours"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** F3 · Jouer maintenant : un seul gros bouton vers la file la plus proche de lancer un match, le reste en petit. */
function PlayNowModule({ modes }) {
  const candidates = modes.flatMap((mode) => mode.queues.map((queue) => ({ mode, queue, fill: queue.size / queue.needed })));
  const best = candidates.sort((a, b) => b.fill - a.fill)[0];
  const target = best ? best.mode : modes[0];
  return (
    <div className="space-y-3 px-4 py-4">
      <Link
        href={target.href}
        className="clip-tactical group relative block overflow-hidden px-4 py-4 text-center [--cut:14px]"
        style={{ background: `linear-gradient(135deg, ${target.color}33, ${target.color}0d)`, boxShadow: `inset 0 0 0 1px ${target.color}55` }}
      >
        <span className="block font-tech text-[9px] uppercase tracking-[0.3em] text-white/60">{best ? "La file la plus proche d'un match" : "Lance la première recherche"}</span>
        <span className="mt-1 block font-display text-2xl font-black uppercase tracking-[0.06em]" style={{ color: target.color, textShadow: `0 0 16px ${target.color}88` }}>
          {best ? `${target.label} · ${best.queue.label}` : target.label}
        </span>
        {best ? (
          <span aria-hidden className="mx-auto mt-2 flex w-fit gap-[3px]">
            {Array.from({ length: best.queue.needed }, (_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full" style={index < best.queue.size ? { background: target.color, boxShadow: `0 0 6px ${target.color}` } : { background: "rgba(255,255,255,0.18)" }} />
            ))}
          </span>
        ) : null}
        <span className="clip-slant mx-auto mt-3 flex w-fit items-center gap-2 px-5 py-2 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:10px]" style={{ background: target.color }}>
          Jouer maintenant
          <LuArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
      <div className="grid grid-cols-2 gap-2 text-center">
        {modes.map((mode) => (
          <Link key={mode.key} href={mode.href} className="border border-white/10 py-2 transition-colors hover:bg-white/[0.04]">
            <span className="block font-display text-xs font-black uppercase tracking-[0.14em]" style={{ color: mode.color }}>
              {mode.label}
            </span>
            <span className="block text-[11px] text-white/55">
              <span className="font-semibold tabular-nums text-white">{mode.waiting}</span> en file · <span className="font-semibold tabular-nums text-white">{mode.matches}</span> en cours
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Corps du panneau selon le module choisi (TEMPORAIRE : comparaison ; « cartes » = version actuelle). */
function ActivityModules({ look, modes }) {
  if (look === "score") return <ScoreboardModule modes={modes} />;
  if (look === "radar") return <RadarModule modes={modes} />;
  if (look === "lobby") return <LobbyModule modes={modes} />;
  if (look === "maintenant") return <PlayNowModule modes={modes} />;
  if (look === "repartition") return <SplitModule modes={modes} />;
  if (look === "files") return <FormatsModule modes={modes} />;
  if (look === "anneaux") return <RingsModule modes={modes} />;
  if (look === "onglets") return <TabsModule modes={modes} />;
  if (look === "signal") return <SignalModule modes={modes} />;
  return (
    <ul className="grid grid-cols-2 gap-2 p-2">
      {modes.map((mode) => (
        <li key={mode.key}>
          <ModeCard mode={mode} />
        </li>
      ))}
    </ul>
  );
}

/** Antenne « N » (personnes en ligne) de la barre du haut ; au clic, ce qui se passe en ce moment avec des liens. */
export function OnlinePill() {
  const [activity, reload] = useActivity();
  const [open, setOpen] = useState(false);
  const nextCup = useNextCup(open);
  // TEMPORAIRE (comparaison des modules, à retirer) : ?style=cartes|anneaux|onglets|signal.
  const [look, setLook] = useState("cartes");
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("style");
    if (asked) setLook(asked);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const { asPath } = useRouter();
  useEffect(close, [asPath, close]);

  if (!activity) return null;
  const modes = [
    {
      key: "classe",
      label: "Classé",
      color: "#34d399",
      href: "/cod/ranked",
      cta: "Jouer en Classé",
      waiting: activity.queues.reduce((sum, queue) => sum + queue.size, 0),
      matches: activity.rankedMatches,
      // Seulement les files où quelqu'un attend.
      queues: activity.queues.filter((queue) => queue.size > 0).map((queue) => ({ label: queue.label, size: queue.size, needed: queue.needed })),
    },
    ...(MATCH_TEAM_ENABLED
      ? [
          {
            key: "division",
            label: "Division",
            color: "#22d3ee",
            href: "/cod/division",
            cta: "Jouer en Division",
            waiting: activity.teamsSearching,
            matches: activity.teamMatches,
            // Deux équipes en recherche suffisent pour un match.
            queues: activity.teamsSearching > 0 ? [{ label: "Équipes", size: activity.teamsSearching, needed: 2 }] : [],
          },
        ]
      : []),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          // Chiffres relus à l'ouverture : à jour au moment où on regarde.
          if (!open) reload();
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-label={`${activity.online} en ligne : voir l'activité du site`}
        title="Personnes sur le site"
        className="flex h-9 items-center gap-1.5 border-b border-transparent px-2 transition-colors hover:border-gold"
      >
        {/* Antenne verte qui émet et chiffre, sur ordinateur comme sur téléphone. */}
        <span aria-hidden className="relative grid place-items-center">
          <LuRadio className="h-[18px] w-[18px] text-win" />
          <span className="absolute inset-0 animate-ping rounded-full bg-win/20 motion-reduce:animate-none" />
        </span>
        <span className="font-display text-lg font-black tabular-nums text-white">{activity.online.toLocaleString("fr-FR")}</span>
      </button>

      <NavPopover open={open} onClose={close} label="Activité du site" className="sm:w-[23rem]">
        {/* En-tête : personnes en ligne en grand, antenne qui pulse. */}
        <div className="border-b border-white/10 px-4 py-2.5 text-center">
          <span className="block font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">En ce moment</span>
          <span className="mt-0.5 flex items-center justify-center gap-2">
            <span aria-hidden className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-win/10">
              <span className="absolute inset-0 animate-ping rounded-full bg-win/15 motion-reduce:animate-none" />
              <LuRadio className="relative h-4 w-4 text-win" />
            </span>
            <span className="font-display text-2xl font-black leading-none tabular-nums text-white">
              <CountUp value={activity.online} duration={700} />
            </span>
            <span className="text-sm text-white/60">{activity.online > 1 ? "personnes sur le site" : "personne sur le site"}</span>
          </span>
        </div>
        {/* Corps du panneau : module choisi (cartes par défaut). */}
        <ActivityModules look={look} modes={modes} />
        {/* Prochain rendez-vous (coupe ou tournoi prévu), seulement s'il y en a un. */}
        {nextCup ? <NextCup cup={nextCup} /> : null}
      </NavPopover>
    </div>
  );
}
