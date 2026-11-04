import { useCallback, useEffect, useRef, useState } from "react";
import { LuCheck, LuFlag, LuImagePlus, LuLoaderCircle, LuTrash2, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

const HEAD = ["Score", "Élim.", "Poses", "Désam."];

/** Lignes d'une map, équipe par équipe, meilleur score d'abord. */
function StatsTable({ rows, players }) {
  const name = (id) => players.find((player) => player.id === id)?.username ?? "Joueur";
  const sideOf = (id) => players.find((player) => player.id === id)?.side;
  return (
    <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
      {["A", "B"].map((side) => {
        const list = rows.filter((row) => sideOf(row.userId) === side);
        return list.length ? (
          <table key={side} className="w-full text-sm tabular-nums">
            <thead className="font-tech text-[9px] uppercase tracking-[0.14em] text-white/40">
              <tr>
                <th scope="col" className="py-1.5 text-left font-normal">Joueur</th>
                {HEAD.map((label) => (
                  <th key={label} scope="col" className="py-1.5 text-right font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.userId} className="border-t border-white/5">
                  <th scope="row" className="max-w-[9rem] truncate py-1.5 text-left font-normal text-white/80">{name(row.userId)}</th>
                  <td className="py-1.5 text-right">{row.score}</td>
                  <td className="py-1.5 text-right font-semibold">{row.kills}</td>
                  <td className="py-1.5 text-right">{row.plants}</td>
                  <td className="py-1.5 text-right">{row.defuses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null;
      })}
    </div>
  );
}

/** Résultat de la lecture : le joueur vérifie d'un coup d'œil et valide. Il ne tape rien. */
function Preview({ reading, players, pending, onChoose, onConfirm, onCancel }) {
  const usable = reading.rows.filter((row) => row.readable && row.userId);
  const free = players.filter((player) => !reading.rows.some((row) => row.userId === player.id));
  const unknown = reading.rows.filter((row) => row.readable && !row.userId);
  const unreadable = reading.rows.filter((row) => !row.readable).length;

  return (
    <div className="space-y-4 border border-gold/30 bg-gold/[0.04] p-4">
      <p className="text-sm font-semibold text-white/85">Vérifie, puis valide.</p>
      <StatsTable rows={usable} players={players} />
      {unknown.map((row) => (
        <label key={`${row.column}-${row.score}-${row.kills}`} className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span>
            Joueur non reconnu ({row.score} pts, {row.kills} élim.) :
          </span>
          <select className="border border-white/15 bg-ink px-2 py-1.5 text-sm" defaultValue="" onChange={(event) => onChoose(row, event.target.value)}>
            <option value="">Choisir…</option>
            {free.map((player) => (
              <option key={player.id} value={player.id}>{player.username}</option>
            ))}
          </select>
        </label>
      ))}
      {unreadable ? <p className="text-xs text-white/50">{unreadable > 1 ? `${unreadable} lignes illisibles ne seront pas enregistrées.` : "Une ligne illisible ne sera pas enregistrée."}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onConfirm} disabled={pending || usable.length === 0}>
          {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
          Valider
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={pending}>
          <LuX aria-hidden className="h-4 w-4" />
          Annuler
        </Button>
      </div>
    </div>
  );
}

/**
 * Stats du match, lues sur la capture de fin de match (lib/scoreboard.js) : le joueur dépose sa capture, le site la
 * lit dans le navigateur, il valide d'un clic. `kind` : classe ou division. `initial` : aperçu.
 */
export function MatchStats({ kind, matchId, initial = null }) {
  const [data, setData] = useState(initial);
  const [mapNo, setMapNo] = useState(1);
  const [reading, setReading] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [reported, setReported] = useState(false);
  const input = useRef(null);

  const load = useCallback(() => {
    if (initial) return;
    api(`/cod/stats/${kind}/${matchId}`).then(setData, () => setData(null));
  }, [kind, matchId, initial]);
  useEffect(load, [load]);

  if (!data?.completed) return null;
  const mapRows = (no) => data.rows.filter((row) => row.mapNo === no);
  const hasAny = data.rows.length > 0;
  const missingMaps = Array.from({ length: data.maps }, (_, index) => index + 1).filter((no) => mapRows(no).length === 0);
  if (!hasAny && !data.canSubmit) return null;
  const target = missingMaps.includes(mapNo) ? mapNo : missingMaps[0];

  async function pick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setReading(null);
    setProgress("Lecture de la capture…");
    try {
      const { readScoreboard } = await import("../../lib/scoreboard");
      const result = await readScoreboard(file, data.players, setProgress);
      if (!result || result.rows.length === 0) setError("Tableau introuvable : envoie une capture du tableau des scores en entier.");
      else setReading(result);
    } catch {
      setError("Lecture impossible. Réessaie avec une autre capture.");
    } finally {
      setProgress(null);
    }
  }

  const choose = (row, userId) =>
    setReading((current) => ({ ...current, rows: current.rows.map((item) => (item === row ? { ...item, userId: userId || null } : item)) }));

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const rows = reading.rows.filter((row) => row.readable && row.userId).map(({ userId, score, kills, plants, defuses }) => ({ userId, score, kills, plants, defuses }));
      setData(await api(`/cod/stats/${kind}/${matchId}`, { method: "POST", body: { mapNo: target, rows } }));
      setReading(null);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  async function report() {
    setError(null);
    try {
      await api(`/cod/stats/${kind}/${matchId}/report`, { method: "POST", body: {} });
      setReported(true);
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function remove(no) {
    if (!window.confirm(`Retirer les stats de la map ${no} ?`)) return;
    setError(null);
    try {
      setData(await api(`/cod/stats/${kind}/${matchId}/${no}`, { method: "DELETE" }));
    } catch (caught) {
      setError(caught.message);
    }
  }

  return (
    <TacticalCard cut={18} innerClassName="space-y-5 p-5 sm:p-6">
      <div>
        <Eyebrow>Stats du match</Eyebrow>
        <p className="mt-2 text-sm text-white/55">Score, éliminations, poses et désamorçages, lus sur la capture de fin de match.</p>
      </div>

      {Array.from({ length: data.maps }, (_, index) => index + 1)
        .filter((no) => mapRows(no).length > 0)
        .map((no) => (
          <div key={no} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              {data.maps > 1 ? <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-gold">Map {no}</p> : <span />}
              {data.canRemove ? (
                <button type="button" onClick={() => remove(no)} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-loss">
                  <LuTrash2 aria-hidden className="h-3.5 w-3.5" />
                  Retirer
                </button>
              ) : null}
            </div>
            <StatsTable rows={mapRows(no)} players={data.players} />
          </div>
        ))}

      {error ? <Notice tone="error">{error}</Notice> : null}

      {reading ? (
        <Preview reading={reading} players={data.players} pending={pending} onChoose={choose} onConfirm={confirm} onCancel={() => setReading(null)} />
      ) : data.canSubmit && missingMaps.length ? (
        <div className="flex flex-wrap items-center gap-3">
          {missingMaps.length > 1 ? (
            <div className="flex gap-1.5" role="group" aria-label="Map de la capture">
              {missingMaps.map((no) => (
                <button key={no} type="button" aria-pressed={target === no} onClick={() => setMapNo(no)} className={cn("border px-3 py-2 text-xs", target === no ? "border-gold text-gold" : "border-white/15 text-white/55 hover:text-white")}>
                  Map {no}
                </button>
              ))}
            </div>
          ) : null}
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pick} />
          <Button size="sm" onClick={() => input.current?.click()} disabled={Boolean(progress)}>
            {progress ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
            {progress ?? "Ajouter la capture de fin de match"}
          </Button>
        </div>
      ) : null}

      {hasAny && data.canReport ? (
        reported ? (
          <p className="text-xs text-white/50">Signalement envoyé à l&apos;équipe.</p>
        ) : (
          <button type="button" onClick={report} className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white">
            <LuFlag aria-hidden className="h-3.5 w-3.5" />
            Signaler une erreur
          </button>
        )
      ) : null}
    </TacticalCard>
  );
}

/** Bilan des stats de capture sur le profil (GET /cod/players/:id/stats) : rien tant qu'aucune capture n'est validée. */
export function PlayerCaptureStats({ playerId, initial = null }) {
  const [stats, setStats] = useState(initial);
  useEffect(() => {
    if (initial) return undefined;
    let alive = true;
    api(`/cod/players/${playerId}/stats`).then((result) => alive && setStats(result), () => {});
    return () => {
      alive = false;
    };
  }, [playerId, initial]);
  if (!stats?.maps) return null;
  const tiles = [
    ["Élim. par map", stats.avgKills],
    ["Score moyen", stats.avgScore],
    ["Poses", stats.plants],
    ["Désamorçages", stats.defuses],
    ["Record d'élim.", stats.bestKills],
  ];
  return (
    <section aria-labelledby="titre-stats-capture">
      <Eyebrow>Sur le terrain</Eyebrow>
      <h2 id="titre-stats-capture" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Stats de la saison
      </h2>
      <p className="mt-2 text-sm text-white/55">
        Sur {stats.maps} map{stats.maps > 1 ? "s" : ""} enregistrée{stats.maps > 1 ? "s" : ""} par capture de fin de match.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map(([label, value]) => (
          <div key={label} className="border-l border-white/12 bg-white/[0.03] px-4 py-3.5">
            <dt className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</dt>
            <dd className="mt-1.5 font-display text-3xl font-black leading-none tabular-nums">{String(value).replace(".", ",")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
