import { CircuitView } from "./cod/circuit";

// Aperçu (non commité) : circuit avec des données d'exemple.
const T = (id, name, tag, color) => ({ id, name, tag, color, logoUrl: null, disbanded: false });
const rows = [
  [T("1", "Vortex", "VTX", "#d4af37"), 285, 4, { winner: 2, finalist: 1, third: 0 }],
  [T("2", "Kaizen", "KZN", "#22d3ee"), 240, 4, { winner: 1, finalist: 1, third: 1 }],
  [T("3", "Nexora", "NXR", "#9b7bff"), 205, 3, { winner: 1, finalist: 0, third: 1 }],
  [T("4", "Ronin", "RNN", "#e5484d"), 170, 4, { winner: 0, finalist: 2, third: 0 }],
  [T("5", "Sphinx", "SPH", "#34d399"), 135, 3, { winner: 0, finalist: 0, third: 2 }],
  [T("6", "Osiris", "OSR", "#f59e0b"), 115, 2, { winner: 0, finalist: 1, third: 0 }],
  [T("7", "Apex", "APX", "#ec4899"), 85, 3, { winner: 0, finalist: 0, third: 1 }],
  [T("8", "Legion", "LGN", "#60a5fa"), 45, 3, { winner: 0, finalist: 0, third: 0 }],
];
const day = (d) => new Date(Date.now() + d * 86_400_000).toISOString();
const DATA = {
  points: { winner: 100, finalist: 70, third: 50, present: 15 },
  finalSize: 8,
  circuitSpots: 6,
  divisionSpots: 2,
  final: null,
  cups: [
    { id: "c1", name: "Coupe Horus #1", status: "completed", startsAt: day(-14), winner: "Vortex" },
    { id: "c2", name: "Coupe Horus #2", status: "completed", startsAt: day(-7), winner: "Kaizen" },
    { id: "c3", name: "Coupe Horus #3", status: "scheduled", startsAt: day(3), winner: null },
  ],
  standings: rows.map(([team, points, cups, podiums]) => ({ team, points, cups, podiums })),
};

export default function DevCircuit2() {
  return (
    <div data-univers="tournoi">
      <CircuitView data={DATA} />
    </div>
  );
}
