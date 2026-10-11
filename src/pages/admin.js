import Head from "next/head";
import { useRouter } from "next/router";
import { DisputesPanel, OverviewPanel, PlayersPanel, SeasonPanel } from "../components/admin/AdminPanels";
import { CrudPanel } from "../components/admin/CrudPanel";
import { EVENTS, FOUNDERS, PARTNERS } from "../components/admin/contentConfigs";
import { Container } from "../components/ui/Container";
import { EmptyState, Loading } from "../components/ui/Feedback";
import { LoginPrompt } from "../components/ui/LoginPrompt";
import { PageHeader } from "../components/ui/Typography";
import useSession from "../hooks/useSession";
import useUser from "../hooks/useUser";
import { cn } from "../lib/cn";

const TABS = [
  { key: "overview", label: "Tableau de bord" },
  { key: "disputes", label: "Contestations" },
  { key: "players", label: "Joueurs" },
  { key: "events", label: "Événements GTA 6" },
  { key: "founders", label: "Fondateurs" },
  { key: "partners", label: "Partenaires" },
  { key: "season", label: "Saison" },
];

/**
 * Administration : réservée au rôle admin (vérifié aussi par le backend sur chaque route).
 * L'onglet actif vit dans l'adresse (?onglet=joueurs) pour pouvoir partager un lien.
 */
export default function AdminPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const user = useUser();
  const tab = TABS.some((item) => item.key === router.query.onglet) ? router.query.onglet : "overview";

  const go = (key) => router.replace({ pathname: "/admin", query: key === "overview" ? {} : { onglet: key } }, undefined, { shallow: true, scroll: false });

  let content;
  if (loading || (session && !user)) content = <Loading />;
  else if (!session) content = <LoginPrompt next="/admin" />;
  else if (user.role !== "admin") content = <EmptyState title="Accès réservé">Cette page est réservée à l&apos;équipe SixSence.</EmptyState>;
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
          {tab === "overview" ? <OverviewPanel onNavigate={go} /> : null}
          {tab === "disputes" ? <DisputesPanel /> : null}
          {tab === "players" ? <PlayersPanel currentUserId={user.id} /> : null}
          {tab === "events" ? <CrudPanel key="events" config={EVENTS} /> : null}
          {tab === "founders" ? <CrudPanel key="founders" config={FOUNDERS} /> : null}
          {tab === "partners" ? <CrudPanel key="partners" config={PARTNERS} /> : null}
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
        description="Contestations, joueurs, contenus du site et saisons."
      />
      <Container className="py-12">{content}</Container>
    </>
  );
}
