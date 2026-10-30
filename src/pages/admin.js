import Head from "next/head";
import { useRouter } from "next/router";
import { CasesPanel, DisputesPanel, OverviewPanel, PlayersPanel, SeasonPanel } from "../components/admin/AdminPanels";
import { CrudPanel } from "../components/admin/CrudPanel";
import { CorrectionsPanel, MatchesPanel } from "../components/admin/MatchesPanels";
import { SanctionsPanel } from "../components/admin/Sanctions";
import { TeamsPanel } from "../components/admin/TeamsPanel";
import { TournamentPanel } from "../components/admin/TournamentPanel";
import { EVENTS, FOUNDERS, PARTNERS } from "../components/admin/contentConfigs";
import { Container } from "../components/ui/Container";
import { EmptyState, Loading } from "../components/ui/Feedback";
import { LoginPrompt } from "../components/ui/LoginPrompt";
import { PageHeader } from "../components/ui/Typography";
import useSession from "../hooks/useSession";
import useUser from "../hooks/useUser";
import { cn } from "../lib/cn";
import { MATCH_TEAM_ENABLED } from "../lib/config";
import { ROLE_LABELS, isModerator, isReferee } from "../lib/roles";

/** Onglets et rôles qui y ont accès (sans « roles » : admin uniquement). */
const REFEREES = ["admin", "staff", "arbitre"];
const MODERATORS = ["admin", "staff"];
const ALL_TABS = [
  { key: "overview", label: "Tableau de bord", roles: REFEREES },
  { key: "disputes", label: "Contestations", roles: REFEREES },
  { key: "arbitrages", label: "Arbitrages", roles: REFEREES },
  { key: "matchs", label: "Matchs", roles: REFEREES },
  { key: "corrections", label: "Corrections" },
  { key: "signalements", label: "Signalements", roles: MODERATORS },
  { key: "sanctions", label: "Sanctions", roles: MODERATORS },
  ...(MATCH_TEAM_ENABLED ? [{ key: "equipes", label: "Équipes", roles: MODERATORS }] : []),
  { key: "players", label: "Joueurs" },
  { key: "events", label: "Événements GTA 6" },
  { key: "founders", label: "Fondateurs" },
  { key: "partners", label: "Partenaires" },
  ...(MATCH_TEAM_ENABLED ? [{ key: "tournoi", label: "Tournoi" }] : []),
  { key: "season", label: "Saison" },
];

/**
 * Administration de l'équipe : onglets selon le rôle (admin, staff, arbitre), droits
 * vérifiés aussi par le backend sur chaque route.
 * L'onglet actif vit dans l'adresse (?onglet=joueurs) pour pouvoir partager un lien.
 */
export default function AdminPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const user = useUser();
  const TABS = ALL_TABS.filter((item) => (item.roles ?? ["admin"]).includes(user?.role));
  const tab = TABS.some((item) => item.key === router.query.onglet) ? router.query.onglet : "overview";

  const go = (key) => router.replace({ pathname: "/admin", query: key === "overview" ? {} : { onglet: key } }, undefined, { shallow: true, scroll: false });

  let content;
  if (loading || (session && !user)) content = <Loading />;
  else if (!session) content = <LoginPrompt next="/admin" />;
  else if (!isReferee(user.role)) content = <EmptyState title="Accès réservé">Cette page est réservée à l&apos;équipe SixSence.</EmptyState>;
  else
    content = (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Sections de l'administration" className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-l-2 px-4 py-2.5 text-left font-display text-base font-bold uppercase tracking-[0.1em] transition-colors",
                tab === item.key ? "border-gold bg-gold/10 text-gold" : "border-transparent text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <section aria-label={TABS.find((item) => item.key === tab).label}>
          {user.role !== "admin" ? (
            <p className="mb-5 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
              Rôle : <span className="text-gold">{ROLE_LABELS[user.role]}</span>
              {isModerator(user.role) ? MATCH_TEAM_ENABLED ? " · contestations, arbitrages, signalements, sanctions et équipes" : " · contestations, arbitrages, signalements et sanctions" : " · contestations et arbitrages"}
            </p>
          ) : null}
          {tab === "overview" ? <OverviewPanel onNavigate={go} role={user.role} /> : null}
          {tab === "disputes" ? <DisputesPanel /> : null}
          {tab === "arbitrages" ? <CasesPanel key="arbitrations" kind="arbitrations" /> : null}
          {tab === "matchs" ? <MatchesPanel /> : null}
          {tab === "corrections" ? <CorrectionsPanel /> : null}
          {tab === "signalements" ? <CasesPanel key="reports" kind="reports" /> : null}
          {tab === "sanctions" ? <SanctionsPanel /> : null}
          {tab === "equipes" ? <TeamsPanel /> : null}
          {tab === "players" ? <PlayersPanel currentUserId={user.id} isAdmin={user.role === "admin"} /> : null}
          {tab === "events" ? <CrudPanel key="events" config={EVENTS} /> : null}
          {tab === "founders" ? <CrudPanel key="founders" config={FOUNDERS} /> : null}
          {tab === "partners" ? <CrudPanel key="partners" config={PARTNERS} /> : null}
          {tab === "tournoi" ? <TournamentPanel /> : null}
          {tab === "season" ? <SeasonPanel /> : null}
        </section>
      </div>
    );

  return (
    <>
      <Head>
        <title>Administration — SixSence</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageHeader
        eyebrow="Équipe"
        title={
          <>
            Admini<span className="text-gold-gradient">stration</span>
          </>
        }
        description="Contestations, signalements, sanctions, joueurs, contenus du site et saisons."
      />
      <Container className="py-12">{content}</Container>
    </>
  );
}
