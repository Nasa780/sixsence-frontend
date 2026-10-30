import { PlayerInsights } from "../components/cod/PlayerInsights";
import { MapScoreChips } from "../components/teams/TeamMatchHistory";
import { TeamTrophyCase } from "../components/teams/TeamTrophyCase";
import { Container } from "../components/ui/Container";
import { CircuitView } from "./cod/circuit";

// Page de démonstration (non commitée) : vrais composants du lot 2 avec des données d'exemple.
const team = (id, name, tag, color) => ({ id, name, tag, color, logoUrl: null });
const T = {
  vtx: team("t1", "Vortex", "VTX", "#22d3ee"),
  kzn: team("t2", "Kaizen", "KZN", "#f43f5e"),
  nxr: team("t3", "Nexora", "NXR", "#a78bfa"),
  orb: team("t4", "Orbit", "ORB", "#f59e0b"),
  hls: team("t5", "Helios", "HLS", "#facc15"),
  prd: team("t6", "Predators", "PRD", "#10b981"),
  sct: team("t7", "Scythe", "SCT", "#e5e7eb"),
  apx: team("t8", "Apex", "APX", "#60a5fa"),
};
const standings = Object.values(T).map((t, i) => ({ team: { ...t, disbanded: false }, points: 300 - i * 32, cups: 4 - (i % 3), podiums: { winner: i < 2 ? 2 - i : 0, finalist: i === 2 ? 1 : 0, third: i === 3 ? 1 : 0 } }));
const CIRCUIT = {
  season: { id: 1, name: "Saison 1", endsAt: null },
  points: { winner: 100, finalist: 70, third: 50, present: 15 },
  finalSize: 8,
  circuitSpots: 6,
  divisionSpots: 2,
  final: null,
  cups: [
    { id: "c1", name: "Coupe Horus #1", status: "completed", startsAt: "2026-10-04T19:00:00Z", winner: "Vortex" },
    { id: "c2", name: "Coupe Horus #2", status: "completed", startsAt: "2026-10-11T19:00:00Z", winner: "Kaizen" },
    { id: "c3", name: "Coupe Horus #3", status: "scheduled", startsAt: "2026-11-01T20:00:00Z", winner: null },
  ],
  standings,
  playIn: {
    id: null,
    status: "projected",
    startsAt: null,
    projected: true,
    pairs: [
      { a: T.sct, b: team("d2", "Ronin", "RNN", "#fb923c"), winner: null, status: "pending", matchId: null },
      { a: T.apx, b: team("d1", "Titans", "TTN", "#38bdf8"), winner: null, status: "pending", matchId: null },
    ],
  },
};
const INSIGHTS = {
  ranks: {},
  ratio: { last30: null, last30Played: 0, overall: null, overallPlayed: 0 },
  opponents: [],
  teammates: [],
  headToHead: null,
  activity: {},
  teams: [
    { ...T.vtx, disbanded: false, current: true, role: "leader", since: "2026-10-12T18:00:00Z", until: null, leftReason: null, exact: true, played: 38, trophies: 2 },
    { ...T.nxr, disbanded: false, current: false, role: "player", since: "2026-09-21T18:00:00Z", until: "2026-10-10T18:00:00Z", leftReason: "left", exact: true, played: 14, trophies: 0 },
    { ...T.orb, disbanded: true, current: false, role: null, since: "2026-09-02T18:00:00Z", until: "2026-09-19T18:00:00Z", leftReason: "disbanded", exact: false, played: 6, trophies: 0 },
  ],
};
const TROPHIES = [
  ["or", 3],
  ["argent", 1],
  ["bronze", 2],
].flatMap(([place, n]) => Array.from({ length: n }, (_, i) => ({ tournamentId: `${place}${i}`, name: `Coupe Horus #${i + 1}`, place, date: `2026-10-0${i + 1}T20:00:00Z`, kind: "horus" })));

export default function DevLot3() {
  return (
    <>
      <div data-univers="tournoi">
        <CircuitView data={CIRCUIT} />
      </div>
      <Container className="space-y-12 pb-20">
        <div data-univers="division" className="space-y-3">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Historique · score des maps</p>
          <MapScoreChips
            scores={[
              { map: "Lotus", for: 6, against: 3 },
              { map: "Coal", for: 4, against: 6 },
              { map: "transit-213", for: 6, against: 2 },
            ]}
          />
        </div>
        <TeamTrophyCase trophies={TROPHIES} />
        <PlayerInsights playerId="demo" initialData={INSIGHTS} />
      </Container>
    </>
  );
}
