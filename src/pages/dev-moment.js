import { RightNow } from "../components/home/RightNow";

// Aperçu (non commité) : « En ce moment » avec des données d'exemple.
const DATA = {
  podiums: {
    classe: [
      { id: "a", username: "N0xira", points: 2140 },
      { id: "b", username: "Sorrow", points: 1980 },
      { id: "c", username: "Kenzo", points: 1912 },
    ],
    division: [
      { id: "t1", name: "Vortex", tag: "VTX", points: 1284 },
      { id: "t2", name: "Kaizen", tag: "KZN", points: 1251 },
    ],
  },
  nextCup: { id: "x", kind: "horus", name: "Coupe Horus", startsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(), bestOf: 3, registered: 5, capacity: 8, unit: "équipes" },
  records: {
    mostMatchesToday: { id: "b", username: "Sorrow", value: 9 },
    longestStreak: { id: "a", username: "N0xira", value: 7 },
    mostActiveTeam: { team: { id: "t2", name: "Kaizen", tag: "KZN" }, value: 21 },
  },
};

export default function DevMoment() {
  return (
    <div className="pt-28">
      <RightNow initialData={DATA} />
    </div>
  );
}
