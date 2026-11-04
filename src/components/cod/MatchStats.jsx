import { useCallback, useEffect, useRef, useState } from "react";
import { LuCheck, LuFlag, LuImagePlus, LuLoaderCircle, LuTrash2, LuX } from "react-icons/lu";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { mapId } from "../../lib/maps";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

const HEAD = ["Score", "Élim.", "Poses", "Désam."];
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const PROOFS = {
  classe: { bucket: "match-proofs", route: (id) => `/cod/matches/${id}/proofs` },
  division: { bucket: "team-match-proofs", route: (id) => `/teams/matches/${id}/proofs` },
};

/** Empreinte de l'image : une même capture ne sert qu'une fois. */
async function fingerprint(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Image trop lourde : réduite en JPEG pour tenir dans les 5 Mo des preuves. */
async function shrink(file) {
  if (file.size <= MAX_BYTES && TYPES[file.type]) return file;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(new File([blob], "capture.jpg", { type: "image/jpeg" })), "image/jpeg", 0.85));
}

/** Garde l'image comme preuve, visible des joueurs du match et des arbitres. */
async function saveProof(kind, matchId, userId, source) {
  const file = await shrink(source);
  const path = `${matchId}/${userId}/${Date.now()}.${TYPES[file.type]}`;
  const { error } = await supabase.storage.from(PROOFS[kind].bucket).upload(path, file, { contentType: file.type });
  if (error) throw new Error("Envoi de l'image impossible. Réessaie dans un instant.");
  await api(PROOFS[kind].route(matchId), { method: "POST", body: { path } });
}

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

/** Pourquoi la capture ne peut pas être validée : autre map, ou joueurs du match absents. Null si tout va bien. */
function captureProblem(reading, usable, players, expectedMap, roundsToWin) {
  if (reading.midGame) return "Cette capture est prise en cours de partie : envoie le tableau de fin de match.";
  if (reading.mapSeen && expectedMap && mapId(reading.mapSeen) !== mapId(expectedMap)) return `Cette capture est sur ${reading.mapSeen}, ce match se joue sur ${expectedMap}.`;
  // Score de manches : aucune équipe à 8 (BO1) ou à 6 (BO3, BO5), la partie n'est pas finie.
  const [blue, orange] = reading.rounds ?? [];
  if (roundsToWin && blue != null && orange != null && blue !== roundsToWin && orange !== roundsToWin) return `Cette capture affiche ${blue}-${orange} : une map se gagne en ${roundsToWin} manches. Envoie le tableau de fin de partie.`;
  const found = new Set(usable.map((row) => row.userId));
  const covered = ["A", "B"].every((side) => {
    const team = players.filter((player) => player.side === side);
    const present = team.filter((player) => found.has(player.id)).length;
    return present >= 1 && present * 2 >= team.length;
  });
  return covered ? null : "On ne retrouve pas assez de joueurs de ce match sur cette capture.";
}

