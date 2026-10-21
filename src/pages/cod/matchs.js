import Head from "next/head";
import { useEffect, useState } from "react";
import { MatchesView, fromRanked, fromTeam } from "../../components/cod/MyMatches";
import { Container } from "../../components/ui/Container";
import { Loading } from "../../components/ui/Feedback";
import { LoginPrompt } from "../../components/ui/LoginPrompt";
import { PageHeader } from "../../components/ui/Typography";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { supabase } from "../../lib/supabase";

/**
 * Mes matchs : tous les matchs du joueur connecté au même endroit (Classé, Division, coupes), match en
 * cours en tête, chiffres de la saison, filtres, historique groupé par jour. Connexion Discord requise.
 */
export default function MyMatchesPage() {
  const { userId, loading } = useSession();
  const { active } = useSeasons();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    Promise.all([
      supabase.rpc("cod_matches_for", { p_user: userId, p_limit: 100 }),
      MATCH_TEAM_ENABLED ? api(`/teams/players/${userId}/matches`).catch(() => ({ matches: [] })) : Promise.resolve({ matches: [] }),
    ]).then(([ranked, team]) => {
      if (!alive) return;
      const all = [...(ranked.data || []).map((m) => fromRanked(m, userId)), ...(team.matches || []).map(fromTeam)];
      setRows(all.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <>
      <Head>
        <title>Mes matchs — SixSence</title>
      </Head>
      <PageHeader
        eyebrow="MW4 · Mes matchs"
        title={
          <>
            Mes <span className="text-gold-gradient">matchs</span>
          </>
        }
        description="Classé, Division et coupes : ton match en cours et tout ton historique au même endroit."
      />
      <Container className="space-y-10 py-12">
        {loading || (userId && rows === null) ? <Loading /> : null}
        {!loading && !userId ? <LoginPrompt title="Connecte-toi pour voir tes matchs" text="Ton historique est lié à ton compte Discord." next="/cod/matchs" /> : null}
        {rows ? <MatchesView rows={rows} seasonStart={active?.starts_at ? new Date(active.starts_at).getTime() : 0} /> : null}
      </Container>
    </>
  );
}
