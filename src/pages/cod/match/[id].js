import { useRouter } from "next/router";
import MatchRoom from "../../../components/site/MatchRoom";
import PageShell from "../../../components/site/PageShell";

/** Salle de match COD : /cod/match/<identifiant du match>. */
export default function MatchPage() {
  const { query, isReady } = useRouter();
  const matchId = typeof query.id === "string" ? query.id : null;

  return (
    <PageShell active="ranked" title="Match" width={1320}>
      {isReady && matchId && <MatchRoom matchId={matchId} />}
    </PageShell>
  );
}
