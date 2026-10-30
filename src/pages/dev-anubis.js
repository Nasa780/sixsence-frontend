import { useEffect, useState } from "react";
import { AnubisCup } from "../components/tournament/AnubisCup";
import { Container } from "../components/ui/Container";

const NAMES = ["Noxira", "Kael", "Vyrn", "Toxa", "Lumo", "Rhea", "Onder", "Mako", "Sly", "Zed", "Iris", "Bako", "Fenrir", "Nyx", "Orion", "Talon", "Vega", "Ash", "Kira"];
const players = NAMES.map((username, i) => ({ id: `p${i}`, username, avatarUrl: null, points: 1800 - i * 70, checkedIn: i < 13 }));
const team = (i, name, tag, color) => ({ id: `t${i}`, name, tag, color, logoUrl: null, seed: i + 1 });
const TEAMS = [team(0, "Scarabée", "SCA", "#e7c05a"), team(1, "Sphinx", "SPH", "#d9a441"), team(2, "Chacal", "CHA", "#8c6cf0"), team(3, "Cobra", "COB", "#3fbf7f")];
const squads = TEAMS.map((t, i) => ({
  team: t,
  captain: `p${i * 4}`,
  forfeit: false,
  starters: players.slice(i * 4, i * 4 + 4),
  subs: i < 3 ? [players[16 + i]] : [],
}));
const entry = (slot, a, b, status, winner = null, score = null) => ({ id: slot, slot, teamA: a, teamB: b, status, winner, matchId: status === "playing" ? "m1" : null, score });

const base = {
  id: "x",
  kind: "anubis",
  name: "Coupe Anubis · Le Jugement",
  size: 8,
  teamSize: 4,
  capacity: 40,
  bestOf: 1,
  finalBestOf: 3,
  bracket: "single",
  startsAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
  checkInOpensAt: new Date(Date.now() + 2.5 * 3600e3).toISOString(),
  registered: 19,
  checkedInCount: 13,
  players,
  squads: [],
  teams: [],
  rounds: [],
  losers: null,
  grandFinal: null,
  thirdPlace: null,
};

const STATES = {
  inscriptions: { ...base, status: "scheduled", viewer: { solo: true, registered: true, checkedIn: false, canUnregister: true, canCheckIn: false } },
  "en-cours": {
    ...base,
    status: "running",
    squads,
    viewer: { solo: true, teamId: "t1", isCaptain: true, canSetRoster: true },
    rounds: [
      { round: 1, name: "Demi-finales", bestOf: 1, entries: [entry(1, TEAMS[0], TEAMS[3], "done", "t0", [1, 0]), entry(2, TEAMS[1], TEAMS[2], "playing")] },
      { round: 2, name: "Finale", bestOf: 3, entries: [entry(1, TEAMS[0], null, "pending")] },
    ],
    thirdPlace: { name: "Petite finale", bestOf: 1, entry: entry(1, TEAMS[3], null, "pending") },
  },
  terminee: { ...base, status: "completed", squads, winner: TEAMS[1], finalist: TEAMS[0], third: TEAMS[3], viewer: null, rounds: [] },
};

export default function DevAnubis() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState("inscriptions");
  const [now, setNow] = useState(0);
  useEffect(() => {
    setReady(true);
    setNow(Date.now());
    const params = new URLSearchParams(window.location.search);
    if (params.get("etat")) setState(params.get("etat"));
  }, []);
  if (!ready) return null;
  return (
    <Container className="space-y-6 py-28">
      <AnubisCup
        tournament={STATES[state]}
        userId="p6"
        now={now}
        countdown={() => "2:28:14"}
        onDone={() => {}}
        bracket={<div className="border border-dashed border-white/15 p-6 text-sm text-white/40">(tableau habituel de la coupe)</div>}
      />
    </Container>
  );
}
