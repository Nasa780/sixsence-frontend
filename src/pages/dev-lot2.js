import { useEffect, useState } from "react";
import { Reliability } from "../components/cod/Reliability";
import { ChallengeButton, ChallengesPanel } from "../components/teams/Challenges";
import { Container } from "../components/ui/Container";

const T = (id, name, tag, color) => ({ id, name, tag, color, logoUrl: null, points: 1100 });
const MEMBERS = ["Noxira", "Kael", "Vyrn", "Toxa", "Lumo"].map((username, i) => ({ id: `m${i}`, username, avatarUrl: null }));
const ME = { team: { ...T("t1", "SixSence", "SIX", "#d4af37"), members: MEMBERS } };
const CHALLENGES = {
  canManage: true,
  rosterSize: 4,
  incoming: [{ id: "c1", status: "pending", friendly: false, scheduledAt: new Date(Date.now() + 5 * 3600e3).toISOString(), message: "Revanche ?", from: T("t2", "Nexora", "NXR", "#8c6cf0"), to: ME.team }],
  outgoing: [{ id: "c2", status: "accepted", friendly: true, scheduledAt: new Date(Date.now() + 26 * 3600e3).toISOString(), message: null, from: ME.team, to: T("t3", "Vault", "VLT", "#3fbf7f") }],
  recent: [{ id: "c3", status: "played", friendly: true, matchId: "x", from: ME.team, to: T("t4", "Odin", "ODN", "#e06a3a") }],
};
const RELIABILITY = { score: 94, level: "excellent", details: { warnings: 1, forfeits: 0, corrected: 0, clean: 23 }, windowDays: 60 };

export default function DevLot2() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const original = window.fetch;
    window.fetch = (url, init) => {
      const u = String(url);
      const body = u.endsWith("/teams/me") ? ME : u.includes("/teams/me/challenges") ? CHALLENGES : u.includes("/reliability") ? RELIABILITY : null;
      return body ? Promise.resolve(new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } })) : original(url, init);
    };
    setReady(true);
  }, []);
  if (!ready) return null;
  return (
    <Container className="space-y-14 py-28">
      <Reliability playerId="00000000-0000-0000-0000-000000000000" />
      <div className="flex gap-3">
        <ChallengeButton target={T("t2", "Nexora", "NXR", "#8c6cf0")} />
      </div>
      <ChallengesPanel />
    </Container>
  );
}