/** Résultat de la lecture : le joueur vérifie d'un coup d'œil et valide. Il ne tape rien. */
function Preview({ reading, players, expectedMap, roundsToWin, pending, onChoose, onConfirm, onCancel, onProofOnly }) {
  const usable = reading.rows.filter((row) => row.readable && row.userId);
  const free = players.filter((player) => !reading.rows.some((row) => row.userId === player.id));
  const unknown = reading.rows.filter((row) => row.readable && !row.userId);
  const unreadable = reading.rows.filter((row) => !row.readable).length;
  const problem = captureProblem(reading, usable, players, expectedMap, roundsToWin);

  return (
    <div className="space-y-4 border border-gold/30 bg-gold/[0.04] p-4">
      <p className="text-sm font-semibold text-white/85">Vérifie, puis valide.</p>
      <StatsTable rows={usable} players={players} />
      {unknown.map((row) => (
        <label key={`${row.column}-${row.score}-${row.kills}`} className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span>
            Joueur non reconnu ({row.score} pts, {row.kills} élim.) :
          </span>
          <select className="border border-white/15 bg-ink px-2 py-1.5 text-sm" value={row.userId ?? ""} onChange={(event) => onChoose(row, event.target.value)}>
            <option value="">Choisir…</option>
            {free.map((player) => (
              <option key={player.id} value={player.id}>{player.username}</option>
            ))}
          </select>
        </label>
      ))}
      {unreadable ? <p className="text-xs text-white/50">{unreadable > 1 ? `${unreadable} lignes illisibles ne seront pas enregistrées.` : "Une ligne illisible ne sera pas enregistrée."}</p> : null}
      {problem ? <Notice tone="error">{problem}</Notice> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onConfirm} disabled={pending || Boolean(problem) || usable.length === 0}>
          {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
          Valider
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={pending}>
          <LuX aria-hidden className="h-4 w-4" />
          Annuler
        </Button>
        {problem ? (
          <button type="button" onClick={onProofOnly} disabled={pending} className="px-2 text-xs text-white/50 underline underline-offset-4 hover:text-white">
            Garder seulement comme preuve
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Capture de fin de match, seul endroit où déposer une image : le site la lit dans le navigateur (lib/scoreboard.js),
 * le joueur valide d'un clic, les stats sont enregistrées et l'image gardée comme preuve. Illisible : preuve seule.
 * Les stats s'affichent à la fin du match. `kind` : classe ou division ; `status` : relit à chaque changement du match.
 */
export function MatchStats({ kind, matchId, status = null, initial = null }) {
  const user = useUser();
  const [data, setData] = useState(initial);
  const [mapNo, setMapNo] = useState(1);
  const [reading, setReading] = useState(null);
  const [file, setFile] = useState(null);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [pending, setPending] = useState(false);
  const [reported, setReported] = useState(false);
  const input = useRef(null);

  const load = useCallback(() => {
    if (initial) return;
    api(`/cod/stats/${kind}/${matchId}`).then(setData, () => setData(null));
  }, [kind, matchId, initial]);
  useEffect(load, [load, status, user?.id]);

  if (!data) return null;
  const mapRows = (no) => data.rows.filter((row) => row.mapNo === no);
  const allMaps = Array.from({ length: data.maps }, (_, index) => index + 1);
  const missingMaps = allMaps.filter((no) => !data.sentMaps.includes(no));
  if (data.rows.length === 0 && !data.canSubmit) return null;
  const target = missingMaps.includes(mapNo) ? mapNo : missingMaps[0];
  const nothingYet = data.sentMaps.length === 0;
  // BO3, BO5 : la map lue sur la capture désigne la map du match, sans rien choisir.
  const seenIndex = reading?.mapSeen ? data.mapNames.findIndex((name) => mapId(name) === mapId(reading.mapSeen)) + 1 : 0;
  const readingMap = missingMaps.includes(seenIndex) ? seenIndex : target;

  function reset() {
    setReading(null);
    setFile(null);
    setFailed(false);
  }

  async function pick(event) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    reset();
    setError(null);
    setNotice(null);
    setFile(chosen);
    setProgress("Lecture de la capture…");
    try {
      const { readScoreboard } = await import("../../lib/scoreboard");
      const result = await readScoreboard(chosen, data.players, setProgress);
      if (result?.rows.length) setReading(result);
      else setFailed(true);
    } catch {
      setFailed(true);
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
      const hash = await fingerprint(file);
      setData(await api(`/cod/stats/${kind}/${matchId}`, { method: "POST", body: { mapNo: readingMap, rows, hash } }));
      await saveProof(kind, matchId, user.id, file).catch(() => setNotice("Stats enregistrées, mais l'image n'a pas pu être gardée comme preuve."));
      reset();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  async function proofOnly() {
    setPending(true);
    setError(null);
    try {
      await saveProof(kind, matchId, user.id, file);
      setNotice("Image gardée comme preuve, sans stats.");
      reset();
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
    <TacticalCard cut={18} highlight={data.canSubmit && nothingYet} innerClassName="space-y-5 p-5 sm:p-6">
      <div>
        <Eyebrow>Capture de fin de match</Eyebrow>
        {data.canSubmit && nothingYet ? <p className="mt-2 font-display text-2xl font-black uppercase leading-none">Ajoute ta capture pour tes stats</p> : null}
        <p className="mt-2 text-sm text-white/55">
          {data.canSubmit && nothingYet ? "Le tableau des scores en plein écran : les chiffres se remplissent tout seuls." : "Score, éliminations, poses et désamorçages, lus sur la capture."}
        </p>
      </div>

      {allMaps
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

      {!data.completed && data.sentMaps.length > 0 ? <p className="text-sm text-white/60">Capture enregistrée. Les stats s&apos;afficheront à la fin du match.</p> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice>{notice}</Notice> : null}

      {failed ? (
        <div className="space-y-3 border border-white/15 bg-white/[0.03] p-4">
          <p className="text-sm text-white/70">Tableau des scores introuvable sur cette image. Pour tes stats, envoie la capture en plein écran.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={proofOnly} disabled={pending}>
              {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Garder seulement comme preuve
            </Button>
            <Button size="sm" variant="outline" onClick={reset} disabled={pending}>
              Annuler
            </Button>
          </div>
        </div>
      ) : null}

      {reading ? (
        <Preview
          reading={reading}
          players={data.players}
          expectedMap={data.mapNames[readingMap - 1]}
          roundsToWin={data.roundsToWin}
          pending={pending}
          onChoose={choose}
          onConfirm={confirm}
          onCancel={reset}
          onProofOnly={proofOnly}
        />
      ) : null}

      {!reading && !failed && data.canSubmit && missingMaps.length ? (
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

      {data.canReport ? (
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
