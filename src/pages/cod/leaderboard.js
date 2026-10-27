import Head from "next/head";
import { useState } from "react";
import { LeaderboardView } from "../../components/cod/LeaderboardView";
import { RanksGrid } from "../../components/cod/RanksGrid";
import { SeasonArchive } from "../../components/cod/SeasonArchive";
import { SeasonCountdown } from "../../components/cod/SeasonCountdown";
import { SeasonRewards } from "../../components/cod/SeasonRewards";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { PageHeader } from "../../components/ui/Typography";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { cn } from "../../lib/cn";
import { rankFor } from "../../lib/ranks";
import { MATCH_TEAM_ENABLED } from "../../lib/config";

/** Classement COD complet, en direct, avec les archives des saisons passées. Public. */
export default function LeaderboardPage() {
  const { userId } = useSession();
  const user = useUser();
  const { seasons, label, active } = useSeasons();
  const [selected, setSelected] = useState("live");

  const past = (seasons || []).filter((season) => !season.is_active);
  const archived = past.find((season) => String(season.id) === selected);

  return (
    <>
      <Head>
        <title>{MATCH_TEAM_ENABLED ? "Classement des joueurs — SixSence" : "Classement COD — SixSence"}</title>
        <meta name="description" content="Classement en direct du classé Call of Duty de SixSence : points, rangs, victoires et archives des saisons." />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow={label}
        title={
          <>
            Classement <span className="text-gold-gradient">{MATCH_TEAM_ENABLED ? "joueurs" : "COD"}</span>
          </>
        }
        description="Les meilleurs joueurs du classé Call of Duty, mis à jour en direct après chaque match confirmé."
        actions={<ButtonLink href="/cod/ranked">Rejoindre la file</ButtonLink>}
      />
      <Container className="space-y-20 py-12">
        <div>
          {past.length > 0 ? (
            <div role="tablist" aria-label="Saison affichée" className="mb-8 flex flex-wrap gap-2">
              <SeasonTab active={selected === "live"} onClick={() => setSelected("live")}>
                {label} · en cours
              </SeasonTab>
              {past.map((season) => (
                <SeasonTab key={season.id} active={selected === String(season.id)} onClick={() => setSelected(String(season.id))}>
                  {season.name}
                </SeasonTab>
              ))}
            </div>
          ) : null}
          {archived ? null : <SeasonCountdown mode="classe" />}
          {archived ? <SeasonArchive season={archived} currentUserId={userId} /> : <LeaderboardView limit={200} currentUserId={userId} />}
        </div>
        {archived ? null : <SeasonRewards seasonId={active?.id} label={label} />}
        <RanksGrid highlight={user?.profile ? rankFor(user.profile.points).name : null} />
      </Container>
    </>
  );
}

function SeasonTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "clip-slant px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors",
        active ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
