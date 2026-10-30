import { PlayerInsights } from "../components/cod/PlayerInsights";
import { MottoEditor, RecruitingBanner, RecruitingSettings, TeamStrength } from "../components/teams/TeamExtras";
import { MemberRow } from "../components/teams/TeamParts";
import { Container } from "../components/ui/Container";

// Aperçu (non commité) : étape 2 avec des données d'exemple.
const activity = {};
for (let i = 0; i < 90; i += 1) {
  const n = [0, 1, 3, 0, 2, 5, 4, 0, 6, 2][i % 10];
  if (n) activity[new Date(Date.now() - i * 86_400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })] = n;
}
const DATA = {
  ranks: { played: { value: 214, place: 12 }, wins: { value: 146, place: 4 }, rate: { value: 68, place: 3 }, bestStreak: { value: 11, place: 2 }, xp: { value: 148300, place: 9 }, players: 142 },
  ratio: { last30: 80, last30Played: 25, overall: 68, overallPlayed: 214 },
  opponents: [
    { id: "a", username: "Sorrow", played: 9, won: 7, lost: 2 },
    { id: "b", username: "Kenzo", played: 6, won: 2, lost: 4 },
    { id: "c", username: "Rift", played: 5, won: 4, lost: 1 },
  ],
  teammates: [{ id: "d", username: "Nyx", played: 8, won: 6, lost: 2 }],
  headToHead: { viewerWins: 2, viewerLosses: 7, together: 3, togetherWins: 2, last: new Date().toISOString() },
  activity,
  teams: [
    { id: "t1", name: "Vortex", tag: "VTX", color: "#d4af37", current: true, role: "leader", since: "2026-09-12T20:00:00Z", played: 18 },
    { id: "t2", name: "Kaizen", tag: "KZN", color: "#22d3ee", current: false, until: "2026-09-08T20:00:00Z", played: 12 },
    { id: "t3", name: "Ronin", tag: "RNN", color: "#e5484d", current: false, disbanded: true, until: "2026-06-20T20:00:00Z", played: 7 },
  ],
};
const TEAM = { id: "t1", recruiting: true, recruitingNote: "1 joueur, sniper, disponible le soir." };
const MEMBERS = [
  { id: "m1", username: "N0xira", points: 1842, role: "leader", crown: true, motto: "Le clutch, c'est un état d'esprit" },
  { id: "m2", username: "Sorrow", points: 1520, role: "leader", motto: "Toujours premier sur la bombe" },
  { id: "m3", username: "Rift", points: 980, role: "player", motto: null },
];

export default function DevEtape2() {
  return (
    <Container className="space-y-14 pb-16 pt-28">
      <PlayerInsights playerId="demo" initialData={DATA} />
      <div className="space-y-6">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Fiche d&apos;équipe (publique)</p>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-stretch">
          <RecruitingBanner team={TEAM} />
          <TeamStrength strength={{ value: 1905, position: 3, total: 41 }} />
        </div>
        <RecruitingBanner team={{ recruiting: false }} />
        <ul className="space-y-2">
          {MEMBERS.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Mon équipe (Leader)</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <RecruitingSettings team={TEAM} reload={() => {}} />
          <ul className="space-y-2">
            {MEMBERS.map((m) => (
              <MemberRow key={m.id} member={m}>
                <span className="w-full">
                  <MottoEditor team={TEAM} member={m} reload={() => {}} />
                </span>
              </MemberRow>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
