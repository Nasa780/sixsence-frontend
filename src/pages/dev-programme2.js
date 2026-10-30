import { SchedulePanel } from "../components/teams/SchedulePanel";
import { Container } from "../components/ui/Container";

// Aperçu (non commité) : match programmé (choix du créneau, puis match programmé).
const TEAM = { id: "t1", name: "Vortex", tag: "VTX", color: "#22d3ee", members: [{ id: "a", username: "N0xira" }, { id: "b", username: "Sorrow" }, { id: "c", username: "Kenzo" }, { id: "d", username: "Rift" }] };
const slot = new Date(Math.ceil((Date.now() + 3 * 3600_000) / 900_000) * 900_000).toISOString();

export default function DevProgramme2() {
  return (
    <div data-univers="division">
      <Container className="grid gap-6 pb-16 pt-28 lg:grid-cols-2">
        <SchedulePanel team={TEAM} isLeader play={{ rosterSize: 4, scheduled: null }} chosen={["a", "b", "c", "d"]} pending={false} onSchedule={() => {}} onCancel={() => {}} />
        <SchedulePanel team={TEAM} isLeader play={{ rosterSize: 4, scheduled: { slot, roster: ["a", "b", "c", "d"], revealAt: new Date(new Date(slot).getTime() - 300_000).toISOString() } }} chosen={[]} pending={false} onSchedule={() => {}} onCancel={() => {}} />
      </Container>
    </div>
  );
}
